'use strict';

import { $, $$, $copy } from './utils';
import { newGame } from './game';
import CARDS from './cards';

const $deck = $('#deck');
const $players = $('#players');
const $status = $('#status');
const $arena = $('#arena');

const startRenderer = game => {

	game.on('setup', players => { // render players
		$players.innerHTML = '';
		players.forEach(player => {
			let $player = $copy('#tmpl-player');
			$player.setAttribute('id', `player${player.index}`);
			$('.playername', $player).textContent = player.name + ` (${player.type})`;
			$players.appendChild($player);
		});
	});

	game.on('deck-change', deck => {
		// render deck of cards
		$('.count', $deck).innerHTML = 'Deck: ' + deck.length + ' cards';
		$$('img', $deck).forEach(($card, i) => {
			$card.style.display = deck.length > i ? 'block' : 'hidden';
		});
	});

	game.on('player-hand-change', player => { // render player hand
		let $area = $(`#player${player.index} .hand`);
		player.hand.forEach(card => moveCard(renderCard(card), $area));
	});

	game.on('player-protection-change', player => {
		let $area = $(`#player${player.index} .protection-area`);
		player.protection.forEach(card => moveCard(renderCard(card), $area));
	});

	game.on('player-sabotage-change', player => {
		let $area = $(`#player${player.index} .sabotage-area`);
		player.sabotage.forEach(card => moveCard(renderCard(card), $area));
	});

	game.on('player-heat-change', player => {
		let $area = $(`#player${player.index} .heat-area`);
		player.heat.forEach(card => moveCard(renderCard(card), $area));
	});

	game.on('player-journey-change', player => {
		let $area = $(`#player${player.index} .journey-area`);
		player.journey.forEach(card => moveCard(renderCard(card), $area));
		$(`#player${player.index} .score`).textContent = `${player.score} miles`;
	});

	game.on('discard', discard => {
		discard.forEach(card => {
			console.log(`.hand #${card.id}`);
			let previouslyInHand = !!$(`.hand #${card.uid}`);
			discardCard(renderCard(card), previouslyInHand);
		});
	});

	game.on('turn-change', turn => {
		// highlight active player
	});

	game.on('status', msg => $status.textContent = msg);

	$deck.addEventListener('click', () => game.draw());

	const renderCard = card => {
		let $card = $(`#${card.uid}`);
		if (!$card) {
			$card = $copy('#tmpl-card');
			$card.setAttribute('id', card.uid);
			$('img', $card).src = `/cards/${card.id}.png`;
			$card.addEventListener('click', () => game.play(card));
			$('.discard', $card).addEventListener('click', e => {
				game.discard(card);
				e.stopPropagation();
			});
		}
		return $card;
	};
};


const moveCard = ($card, $newArea, newX, newY, enlarge) => {
	if ($card.parentElement === $newArea) { return; }
	let $origin = $card.parentElement ? $card : $deck;
	let { x, y } = $origin.getBoundingClientRect();
	x -= $arena.getBoundingClientRect().x;
	y -= $arena.getBoundingClientRect().y;
	$card.style.transform = `translate(${x}px, ${y}px)`;
	$arena.appendChild($card);
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

const discardCard = ($card, moveToMiddle) => {
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