'use strict';

import { $, $copy, wait } from './utils';
import { newGame } from './game';
import CARDS from './cards';

const $deck = $('#deck');
const $players = $('#players');
const $status = $('#status');
const $arena = $('#arena');

const message = async str => {
	$status.textContent = str;
	$status.classList.add('message');
	await wait(1000);
	$status.classList.remove('message');
};

const startRenderer = game => {

	game.on('setup', () => { // render players
		$players.innerHTML = '';
		game.players.forEach(player => {
			let $player = $copy('#tmpl-player');
			$player.setAttribute('id', `player${player.uid}`);
			$('.playername', $player).textContent = `${player.name} (${player.type})`;
			$('.tokens', $player).textContent = `${player.tokens} tokens`;
			$players.appendChild($player);
		});
	});

	let resolvePickCard;

	game.on('redraw', async redrawCount => {
		await message(`Pick a card to redraw (${redrawCount + 1}/2)`);
		//enlargeHand();
		$('#skipredraw').style.display = 'block';
		resolvePickCard = card => {
			try {
				game.redraw(card);
				resolvePickCard = null;
				//shrinkHand();
				$('#skipredraw').style.display = 'none';
			} catch (e) {
				$status.textContent = e.message;
			}
		};
	});

	game.on('start-round', async startPlayer => {
		await message('Round start');
		if (startPlayer.type === 'human') {
			await message('You will go first');
		} else {
			await message('Opponent will go first');
		}
	});

	game.on('start-turn', async (activePlayer) => {
		game.players.forEach(player => {
			$(`#player${player.uid} .score`).textContent = `${player.score} miles`;
			$(`#player${player.uid}`).classList.toggle('active', player === activePlayer);
		});
		if (activePlayer.type === 'human') {
			await message('Your turn');
			$('#pass').style.display = 'block';
			resolvePickCard = async card => {
				try {
					console.log('trying to play', card);
					await game.play(card);
					resolvePickCard = null;
				} catch (e) {
					message(e.message);
				}
			};
		} else {
			await message('Opponent\'s turn');
		}
	});

	game.on('pass', async player => {
		if (player.type === 'human') {
			await message('You have passed');
		} else {
			await message('Opponent has passed');
		}
	});

	game.on('revive', async () => {
		await message('Pick a card to immediately play');
		//enlargeDiscard();
		resolvePickCard = card => {
			if (game.revive(card)) {
				//shrinkDiscard()
			}
		};
	});

	game.on('end-round', (winner, gameEnd) => {
		game.players.forEach(player => {
			$(`#player${player.uid} .tokens`).textContent = `${player.tokens} tokens`;
			$(`#player${player.uid}`).classList.remove('active');
		});
		message(`${winner.type === 'human' ? 'You' : 'Your Opponent'} won the ${gameEnd ? 'game' : 'round'}`);
	});


	let zIndex = 40;
	game.on('card-moved', async (card, from, to) => {
		let $card = renderCard(card);
		$card.style.zIndex = zIndex++;
		if (to.pile === 'discard') {
			let moveToMiddle = from.pile === 'hand';
			if (moveToMiddle) {
				$card.style.transform = `translate(280px, 280px) scale(3)`;
				setTimeout(() => {
					$card.classList.add('discarded');
					setTimeout(() => $arena.removeChild($card), 1000);
				}, 1000);
			} else {
				$card.classList.add('discarded');
				setTimeout(() => $arena.removeChild($card), 1000);
			}
		}
		
		game.players.forEach(player => {
			fanCards($(`#player${player.uid} .hand`), player.hand);
			fanCards($(`#player${player.uid} .journey-area`), player.journey);
			fanCards($(`#player${player.uid} .protection-area`), player.protection);
			fanCards($(`#player${player.uid} .sabotage-area`), player.sabotage);
		});
		await wait(100);
	});

	game.on('status', msg => $status.textContent = msg);

	$('#skipredraw').addEventListener('click', () => {
		if (resolvePickCard) {
			resolvePickCard();
		}
	});
	$('#pass').addEventListener('click', () => {
		if (resolvePickCard) {
			resolvePickCard();
		}
	});

	const fanCards = ($pile, cards) => { // spread cards as a fan
		let cardWidth = $('.card').offsetWidth,
			coords = getCoords($pile),
			width = Math.min(cardWidth * cards.length, $pile.offsetWidth),
			x = coords.x + $pile.offsetWidth / 2 - width / 2,
			offset = width / (cards.length);
		
		if (offset < cardWidth) {
			offset -= (cardWidth - ($pile.offsetWidth / cards.length)) / cards.length;
		}

		cards.forEach((card, i) => {
			renderCard(card).style.transform = `translate(${x + i * offset}px, ${coords.y}px)`;
		});
	};

	const renderCard = card => {
		let $card = $(`#card${card.uid}`);
		if (!$card) {
			$card = $copy('#tmpl-card');
			$card.setAttribute('id', `card${card.uid}`);
			$('img', $card).src = `/cards/${card.id}-sm.png`;
			$card.addEventListener('click', () => {
				if (resolvePickCard) {
					resolvePickCard(card);
				}
			});
			let { x, y } = getCoords($deck);
			$card.style.transform = `translate(${x}px, ${y}px)`;
			$arena.appendChild($card);
		}
		return $card;
	};
};

// get position of an element relative to the arena
const getCoords = ($el) => {
	let c1 = $arena.getBoundingClientRect(),
		c2 = $el.getBoundingClientRect();
	return {
		x: c2.x - c1.x,
		y: c2.y - c1.y
	};
};

const moveCardOld = ($card, $newArea, newX, newY, enlarge) => {
	if ($card.parentElement === $newArea) { return; }
	let $origin = $card.parentElement ? $card : $deck;
	let { x, y } = $origin.getBoundingClientRect();
	x -= $arena.getBoundingClientRect().x;
	y -= $arena.getBoundingClientRect().y;
	$card.style.transform = `translate(${x}px, ${y}px)`;
	
	setTimeout(() => { // wait so that animation will work
		if ($newArea) {
			let dimA = $arena.getBoundingClientRect(),
				dimB = $newArea.getBoundingClientRect();
			newX = -dimA.x + dimB.x;
			newY = -dimA.y + dimB.y;
		}
		$card.style.transform = `translate(${newX}px, ${newY}px)` + (enlarge ? ` scale(2.6)` : '');
	});
	setTimeout(() => { // wait until animation ends
		if ($newArea) {
			$newArea.appendChild($card);
			$card.style.transform = `none`;
		}
	}, 1000);
};

const burnCard = ($card, moveToMiddle) => {
	console.log('-- discard', moveToMiddle)
	if ($card.classList.contains('discarded')) { return; }
	if (moveToMiddle) {
		moveCard($card, null, 400, 400, true);
		setTimeout(() => {
			$card.classList.add('discarded');
			setTimeout(() => {
				$card.parentElement.removeChild($card);
			}, 1000);
		}, 1000);
	} else {
		$card.classList.add('discarded');
		setTimeout(() => {
			$card.parentElement.removeChild($card);
		}, 1000);
	}
};

const renderHelp = () => {
	$('#dlg-help').style.display = 'block';
	let $cards = $('#all-cards');
	CARDS.forEach(card => {
		let $card = renderCard(card);
		$cards.appendChild($card);
	});
};

$('#play').addEventListener('click', () => {
	$('#dlg-intro').style.display = 'none';
	let game = newGame();
	startRenderer(game);
	game.start();
});

$('#help').addEventListener('click', () => {
	$('#dlg-intro').style.display = 'none';
	renderHelp();
});

$('#play').click();