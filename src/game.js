import CARDS from './cards';
import { times, shuffle, random, wait, clone, sum, weightedPick, removeEl } from './utils';

const topCard = arr => arr[arr.length - 1] || {};

const createDeck = () => {
	let deck = [],
		i = 0;
	CARDS.forEach(card => {
		times(card.quantity, () => {
			card = clone(card);
			card.uid = `card-${i++}`;
			deck.push(card);
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
	trigger(event, ...args) {
		console.log(event, ...args);
		let callbacks = this.listeners[event] || [];
		callbacks.forEach(cb => cb(...args));
	}
	start() {
		this.deck = createDeck();
		this.discarded = [];
		this.trigger('deck-change', this.deck);

		this.players = times(2, i => {
			return {
				index: i,
				name: `Player ${i + 1}`,
				type: i === 0 ? 'ai' : 'human',
				hand: this.deck.splice(0, 6), // each player starts with 6 cards
				journey: [],
				protection: [],
				sabotage: [],
				heat: []
			};
		});
		this.trigger('deck-change', this.deck);
		this.trigger('setup', this.players);
		this.players.forEach(player => this.trigger('player-hand-change', player));

		this.turn = -1;
		this._nextTurn();
	}

	_nextTurn() {
		return wait(500)
			.then(() => {
				this.turn++;
				this.trigger('turn-change', this.turn);

				let playerIndex = this.turn % this.players.length,
					player = this.players[playerIndex];
				
				if (!this.players.find(p => !p.out)) { // if all players are out
					this.endGame();
				}
				if (player.out) {
					this._nextTurn();
				}
				return this._awaitDraw(player)
					.then(() => this._awaitPlay(player))
					.then(() => this._nextTurn());
			});
	}

	_thinking(player, min, max) {
		this.trigger('status', 'AI is _thinking....');
		player._thinking = true;
		return wait(random(min, max || min))
			.then(player._thinking = false);
	}

	_awaitDraw(player) {
		this.trigger('status', 'Waiting for player to draw a card...');
		let draw = () => {
			player.hand.push(this.deck.pop());
			this.trigger('deck-change', this.deck);
			this.trigger('player-hand-change', player);
		};
		if (player.type === 'ai') {
			return this._thinking(player, 800)
				.then(draw);
		} else {
			return new Promise(resolve => {
				this.resolveDraw = () => {
					delete this.resolveDraw;
					draw();
					resolve();
				};
			});
		}
	}

	draw() {
		if (this.resolveDraw) {
			this.resolveDraw();
		}
	}

	_awaitPlay(player) {
		this.trigger('status', 'Waiting for player to play a card...');
		let prospects = this.getProspects(player);
		if (player.type === 'ai') {
			return this._thinking(player, 1800)
				.then(() => {
					let weights = [];
					prospects.forEach((probability, i) => {
						console.log('Prospect:', player.hand[i].id, probability);
						if (probability < 0) { return; } // illegal play
						weights.push([i, probability]);
					});
					let hasLegalPlay = prospects.find(p => p > 0);
					if (hasLegalPlay) {
						let i = weightedPick(weights);
						return this._playCard(player, player.hand[i]);
					} else {
						weights = weights.map(([i, probability]) => [i, -probability]);
						let i = weightedPick(weights);
						return this._discardCard(player, player.hand[i]);
					}
				});
		} else {
			return new Promise(resolve => {
				this.resolvePlay = card => {
					let i = player.hand.indexOf(card);
					if (i === -1) { return; } // not in player's hand
					if (prospects[i] < 0) { // illegal play
						this.trigger('illegal-play');
					} else {
						delete this.resolvePlay;
						delete this.resolveDiscard;
						Promise.resolve(this._playCard(player, card))
							.then(resolve);
					}
				};
				this.resolveDiscard = card => {
					let i = player.hand.indexOf(card);
					if (i === -1) { return; } // not in player's hand
					delete this.resolvePlay;
					delete this.resolveDiscard;
					Promise.resolve(this._discardCard(player, card))
						.then(resolve);
				};
			});
		}
	}

	play(card) {
		if (this.resolvePlay) {
			this.resolvePlay(card);
		}
	}

	_playCard(player, card) {
		console.log('played', card.id);
		let opponent = this.players.find(p => p !== player);
		removeEl(player.hand, card);
		this.trigger('player-hand-change', player);
		if (card.type === 'protection') {
			player.protection.push(card);
			this.trigger('player-protection-change', player);
			return this._awaitDraw(player)
				.then(() => this._awaitPlay(player));
		} else if (card.id === 'sabotage-lost') {
			let lowest = Math.min(...opponent.journey.map(journeyCard => journeyCard.distance));
			opponent.journey.forEach(journeyCard => {
				if (journeyCard.distance === lowest) {
					removeEl(opponent.journey, journeyCard);
					this.discarded.push(journeyCard);
				}
			});
			opponent.score = sum(opponent.journey, 'distance');
			this.trigger('player-journey-change', opponent);
			this.discarded.push(card);
			this.trigger('discard', this.discarded);
			return wait(2000); // allow time for discard animation
		} else if (card.type === 'sabotage') {
			opponent.sabotage.push(card);
			this.trigger('player-sabotage-change', opponent);
		} else if (card.type === 'remedy') {
			player.sabotage.push(card);
			this.trigger('player-sabotage-change', player);
		} else if (card.type === 'heat') {
			opponent.heat.push(card);
			this.trigger('player-heat-change', opponent);
		} else if (card.type === 'escape') {
			player.heat.push(card);
			this.trigger('player-heat-change', player);
		} else if (card.type === 'driver') {
			player.journey.push(card);
			player.score = sum(player.journey, 'distance');
			this.trigger('player-journey-change', player);
		}
	}

	discard(card) {
		if (this.resolveDiscard) {
			this.resolveDiscard(card);
		}
	}

	_discardCard(player, card) {
		removeEl(player.hand, card);
		this.trigger('player-hand-change', player);
		this.discarded.push(card);
		this.trigger('discard', this.discarded);
		return wait(2000); // allow time for discard animation
	}

	// For each card in a players hand, rank them by best to play:
	// If a prospect is > 0, then it is a legal play, and higher numbers are better cards to play.
	// If a prospect is < 0, then it is an illegal play, and lower numbers are better to discard.
	getProspects(player) {
		let opponent = this.players.find(p => p !== player);
		return player.hand.map(card => {
			if (card.type === 'protection') {
				return 1000;
			}
			if (card.type === 'sabotage') {
				let opponentProtected = topCard(opponent.protection).prevents === card.sabotages;
				if (opponentProtected) { return 0.1; }
				return 0.9;
			}
			if (card.type === 'heat') {
				let opponentProtected = topCard(opponent.protection).prevents === card.heat;
				if (opponentProtected) { return 0.1; }
				return 0.9;
			}
			if (card.type === 'remedy') {
				let sabotaged = topCard(player.sabotage).sabotages === card.remedies;
				if (sabotaged) { return 0.9; }
				return -10; // illegal play
			}
			if (card.type === 'escape') {
				let heat = topCard(player.heat).heat;
				if (heat) { return 0.9; }
				return -10; // illegal play
			}
			if (card.type === 'driver') {
				let sabotage = topCard(player.sabotage),
					heat = topCard(player.heat),
					score = sum(player.journey, 'distance');
				if (sabotage.sabotages && card.ignores !== sabotage.sabotages) { return -1; } // illegal play
				if (heat.heat === 'speedlimit' && card.distance > heat.limit && card.ignores !== 'speedlimit') { return -1; } // illegal play
				if (heat.heat === 'pursuit' && card.distance < heat.limit && card.ignores !== 'pursuit') { return -1; } // illegal play
				if (card.distance === 200 && player.journey.filter(d => d.distance === 200).length === 2) { return -1000; } // illegal play
				if (score + card.distance > 1000) { return -1000; } // illegal play
				if (score + card.distance === 1000) { return 1000; }
				if (card.distance === 200) { return 0.4; }
				if (card.distance === 100) { return 0.9; }
				if (card.distance === 75) { return 0.9; }
				if (card.distance === 50) { return 0.5; }
				if (card.distance === 25) { return 0.2; }
			}

		});
	}

	endGame() {

	}
}

export const newGame = () => new Game();
