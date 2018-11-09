(function () {
	'use strict';

	const $ = (selector, $root = document) => $root.querySelector(selector);

	const $copy = (selector, $root = document) => $('*', $root.importNode($(selector).content, true));

	const shuffle = (arr) => {
		var j, x, i;
		for (i = arr.length - 1; i > 0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			x = arr[i];
			arr[i] = arr[j];
			arr[j] = x;
		}
		return arr;
	};

	const random = (min, max) => Math.round(min + Math.random() * (max - min));

	const wait = duration => new Promise(resolve => {
		setTimeout(resolve, duration);
	});

	const last = arr => arr[arr.length - 1];

	const removeEl = (arr, el) => {
		let i = arr.indexOf(el);
		if (i > -1) {
			arr.splice(i, 1);
		}
	};

	const pick = arr => arr[Math.floor(Math.random() * arr.length)];

	class Events {
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
		async emit(event, ...args) {
			let callbacks = this.listeners[event] || [];
			await Promise.all(callbacks.map(cb => cb(...args)));
		}
	}

	const reviveDescription = 'Play to your Journey pile and immediately play a discarded card.';
	const turncoatDescription = 'Play to an opponent’s Journey pile and draw two cards.';
	const driverDescription = 'Play to your Journey area to travel {{distance}} miles.';

	var cards = [
		// SABOTAGE
		{
			type: 'sabotage',
			name: 'Puncture',
			description: 'Play on an opponent’s sabotage pile to halt their journey.',
			effect: 'puncture',
			quantity: 3
		},
		{
			type: 'sabotage',
			name: 'Speed Limit',
			description: 'Play on an opponent’s sabotage pile to limit them to 15 or lower.',
			effect: 'speedlimit',
			quantity: 3
		},
		{
			type: 'sabotage',
			name: 'Pursuit',
			description: 'Play on an opponent’s sabotage pile to limit them to 75 or higher.',
			effect: 'pursuit',
			quantity: 3
		},
		{
			type: 'sabotage',
			name: 'Detour',
			description: 'Discard this card and all of the highest cards in play.',
			effect: 'detour',
			quantity: 3
		},

		// REMEDIES
		{
			type: 'remedy',
			name: 'New tire',
			description: 'Play on your sabotage pile to fix a Puncture.',
			remedies: 'puncture',
			quantity: 3
		},
		{
			type: 'remedy',
			name: 'End of limit',
			description: 'Play on your sabotage pile to end a Speed Limit.',
			remedies: 'speedlimit',
			quantity: 3
		},
		{
			type: 'remedy',
			name: 'Escape',
			description: 'Play on your sabotage pile to end a Pursuit.',
			remedies: 'pursuit',
			quantity: 3
		},

		// SKILLED DRIVERS
		{
			type: 'driver',
			name: 'The Brute', // F
			description: 'Play to your Journey area to protect against Puncture.',
			quote: 'Life on the inside had taken its toll. But he lugged the Plymouth {{distance}} damn miles.',
			artwork: 'brute',
			distance: 10,
			remedies: 'puncture',
			prevents: 'puncture',
			quantity: 2
		},
		{
			type: 'driver',
			name: 'Wheelman',
			description: 'Play on your Journey area to protect against Pursuits.',
			quote: 'The thrill of the chase. He knew how to handle the Plymouth, but I hope to never see his gnarly mug again.',
			artwork: 'wheelman',
			distance: 30,
			remedies: 'pursuit',
			prevents: 'pursuit',
			quantity: 2
		},
		{
			type: 'driver',
			name: 'Mayor Ducane', // F
			description: 'Play to your Journey area to protect against Speed Limits.',
			quote: 'A buck here, a buck there, you make your name with the Mayor. No limits for the Mayor.',
			artwork: 'mayor',
			distance: 50,
			remedies: 'speedlimit',
			prevents: 'speedlimit',
			quantity: 2
		},
		{
			type: 'driver',
			name: 'Detective Briggs',
			description: 'Play on your Journey area to protect against Detours.',
			quote: 'I give a beat cop 20 bucks to guide the way. He knows the backstreets, the rough parts of town.',
			distance: 30,
			artwork: 'detective',
			prevents: 'detour',
			quantity: 2
		},

		// REVIVES
		{
			type: 'driver',
			name: 'Mafia Clinic',
			description: reviveDescription,
			quote: 'A nurse took a drag of a cigarette and handed me a cup of brown. Tasted of ash.',
			artwork: 'nurse',
			distance: 0,
			effect: 'revive',
			quantity: 2
		},
		{
			type: 'driver',
			name: 'Animal Clinic',
			description: reviveDescription,
			quote: 'He was a grisly guy with a stench of fomaldehyde. But here’s a guy who won’t ask questions.',
			artwork: 'doctor',
			distance: 0,
			effect: 'revive',
			quantity: 2
		},

		// TURNCOATS
		{
			type: 'driver',
			name: 'Turncoat Rita',
			description: turncoatDescription,
			quote: 'Rita said it was better on the outside. She was feeding me a can of lies. Damn you Rita. Broke my heart.',
			artwork: 'rita',
			distance: 0,
			effect: 'turncoat',
			quantity: 1
		},
		{
			type: 'driver',
			name: 'Crafty Jenkins',
			description: turncoatDescription,
			quote: 'I never trusted Jenkins. Had her hat in too many rings. Scarlet lipstick... color of betrayal.',
			artwork: 'jenkins',
			effect: 'turncoat',
			distance: 20,
			quantity: 1
		},
		{
			type: 'driver',
			name: 'Bill',
			description: turncoatDescription,
			quote: 'Bill was the kind of bastard you never trust. He’d sell out his own mother for a fix.',
			artwork: 'bill',
			distance: 50,
			effect: 'turncoat',
			quantity: 1
		},

		// DRIVER
		{
			type: 'driver',
			name: 'Old Smokey',
			description: driverDescription,
			quote: 'The stench of cheap cigarettes. He asks if I’ve got a light. I fumble for a match. Something wasn’t right.',
			artwork: 'smokey',
			distance: 5,
			quantity: 6
		},
		{
			type: 'driver',
			name: 'Dolly',
			description: driverDescription,
			quote: 'Dolly looked like your everyday grandma. But she was armed to the teeth. Nobody dared get close to us.',
			artwork: 'dolly',
			distance: 10,
			quantity: 8
		},
		{
			type: 'driver',
			name: 'Butler',
			description: driverDescription,
			quote: 'Butler’s an old pal. Last job he took four slugs to the chest. Now he’s got a stare that could kill a puppy.',
			artwork: 'butler',
			distance: 15,
			quantity: 10
		},
		{
			type: 'driver',
			name: 'Cat Ducane',
			description: driverDescription,
			quote: 'Cat’s an ex-cop. I throw a wad of cash. Paying to not get noticed. She didn’t give a damn who I am.',
			artwork: 'cat',
			distance: 30,
			quantity: 8
		},
		{
			type: 'driver',
			name: 'Phelps',
			description: driverDescription,
			quote: 'The outsider. The loner. There are only tales of Phelps, he leaves no witnesses. But he drives stick.',
			artwork: 'phelps',
			distance: 50,
			quantity: 6
		},
		{
			type: 'driver',
			name: 'Shadow',
			description: driverDescription,
			quote: 'A shadow in the doorway, glow of a cigarette. A broad that won’t ask questions.',
			artwork: 'shadow',
			quantity: 4,
			distance: 75
		},
		{
			type: 'driver',
			name: 'Don Marloni',
			quote: 'A muffled scream in the trunk. The Don, the big man, he’ll rip your teeth out and wear them as cufflinks.',
			description: driverDescription,
			artwork: 'don',
			quantity: 2,
			distance: 100
		}
	];

	const topCard = arr => arr[arr.length - 1] || {};

	const createDeck = () => {
		let deck = [],
			i = 0;
		for (let j in cards) {
			for (let k = 0; k < cards[j].quantity; k++) {
				deck.push(Object.assign({ id: Number(j) + 1, uid: i++ }, cards[j]));
			}
		}
		console.log(`Deck contains ${deck.length} cards`);
		return shuffle(deck);
	};

	class Game extends Events {
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

		_getPossibleMoves(player, cards$$1) {
			return cards$$1.map(card => {
				let reason = this._isIllegal(player, card);
				if (reason) {
					return { card, legal: false, reason };
				} else {
					return { card, legal: true };
				}
			});
		}
	}

	let uid = 0;
	class Player {
		constructor() {
			this.uid = uid++;
			this.name = `Player ${uid}`;
			this.hand = [];
			this.journey = [];
			this.sabotage = [];
			this.tokens = 0;
		}
	}

	class PlayerBasicAI extends Player {
		constructor() {
			super();
			this.type = 'AI';
		}

		async redraw() {
			await this._thinking(800);
			if (Math.random() > 0.4) {
				return pick(this.hand); 
			}
			return null; // skip redraw
		}

		async play(revive, possibleMoves) {
			await this._thinking(1800);

			let choices = possibleMoves
					.filter(move => move.legal)
					.map(move => move.card),

				passChance = Math.min(0.1, Math.max(0, (1 + Math.log10(choices.length)) / 200)); // less likely to pass with more cards

			if (choices.length > 0 && Math.random() > passChance) {
				return pick(choices);
			}

			return null; // otherwise, pass
		}

		// Artificial thinking time
		async _thinking(min, max) {
			await wait(random(min, max || min));
		}
	}

	const cloneGame = game => {
		let _game = new Game();
		_game.deck = [].concat(game.deck);
		_game.discard = [].concat(game.discard);
		_game.turn = game.turn;
		_game.startPlayer = game.startPlayer;
		_game.players = game.players.map(player => {
			let _player = new PlayerBasicAI();
			_player._thinking = () => {}; // disable thinking time for simultations
			_player.game = _game;
			_player.name = `Simulation of ${player.name}`;
			_player.hand = [].concat(player.hand);
			_player.journey = [].concat(player.journey);
			_player.sabotage = [].concat(player.sabotage);
			_player.tokens = player.tokens;
			_player.original = player;
			_player.score = player.score;
			_player.passed = player.passed;
			return _player;
		});
		return _game;
	};

	class PlayerSmartAI extends Player {
		constructor() {
			super();
			this.type = 'AI';
		}

		async redraw() {
			return null;
		}

		async play(revive) {
			if (revive) {
				return this.revivedCard;
			}
			let simulation = await this._montecarlo(random(1500, 3200));
			this.revivedCard = simulation.revivedCard;
			return simulation.card;
		}

		// 1. Run n simulations. A simulation comprises of the following:
		// 	* pick a card in AI's hand
		// 	* reasonably predict a card that AI's opponent could play 
		// 	* repeat until the round is likely to end
		// 	* subtract AI's score from opponents score
		// 2. Pick the simultation which has the greatest score advantage.
		//    (for less difficult AI, run fewer simulations)
		async _montecarlo(timelimit) {
			let deadline = Date.now() + timelimit,
				bestScoreAdvantage = -Infinity,
				bestCard, bestCardRevived,
				i = 0;

			while (Date.now() < deadline) {
				await new Promise(resolve => {
					let game = cloneGame(this.game),
						cardPlayed, cardRevived,
						moved, revived;

					game.on('pick', card => {
						if (!moved) {
							moved = true;
							cardPlayed = card;
						} else if (!revived) {
							revived = true;
							cardRevived = card;
						}
					});

					let j = 0;
					game.on('end-round', (winner, gameEnd) => {
						j++;
						if (gameEnd || j > 3) {
							game.terminate();
							let aiPlayer = game.players.find(p => p.original === this),
								aiScore = aiPlayer.score,
								opponents = game.players.filter(p => p !== aiPlayer),
								nextHighestScore = Math.max(...opponents.map(p => p.score)),
								scoreAdvantage = aiScore - nextHighestScore;
							if (scoreAdvantage > bestScoreAdvantage) {
								bestScoreAdvantage = scoreAdvantage;
								bestCard = cardPlayed;
								bestCardRevived = cardRevived;
							}
							//console.log(`Sim#${String(i).padStart(2, '0')}: ${String(scoreAdvantage).padStart(3)} point win (${String(score).padStart(3)} points) with ${cardPlayed ? cardPlayed.name : '[pass]'}`);
							resolve();
						}
					});

					game.turn--;
					game._nextTurn();
					i++;
				});
			}

			console.log(`Best of ${i} simulations: ${String(bestScoreAdvantage).padStart(3)} point win with ${bestCard ? bestCard.name : '[pass]'}`);
			return { card: bestCard, revivedCard: bestCardRevived };
		}
	}

	class IllegalMove extends Error {
		constructor(reason) {
			super(reason);
		}
	}

	class IllegalCard extends Error {
		constructor() {
			super('The player has no right to pick this card.');
		}
	}

	class PlayerHuman extends Player {
		constructor({ onWaitForRedraw, onWaitForPlay }) {
			super();
			this.type = 'Human';
			this.waitForPlay = onWaitForPlay;
			this.waitForRedraw = onWaitForRedraw;
		}

		// Redraws a card in player's hand. If undefined, no card will be redrawed
		async redraw(redrawCount) {
			return await new Promise(resolve => {
				this.waitForRedraw(redrawCount, card => {
					if (card && !this.hand.includes(card)) {
						throw new IllegalCard();
					}
					resolve(card);
				});
			});
		}
		
		async play(revive, possibleMoves) {
			return await new Promise(resolve => {
				this.waitForPlay(revive, card => {
					if (card) {
						let move = possibleMoves.find(p => p.card === card);
						if (!move) {
							throw new IllegalCard();
						}
						if (!move.legal) {
							throw new IllegalMove(move.reason);
						}
					}
					resolve(card);
				});
			});
		}
	}

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

	const arrangeCards = ($pile, cards$$1, cascade, facedown, order) => {
		let cardWidth = CARD_WIDTH,
			coords = getCoords($pile),
			width = Math.min(cardWidth * cards$$1.length, $pile.offsetWidth),
			x = coords.x + $pile.offsetWidth / 2 - width / 2,
			offset = width / (cards$$1.length);
		
		if (offset < cardWidth) {
			offset -= (cardWidth - ($pile.offsetWidth / cards$$1.length)) / cards$$1.length;
		}

		if (order) {
			// Sort by sabotage cards first, then remedy cards, then drivers in order of distance
			cards$$1 = cards$$1.map(card => {
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

		cards$$1.forEach((card, i) => {
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
		cards.forEach(card => {
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

}());
//# sourceMappingURL=bundle.js.map
