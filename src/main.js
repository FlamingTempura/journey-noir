'use strict';

import { $, $copy, wait, last } from './utils';
import Game from './Game';
import PlayerSmartAI from './PlayerSmartAI';
import PlayerHuman from './PlayerHuman';
import CARDS from './cards';

const $deck = $('#deck');
const $players = $('#players');
const $status = $('#status');
const $arena = $('#arena');
const CARD_WIDTH = $deck.offsetWidth;

const game = new Game();

const message = async str => {
	$status.textContent = str;
	$status.classList.add('message');
	await wait(600);
	$status.classList.remove('message');
};

const arrangeCards = ($pile, cards, cascade, facedown, order) => {
	let cardWidth = CARD_WIDTH,
		coords = getCoords($pile),
		width = Math.min(cardWidth * cards.length, $pile.offsetWidth),
		x = coords.x + $pile.offsetWidth / 2 - width / 2,
		offset = width / (cards.length);
	
	if (offset < cardWidth) {
		offset -= (cardWidth - ($pile.offsetWidth / cards.length)) / cards.length;
	}

	if (order) {
		// Sort by sabotage cards first, then remedy cards, then drivers in order of distance
		cards = cards.map(card => {
				let index;
				if (card.type === 'sabotage') {
					index = `1-${card.effect}`;
				} else if (card.type === 'remedy') {
					index = `2-${card.remedies}`;
				} else {
					index = `3-${String(card.distance).padStart(5, '0')}`;
				}
				return [index, card];
			})
			.sort((a, b) => a[0] < b[0] ? -1 : 1)
			.map(a => a[1]);
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

let zIndex = 140;
const renderCard = card => {
	let $card = $(`#card${card.uid}`);
	if (!$card) {
		$card = $copy('#tmpl-card');
		$card.setAttribute('id', `card${card.uid}`);
		$('.front', $card).src = `assets/cards/${card.id}-sm.png`;
		$card.addEventListener('click', () => pickCard(card));
		let { x, y } = getCoords($deck);
		$card.style.transform = `translate(${x}px, ${y}px)`;
		$card.style.zIndex = zIndex++;
		$arena.appendChild($card);
	}
	return $card;
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

let resolvePickCard;
const pickCard = card => {
	if (resolvePickCard) {
		resolvePickCard(card);
	}
};

game.addPlayer(new PlayerHuman({
	onWaitForPlay(revive, callback) {
		console.log('You must now pick a card to play');
		$('#pass').style.display = 'inline-block';
		if (revive) {
			$('#discard').classList.add('expand');
			setTimeout(() => arrangeCards($('#discard'), game.discard), 500);
			message('Pick a card to immediately play');
		}
		resolvePickCard = card => {
			try {
				console.log(`You picked ${card ? card.name : '[passed]'} to play`);
				callback(card);
				resolvePickCard = null;
				$('#pass').style.display = 'none';
				if (revive) {
					$('#discard').classList.remove('expand');
					setTimeout(() => arrangeCards($('#discard'), game.discard, true), 500);
				}
			} catch (e) {
				console.error('Failed!', e);
				message(e.message);
			}
		};
	},
	onWaitForRedraw(redrawCount, callback) {
		console.log('You may now redraw a card');
		message(`Pick a card to redraw (${redrawCount + 1}/2)`);
		$('#skipredraw').style.display = 'inline-block';
		resolvePickCard = card => {
			try {
				console.log(`You picked ${card ? card.name : '[skipped]'}`);
				callback(card);
				resolvePickCard = null;
				$('#skipredraw').style.display = 'none';
			} catch (e) {
				console.error('Failed!', e);
				message(e.message);
			}
		};
	}
}));

game.addPlayer(new PlayerSmartAI());

game.on('setup', () => { // render players
	console.log(`Setup`);
	$players.innerHTML = '';
	game.players.forEach(player => {
		let $player = $copy('#tmpl-player');
		$player.setAttribute('id', `player${player.uid}`);
		$('.playername', $player).textContent = `${player.name} (${player.type})`;
		$('.tokens', $player).textContent = `${player.tokens} tokens`;
		$players.appendChild($player);
	});
	arrangeCards($deck, game.deck, true, true);
});

game.on('start-round', async startPlayer => {
	console.log(`Start round`);
	game.players.forEach(player => {
		$(`#player${player.uid} .score`).textContent = `0 miles`;
		$(`#player${player.uid} .passed`).style.display = 'none';
	});
	await message('Round start');
	if (startPlayer.type === 'Human') {
		await message('You will go first');
	} else {
		await message('Opponent will go first');
	}
});

game.on('start-turn', async (activePlayer) => {
	console.log(`Start turn`);
	await wait(400);
	game.players.forEach(player => {
		$(`#player${player.uid}`).classList.toggle('active', player === activePlayer);
	});
	if (activePlayer.type === 'Human') {
		await message('Your turn');
	} else {
		await message('Opponent\'s turn');
	}
});

game.on('pass', async player => {
	console.log(`Pass`);
	if (player.type === 'Human') {
		await message('You have passed');
	} else {
		await message('Opponent has passed');
	}
});

game.on('end-round', async (winner, gameEnd) => {
	console.log(`End round`);
	game.players.forEach(player => {
		$(`#player${player.uid} .tokens`).textContent = `${player.tokens} tokens`;
		$(`#player${player.uid}`).classList.remove('active');
	});
	if (winner) {
		await message(`${winner.type === 'Human' ? 'You' : 'Your Opponent'} won the ${gameEnd ? 'game' : 'round'}`);
	} else {
		await message(`The round ended in a tie.`);
	}
});

game.on('card-moved', async (card, from, to) => {
	console.log(`%cCard moved: ${card.name.padStart(20)} :: ${from.pile.padStart(8)} → ${to.pile}`, 'color:orange');
	
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
			arrangeCards($('#discard'), game.discard, true);
			$card.classList.add('discarded');
			setTimeout(() => {
				$card.classList.remove('discarding');
			});
		});
		await wait(400);
	}

	if (from.pile === 'deck') {
		arrangeCards($deck, game.deck, true, true);
	}

	if (game.turn === -3) { // don't animate dealing cards
		$card.classList.add('dealing');
		setTimeout(() => $card.classList.remove('dealing'));
	}
	
	game.players.forEach(player => {
		arrangeCards($(`#player${player.uid} .hand`), player.hand, false, player.type === 'AI', true);
		arrangeCards($(`#player${player.uid} .journey-area`), player.journey, false, false, true);
		arrangeCards($(`#player${player.uid} .sabotage-area`), player.sabotage, false, false, true);
		let sabotaged = last(player.sabotage);
		$(`#player${player.uid}`).classList.toggle('sabotaged', !!sabotaged);
		if (sabotaged) {
			$(`#player${player.uid} .sabotage-status .icon`).src = `assets/icons/${sabotaged.effect}.svg`;
		}
	});

	await wait(1200);
});

game.on('end-turn', () => {
	console.log(`End turn`);
	game.players.forEach(player => {
		$(`#player${player.uid} .score`).textContent = `${player.score || 0} miles`;
		$(`#player${player.uid} .passed`).style.display = player.passed ? 'inner-block' : 'none';
	});
});

game.on('status', msg => {
	console.log(`%cStatus: ${msg}`, 'color:violet');
	$status.textContent = msg;
});

$('#skipredraw').addEventListener('click', () => pickCard());

$('#pass').addEventListener('click', () => pickCard());

$('#play').addEventListener('click', () => {
	$('#dlg-intro').style.display = 'none';
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
