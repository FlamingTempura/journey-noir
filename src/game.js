import CARDS from './cards';
import { times, shuffle, random, wait, removeEl, pick, deepClone } from './utils';

const topCard = arr => arr[arr.length - 1] || {};

const createDeck = () => {
	let deck = [],
		i = 0;
	CARDS.forEach((card, j) => {
		times(card.quantity, () => {
			deck.push(Object.assign({ id: j, uid: i++ }, card));
		});
	});
	console.log(`Deck contains ${deck.length} cards`);
	return shuffle(deck);
};

// Sort by sabotage cards first, then remedy cards, then drivers in order of distance
const orderCards = cards => {
	console.log('order', cards);
	cards.map(card => {
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
		.forEach((a, i) => cards.splice(i, 1, a[1]));
};

export default class Game {
	constructor(players) {
		this.listeners = {};
		this.players = players;
		players.forEach(player => player.game = this);
	}
	on(event, callback) {
		if (!this.listeners[event]) { this.listeners[event] = []; }
		this.listeners[event].push(callback);
	}
	off(event, callback) {
		let callbacks = this.listeners[event] || [];
		this.listeners[event] = callbacks.filter(cb => cb !== callback);
	}
	async _emit(event, ...args) {
		console.log(`event:${event}`, ...args);
		let callbacks = this.listeners[event] || [];
		await Promise.all(callbacks.map(cb => cb(...args)));
	}
	async clone() {
		return deepClone(this);
	}
	async start() {
		this._emit('status', 'Dealing...');
		this.deck = createDeck();
		this.discard = [];
		this.turn = -3; // not yet started

		await this._emit('setup');

		for (let i = 0; i < 10; i++) { // deal 10 cards to each player
			for (let player of this.players) {
				await this._moveCard(this.deck[0], this.deck, player.hand);
			}
		}

		this.turn = -2; // redraw

		for (let player of this.players) {
			await this._awaitRedraw(player);
		}

		await this._startRound();
	}

	// Get a descriptor for a pile. e.g. { pile: 'journey', player: {...} }
	_identifyPile(pile) { 
		if (pile === this.deck) { return { pile: 'deck' }; }
		if (pile === this.discard) { return { pile: 'discard' }; }
		for (let player of this.players) {
			for (let p of ['hand', 'journey', 'sabotage']) {
				if (pile === player[p]) {
					return { pile: p, player };
				}
			}
		}
		console.log('ERROR!!', pile);
	}

	// Move a card from one pile to another
	async _moveCard(card, from, to) {
		removeEl(from, card);
		to.push(card);
		let id = this._identifyPile(to);
		if (id.pile === 'hand' || id.pile === 'journey') {
			orderCards(to);
		}
		await this._emit('card-moved', card, this._identifyPile(from), this._identifyPile(to));
	}

	// Each player is allowed to redraw 2 cards before the first round begins
	async _awaitRedraw(player, redrawCount = 0) {
		this._emit('status', 'Waiting for player to redraw a card...');
		let redraw = async card => {
			this._emit('status', 'Redrawing...');
			if (card) {
				if (!player.hand.includes(card)) {
					throw new Error('Pick a card of your own to redraw, or click Skip Redraw');
				}
				await this._moveCard(card, player.hand, this.discard);
				await this._moveCard(this.deck[0], this.deck, player.hand);
				if (redrawCount < 1) {
					await this._awaitRedraw(player, redrawCount + 1);
				}
			}
		};
		let card = await player.redraw();
		if (card) {
			await redraw(card)
		}
	}

	async _startRound() {
		this.turn = -1;
		for (let player of this.players) {
			player.passed = false;
			player.score = 0;
			for (let pile of [player.journey, player.sabotage]) {
				for (let card of pile) {
					this._moveCard(card, pile, this.discard);
				}
			}
		}
		await wait(1000);
		let player = pick(this.players);
		this.startPlayer = this.players.indexOf(player); // TODO: set to winner of previous round 
		await this._emit('start-round', player);
		this._nextTurn();
	}

	async _endRound() {
		let winner = this.players.reduce((a, b) => a.score > b.score ? a : b);
		winner.tokens++;
		let gameEnd = winner.tokens === 2;
		await this._emit('end-round', winner, gameEnd);
		if (!gameEnd) {
			this._startRound();
		}
	}

	async _nextTurn() {
		this.turn++;

		let playerIndex = (this.turn + this.startPlayer) % this.players.length,
			player = this.players[playerIndex];

		if (this.players.every(p => p.passed)) { // if all players have passed
			this._endRound();
		} else if (player.passed) {
			this._nextTurn();
		} else {
			await this._emit('start-turn', player, this.turn);
			await this._awaitPlay(player);
			for (let player of this.players) {
				player.score = player.journey.reduce((sum, card) => sum + card.distance, 0);
			}
			await this._emit('end-turn', player, this.turn);
			console.log('--------------  Turn finished  --------------');
			this._nextTurn();
		}
	}

	async _awaitPlay(player, reviving) {
		if (reviving) {
			this._emit('status', 'Waiting for player to play a card from discard pile...');
			this._emit('revive', player);
		} else {
			this._emit('status', 'Waiting for player to play a card from their hand...');
		}
		let pile = reviving ? this.discard : player.hand,
			prospects = this._getProspects(player, pile);
		let card = await player.play(prospects);
		if (card) {
			await this._playCard(player, pile, card);
		} else if (!reviving) {
			await this._pass(player);
		}
	}

	async _pass(player) {
		player.passed = true;
		await this._emit('pass', player);
	}

	async _playCard(player, from, card) {
		this._emit('status', `${player.name} played ${card.name}...`);
		let opponent = this.players.find(p => p !== player);

		if (card.type === 'sabotage') {
			if (card.effect === 'detour') {
				await this._moveCard(card, from, this.discard);
				let players = this.players.filter(p => !p.journey.find(j => j.prevents === 'detour'));
				let highest = Math.max(...players.map(p => {
						return Math.max(...p.journey.map(j => j.distance));
					}));
				players.forEach(p => {
					p.journey.forEach(journeyCard => {
						if (journeyCard.distance === highest) {
							this._moveCard(journeyCard, p.journey, this.discard);
						}
					});
				});
			} else {
				await this._moveCard(card, from, opponent.sabotage);
			}
		}

		if (card.type === 'remedy') {
			await this._moveCard(card, from, this.discard);
		}

		if (card.type === 'driver') {
			if (card.effect === 'turncoat') {
				await this._moveCard(card, from, opponent.journey);
				await this._moveCard(this.deck[0], this.deck, player.hand);
				await this._moveCard(this.deck[0], this.deck, player.hand);
			} else {
				await this._moveCard(card, from, player.journey);
			}
			if (card.effect === 'revive') {
				await this._awaitPlay(player, true);
			}
		}

		if (player.sabotage.length > 0 && card.remedies === topCard(player.sabotage).effect) {
			for (let sabotageCard of player.sabotage) {
				this._moveCard(sabotageCard, player.sabotage, this.discard);
			}
		}
	}

	// For each card in a players hand, rank them by best to play:
	// If a prospect is > 0, then it is a legal play, and higher numbers are better cards to play.
	// If a prospect is < 0, then it is an illegal play
	_getProspect(player, card) {
		let opponent = this.players.find(p => p !== player);
		if (card.type === 'sabotage') {
			if (card.effect !== 'detour' && opponent.journey.find(p => p.prevents === card.effect)) {
				return [-1, `${card.name} cannot be played because ${opponent.name} is protected`];
			}
			return [1];
		}
		if (card.type === 'remedy') {
			if (topCard(player.sabotage).sabotages === card.remedies) {
				return [1];
			}
			return [0.2];
		}
		if (card.type === 'driver') {
			let target = card.effect === 'turncoat' ? opponent : player,
				sabotage = topCard(target.sabotage);

			if (sabotage.effect === 'puncture' && card.remedies !== 'puncture') {
				console.log();
				return [-1, `${card.name} (${card.distance}) cannot be played because ${target.type === 'human' ? 'you' : target.name} has a puncture`];
			}

			if (sabotage.effect === 'speedlimit' && card.remedies !== 'speedlimit' && card.distance > 10) {
				return [-1, `${card.name} (${card.distance}) cannot be played because ${target.type === 'human' ? 'you' : target.name} has a speed limit`];
			}

			if (sabotage.effect === 'pursuit' && card.remedies !== 'pursuit' && card.distance < 75) {
				return [-1, `${card.name} (${card.distance}) cannot be played because ${target.type === 'human' ? 'you' : target.name} has a pursuit`];
			}
			return [1]; // TODO: higher cards are better
		}
	}

	_getProspects(player, cards) {
		return cards.map(card => {
			let prospect = this._getProspect(player, card);
			return { card, value: prospect[0], reason: prospect[1] };
		});
	}
}
