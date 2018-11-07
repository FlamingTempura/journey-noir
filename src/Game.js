import CARDS from './cards';
import { times, shuffle, wait, removeEl, pick, Events } from './utils';

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


export default class Game extends Events {
	constructor() {
		super();
		this.players = [];
	}

	async addPlayer(player) {
		player.game = this;
		this.players.push(player);
	}

	async start() {
		this.deck = createDeck();
		this.discard = [];
		this.turn = -3; // not yet started

		await this.emit('setup');
		this.emit('status', 'Dealing...');

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
		if (from.indexOf(card) < 0) {
			console.error('card move fail');
			console.log(card, from, to, this);
		}
		removeEl(from, card);
		to.push(card);
		let id = this._identifyPile(to);
		if (id.pile === 'hand' || id.pile === 'journey') {
			orderCards(to);
		}
		await this.emit('card-moved', card, this._identifyPile(from), this._identifyPile(to));
	}

	// Each player is allowed to redraw 2 cards before the first round begins
	async _awaitRedraw(player, redrawCount = 0) {
		this.emit('status', `Waiting for ${player.name} (${player.type}) to redraw a card...`);
		let card = await player.redraw(redrawCount);
		if (card) {
			this.emit('status', 'Redrawing...');
			await this._moveCard(card, player.hand, this.discard);
			await this._moveCard(this.deck[0], this.deck, player.hand);
			if (redrawCount < 1) {
				await this._awaitRedraw(player, redrawCount + 1);
			}
		}
	}

	async _startRound() {
		this.turn = -1;
		for (let player of this.players) {
			player.passed = false;
			player.score = 0;
			for (let pile of [player.journey, player.sabotage]) {
				let _pile = [].concat(pile); // since we'll be remove items from the array, we need to loop through a copy of the array
				for (let card of _pile) {
					this._moveCard(card, pile, this.discard);
				}
			}
		}
		let player = pick(this.players);
		this.emit('status', `${player.name} (${player.type}) will go first`);
		this.startPlayer = this.players.indexOf(player); // TODO: set to winner of previous round 
		await this.emit('start-round', player);
		this._nextTurn();
	}

	async _endRound() {
		let winner = this.players.reduce((a, b) => a.score > b.score ? a : b); // FIXME: does not handle ties
		winner.tokens++;
		let gameEnd = winner.tokens === 2;
		await this.emit('end-round', winner, gameEnd);
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
			await this.emit('start-turn', player, this.turn);
			await this._awaitPlay(player);
			for (let player of this.players) {
				player.score = player.journey.reduce((sum, card) => sum + card.distance, 0);
			}
			await this.emit('end-turn', player, this.turn);
			//console.log(`--------------  Turn ${this.turn} finished  --------------`);
			this._nextTurn();
		}
	}

	async _awaitPlay(player, reviving) {
		if (reviving) {
			this.emit('status', `Waiting for ${player.name} (${player.type}) to play a card from discard pile...`);
		} else {
			this.emit('status', `Waiting for ${player.name} (${player.type}) to play a card from their hand...`);
		}

		let pile = reviving ? this.discard : player.hand,
			possibleMoves = this._getPossibleMoves(player, pile),
			card = await player.play(reviving, possibleMoves);

		if (card) {
			await this._playCard(player, pile, card);
		}

		if (!card && !reviving) {
			await this._pass(player);
		}
	}

	async _pass(player) {
		player.passed = true;
		await this.emit('pass', player);
	}

	async _playCard(player, from, card) {
		this.emit('status', `${player.name} played ${card.name}...`);
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

	// remedies always allowed, even if it will have no effect
	_isIllegal(player, card) {
		let opponent = this.players.find(p => p !== player);

		// detour always allowed, even if it will have no effect
		if (card.type === 'sabotage' && card.effect !== 'detour' && opponent.journey.find(c => c.prevents === card.effect)) {
			return `${card.name} cannot be played because ${opponent.name} is protected`;
		}

		if (card.type === 'driver') {
			let target = card.effect === 'turncoat' ? opponent : player,
				sabotage = topCard(target.sabotage);

			if (sabotage.effect === 'puncture' && card.remedies !== 'puncture') {
				return `${card.name} (${card.distance}) cannot be played because ${target.type === 'Human' ? 'you' : target.name} has a puncture`;
			}

			if (sabotage.effect === 'speedlimit' && card.remedies !== 'speedlimit' && card.distance > 10) {
				return `${card.name} (${card.distance}) cannot be played because ${target.type === 'Human' ? 'you' : target.name} has a speed limit`;
			}

			if (sabotage.effect === 'pursuit' && card.remedies !== 'pursuit' && card.distance < 75) {
				return `${card.name} (${card.distance}) cannot be played because ${target.type === 'Human' ? 'you' : target.name} has a pursuit`;
			}
		}
	}

	_getPossibleMoves(player, cards) {
		return cards.map(card => {
			let reason = this._isIllegal(player, card);
			if (reason) {
				return { card, legal: false, reason };
			} else {
				return { card, legal: true };
			}
		});
	}
}
