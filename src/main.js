'use strict';

import { $, $copy, wait, last } from './utils';
import { newGame } from './game';
import CARDS from './cards';

const $deck = $('#deck');
const $players = $('#players');
const $status = $('#status');
const $arena = $('#arena');

const message = async str => {
	$status.textContent = str;
	$status.classList.add('message');
	await wait(1600);
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
		$('#skipredraw').style.display = 'inline-block';
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
		game.players.forEach(player => {
			$(`#player${player.uid} .score`).textContent = `0 miles`;
		});
		await message('Round start');
		if (startPlayer.type === 'human') {
			await message('You will go first');
		} else {
			await message('Opponent will go first');
		}
	});

	game.on('start-turn', async (activePlayer) => {
		await wait(400);
		game.players.forEach(player => {
			$(`#player${player.uid}`).classList.toggle('active', player === activePlayer);
		});
		if (activePlayer.type === 'human') {
			await message('Your turn');
			$('#pass').style.display = 'inline-block';
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

	game.on('revive', async player => {
		if (player.type === 'human') {
			$('#discard').classList.add('expand');
			setTimeout(() => fanCards($('#discard'), game.discard), 500);
			await message('Pick a card to immediately play');
			resolvePickCard = card => {
				if (game.play(card)) {
					$('#discard').classList.remove('expand');
					setTimeout(() => fanCards($('#discard'), game.discard, true), 500);
				}
			};
		}
	});

	game.on('end-round', async (winner, gameEnd) => {
		game.players.forEach(player => {
			$(`#player${player.uid} .tokens`).textContent = `${player.tokens} tokens`;
			$(`#player${player.uid}`).classList.remove('active');
		});
		await message(`${winner.type === 'human' ? 'You' : 'Your Opponent'} won the ${gameEnd ? 'game' : 'round'}`);
	});


	let zIndex = 140;
	game.on('card-moved', async (card, from, to) => {
		let $card = renderCard(card);
		$card.style.zIndex = zIndex++;
		if (to.pile === 'discard') {
			let moveToMiddle = from.pile === 'hand';
			if (moveToMiddle) {
				$card.style.transform = `translate(${$arena.offsetWidth / 2 - $card.offsetWidth / 2}px, ${$arena.offsetHeight / 2 - $card.offsetHeight / 2}px) scale(3)`;
				$card.classList.remove('facedown');
				setTimeout(() => $card.classList.add('discarding'), 1000);
			} else {
				$card.classList.add('discarding');
			}
			wait(1800).then(() => {
				fanCards($('#discard'), game.discard, true);
				$card.classList.add('discarded');
				setTimeout(() => {
					$card.classList.remove('discarding');
				});
			});
			await wait(400);
		}
		
		game.players.forEach(player => {
			fanCards($(`#player${player.uid} .hand`), player.hand, false, player.type === 'ai');
			fanCards($(`#player${player.uid} .journey-area`), player.journey);
			fanCards($(`#player${player.uid} .sabotage-area`), player.sabotage, true);
			let sabotaged = last(player.sabotage);
			$(`#player${player.uid}`).classList.toggle('sabotaged', !!sabotaged);
			if (sabotaged) {
				$(`#player${player.uid} .sabotage-status .icon`).src = `icons/${sabotaged.effect}.svg`;
			}
		});
		if (game.turn === -3) { // dealing cards
			await wait(100);
		} else {
			await wait(1200);
		}
	});


	game.on('end-turn', () => {
		game.players.forEach(player => {
			$(`#player${player.uid} .score`).textContent = `${player.score || 0} miles`;
		});
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

	const fanCards = ($pile, cards, cascade, facedown) => { // spread cards as a fan
		let cardWidth = $('.card').offsetWidth,
			coords = getCoords($pile),
			width = Math.min(cardWidth * cards.length, $pile.offsetWidth),
			x = coords.x + $pile.offsetWidth / 2 - width / 2,
			offset = width / (cards.length);
		
		if (offset < cardWidth) {
			offset -= (cardWidth - ($pile.offsetWidth / cards.length)) / cards.length;
		}

		cards.forEach((card, i) => {
			let cx = x + i * offset,
				cy = coords.y;
			if (cascade) {
				cx = coords.x + 2 * Math.min(5, i);
				cy = coords.y + Math.min(5, i);
			}
			let $card = renderCard(card);
			$card.classList.toggle('facedown', !!facedown);
			$card.style.transform = `translate(${cx}px, ${cy}px)`;
		});
	};

	const renderCard = card => {
		let $card = $(`#card${card.uid}`);
		if (!$card) {
			$card = $copy('#tmpl-card');
			$card.setAttribute('id', `card${card.uid}`);
			$('.front', $card).src = `/cards/${card.id}-sm.png`;
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

window.addEventListener('load', () => {
	let arenaWidth = $arena.offsetWidth,
		arenaHeight = $arena.offsetHeight,
		ratio1 = window.innerWidth / arenaWidth,
		ratio2 = window.innerHeight / arenaHeight,
		ratio = Math.min(ratio1, ratio2);

	$('#viewport').setAttribute('content', `initial-scale=${ratio}, maximum-scale=${ratio}, minimum-scale=${ratio}`);
});