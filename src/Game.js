import CARDS from './cards';
import { shuffle, removeEl, pick, Events } from './utils';

const topCard = arr => arr[arr.length - 1] || {};

const createDeck = () => {
	let deck = [],
		i = 0;
	for (let j in CARDS) {
		for (let k = 0; k < CARDS[j].quantity; k++) {
			deck.push(Object.assign({ id: Number(j) + 1, uid: i++ }, CARDS[j]));
		}
	}
	console.log(`Deck contains ${deck.length} cards`);
	return shuffle(deck);
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
		this.round = 0;
		this.startPlayer = this.players.indexOf(pick(this.players));
		this.turn = -3; // not yet started

		await this.emit('setup');
		this.emit('status', 'Dealing...');

		for (let i = 0; i < 10; i++) { // deal 10 cards to each player
			for (let player of this.players) {
				this._moveCard(this.deck[0], this.deck, player.hand);
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
		await this.emit('card-moved', card, this._identifyPile(from), this._identifyPile(to));
	}

	// Each player is allowed to redraw 2 cards before the first round begins
	async _awaitRedraw(player, redrawCount = 0) {
		this.emit('status', `Waiting for ${player.name} (${player.type}) to redraw a card...`);
		let card = await player.redraw(redrawCount);
		await this.emit('pick', card);
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
			for (let card of [].concat(player.journey)) {
				this._moveCard(card, player.journey, this.discard);
			}
			for (let card of [].concat(player.sabotage)) {
				this._moveCard(card, player.sabotage, this.discard);
			}
		}
		let player = this.players[this.startPlayer];
		this.emit('status', `${player.name} (${player.type}) will go first`);
		await this.emit('start-round', player);
		this._nextTurn();
	}

	async _endRound() {
		this.round++;
		let highestScore = Math.max(...this.players.map(p => p.score)),
			winners = this.players.filter(p => p.score === highestScore),
			winner;
		if (winners.length === 1) {
			winner = winners[0];
			winner.tokens++;
			this.startPlayer = this.players.indexOf(winner);
		}
		let gameEnd = (winner && winner.tokens === 2) || this.round === 3;
		await this.emit('end-round', winner, gameEnd);
		if (!gameEnd) {
			if (winner) {
				this._moveCard(topCard(this.deck), this.deck, winner.hand);
			}
			this._startRound();
		}
	}

	async terminate() {
		this.terminated = true;
	}

	async _nextTurn() {
		if (this.terminated) {
			return;
		}
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

		await this.emit('pick', card);

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
				let players = this.players.filter(p => !p.journey.find(j => j.prevents === 'detour')),
					highest = Math.max(...players.map(p => {
						return Math.max(...p.journey.map(j => j.distance));
					}));
				for (let p of players) {
					for (let journeyCard of [].concat(p.journey)) {
						if (journeyCard.distance === highest) {
							this._moveCard(journeyCard, p.journey, this.discard);
						}
					}
				}
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
				await Promise.all([
					this._moveCard(this.deck[0], this.deck, player.hand),
					this._moveCard(this.deck[0], this.deck, player.hand)
				]);
			} else {
				await this._moveCard(card, from, player.journey);
			}
			if (card.effect === 'revive') {
				await this._awaitPlay(player, true);
			}
		}

		if (player.sabotage.length > 0 && card.remedies === topCard(player.sabotage).effect) {
			for (let sabotageCard of [].concat(player.sabotage)) {
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
