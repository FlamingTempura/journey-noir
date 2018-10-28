import CARDS from './cards';
import { times, shuffle, random, wait, weightedPick, removeEl, pick } from './utils';

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

class Game {
	constructor() {
		this.listeners = {};
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
	async start() {
		this.deck = createDeck();
		this.discard = [];
		this.players = times(2, i => {
			return {
				uid: i,
				name: `Player ${i + 1}`,
				type: i === 0 ? 'ai' : 'human',
				hand: [],
				journey: [],
				sabotage: [],
				tokens: 0
			};
		});

		await this._emit('setup');

		for (let i = 0; i < 10; i++) { // deal 10 cards to each player
			for (let player of this.players) {
				await this._moveCard(this.deck[0], this.deck, player.hand);
			}
		}

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
		await this._emit('card-moved', card, this._identifyPile(from), this._identifyPile(to));
	}

	// Artificial thinking time
	async _thinking(player, min, max) {
		this._emit('status', 'AI is thinking....');
		player._thinking = true;
		await wait(random(min, max || min));
		player._thinking = false;
	}

	// Each player is allowed to redraw 2 cards before the first round begins
	async _awaitRedraw(player, redrawCount = 0) {
		this._emit('status', 'Waiting for player to redraw a card...');
		let redraw = async card => {
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
		if (player.type === 'ai') {
			await this._thinking(player, 800);
			if (Math.random() > 0.0) { // TODO: make this more intelligent
				await redraw(pick(player.hand)); 
			}
		} else {
			await new Promise(resolve => {
				this._emit('redraw', redrawCount);
				this.resolveRedraw = async card => {
					delete this.resolveRedraw;
					await redraw(card);
					resolve();
				};
			});
		}
	}

	// Redraws a card in player's hand. If undefined, no card will be redrawed
	async redraw(card) {
		if (this.resolveRedraw) {
			await this.resolveRedraw(card);
		}
	}

	async _startRound() {
		this.turn = -1;
		this.players.forEach(player => player.score = 0);
		let player = pick(this.players);
		this.startPlayer = this.players.indexOf(player); // TODO: set to winner of previous round 
		await this._emit('start-round', player);
		this._nextTurn();
	}

	async _endRound() {
		let winner = this.players.reduce((a, b) => a.score > b.score ? a : b);
		winner.tokens++;
		let gameEnd = winner.tokens === 2;
		await this._emit('end-round', (winner, gameEnd));
		if (!gameEnd) {
			this._startRound();
		}
	}

	async _nextTurn() {
		await wait(500);
		this.turn++;

		let playerIndex = (this.turn + this.startPlayer) % this.players.length,
			player = this.players[playerIndex];

		if (this.players.every(p => p.passed)) { // if all players have passed
			this._endRound();
		} else if (!player.passed) {
			await this._emit('start-turn', player, this.turn);
			await this._awaitPlay(player);
		}
		for (let player of this.players) {
			player.score = player.journey.reduce((sum, card) => sum + card.distance, 0);
		}
		this._nextTurn();
	}

	async _awaitPlay(player) {
		this._emit('status', 'Waiting for player to play a card...');
		let prospects = this._getProspects(player, player.hand);
		if (player.type === 'ai') {
			await this._thinking(player, 1800);
			if (prospects.length > 0) {
				await this._playCard(player, weightedPick(prospects)); // TODO: AI should intelligently pass
			} else {
				await this._pass(player);
			}

		} else {
			await new Promise(resolve => {
				this.resolvePlay = async card => {
					if (!card) {
						await this._pass(player);
					} else {
						if (!prospects.find(p => p[0] === card)) {
							throw new Error('Cannot play this card');
						}
						await this._playCard(player, card);
						resolve();
					}
					delete this.resolvePlay;
				};
			});
		}
	}

	async play(card) {
		if (this.resolvePlay) {
			await this.resolvePlay(card);
		}
	}

	async _pass(player) {
		player.passed = true;
		await this._emit('pass', player);
	}

	async _playCard(player, card) {
		console.log('Played', card.name);
		let opponent = this.players.find(p => p !== player);

		if (card.type === 'sabotage') {
			if (card.effect === 'detour') {
				await this._moveCard(card, player.hand, this.discard);
				let highest = Math.max(...this.players.map(p => {
					return Math.max(...p.journey.map(j => j.distance));
				}));
				this.players.forEach(p => {
					p.journey.forEach(journeyCard => {
						if (journeyCard.distance === highest) {
							this._moveCard(journeyCard, p.journey, this.discard);
						}
					});
				});
			} else {
				await this._moveCard(card, player.hand, opponent.sabotage);
			}
		}

		if (card.type === 'remedy') {
			await this._moveCard(card, player.hand, this.discard);
		}

		if (card.type === 'driver') {
			if (card.effect === 'turncoat') {
				await this._moveCard(card, player.hand, opponent.journey);
				await this._moveCard(this.deck[0], this.deck, player.hand);
				await this._moveCard(this.deck[0], this.deck, player.hand);
			} else {
				await this._moveCard(card, player.hand, player.journey);
			}
			if (card.effect === 'revive') {
				await this._awaitRevive(player);
			}
		}

		if (player.sabotage.length > 0 && card.remedies === topCard(player.sabotage).effect) {
			for (let sabotageCard of player.sabotage) {
				this._moveCard(sabotageCard, player.sabotage, this.discard);
			}
		}
	}

	async _awaitRevive(player) {
		this._emit('status', 'Waiting for player to play a card...');
		let prospects = this._getProspects(player, this.discard);
		if (player.type === 'ai') {
			await this._thinking(player, 1800);
			if (prospects.length > 0) {
				await this._playCard(player, weightedPick(prospects));
			}
		} else {
			await new Promise(resolve => {
				this.resolveRevive = async card => {
					if (card) {
						if (!prospects.find(p => p[0] === card)) {
							throw new Error('Cannot play this card.');
						}
						await this._playCard(player, card);
						resolve();
					}
					delete this.resolveRevive;
				};
			});
		}
	}

	revive(card) {
		if (this.resolveRevive) {
			this.resolveRevive(card);
		}
	}

	// For each card in a players hand, rank them by best to play:
	// If a prospect is > 0, then it is a legal play, and higher numbers are better cards to play.
	// If a prospect is < 0, then it is an illegal play
	_getProspect(player, card) {
		let opponent = this.players.find(p => p !== player);
		if (card.type === 'sabotage') {
			if (opponent.journey.find(p => p.prevents === card.effect)) {
				console.log(`${card.name} cannot be played because player is protected`);
				return -1; // cannot play a sabotage if opponent is protected
			}
			return 1;
		}
		if (card.type === 'remedy') {
			if (topCard(player.sabotage).sabotages === card.remedies) {
				return 1;
			}
			return 0.2;
		}
		if (card.type === 'driver') {
			let sabotage = topCard(card.effect === 'turncoat' ? opponent.sabotage : player.sabotage);

			if (sabotage.effect === 'puncture' && card.remedies !== 'puncture') {
				console.log(`${card.name} (${card.distance}) cannot be played because player has a puncture`);
				return -1;
			}

			if (sabotage.effect === 'speedlimit' && card.remedies !== 'speedlimit' && card.distance > 10) {
				console.log(`${card.name} (${card.distance}) cannot be played because player has a speed limit`);
				return -1;
			}

			if (sabotage.effect === 'pursuit' && card.remedies !== 'pursuit' && card.distance < 75) {
				console.log(`${card.name} (${card.distance}) cannot be played because player has a pursuit`);
				return -1;
			}
			return 1; // TODO: higher cards are better
		}
	}

	_getProspects(player, cards) {
		let prospects = [];
		cards.forEach(card => {
			let prospect = this._getProspect(player, card);
			if (prospect > 0) {
				prospects.push([card, prospect]);
			}
		});
		return prospects;
	}
}

export const newGame = () => new Game();
