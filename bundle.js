(function () {
	'use strict';

	const $ = (selector, $root = document) => $root.querySelector(selector);

	const $copy = (selector, $root = document) => $('*', $root.importNode($(selector).content, true));

	const times = (n, cb) => Array(n).fill(0).map((u, i) => cb(i));

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

	var cards = [
		// SABOTAGE
		{
			type: 'sabotage',
			name: 'Stinger',
			description: 'Play on an opponent’s sabotage pile to give them a puncture.',
			quote: '‘This is crazy,’ I mumbled. She threw me that look. I lugged the damn Stinger out of the trunk set it across the street. They didn’t see it coming.',
			artwork: 'sabotage-puncture.jpg',
			effect: 'puncture',
			quantity: 3
		},
		{
			type: 'sabotage',
			name: 'Speed Limit',
			description: 'Play on an opponent’s sabotage pile to stop them playing journey cards higher than 15.',
			quote: 'I gave a beat cop 20 bucks to keep a look out.',
			artwork: 'sabotage-speedlimit.jpg',
			effect: 'speedlimit',
			quantity: 3
		},
		{
			type: 'sabotage',
			name: 'Pursuit',
			description: 'Play on an opponent’s sabotage pile to stop them playing journey cards lower then 75.',
			quote: 'A buck here, a buck there, you make your name with the cops. I dialed 911 and hit call.',
			artwork: 'sabotage-pursuit.jpg',
			effect: 'pursuit',
			quantity: 3
		},
		{
			type: 'sabotage',
			name: 'Detour',
			description: 'Discard this card and all of an opponent’s lowest distances.',
			quote: 'Detour signs litter the junkyard. Useful. I chuck one up on the road. Someone will always follow the signs.',
			artwork: 'sabotage-detour.jpg',
			effect: 'detour',
			quantity: 3
		},

		// REMEDIES
		{
			type: 'remedy',
			name: 'Chop Shop',
			quote: 'It was a shady joint. A shadow in the doorway, glow of a cigarette. A place that won’t ask questions',
			description: 'Play on your sabotage pile to remedy a Stinger.',
			artwork: 'remedy-puncture.jpg',
			remedies: 'puncture',
			quantity: 3
		},
		{
			type: 'remedy',
			name: 'Toll Gate',
			description: 'Play on your sabotage pile to remedy a Speed Limit.',
			quote: 'At the end of the road there’s a police stop. We call it the Toll Gate. But really your paying to not get noticed.',
			artwork: 'remedy-speedlimit.jpg',
			remedies: 'speedlimit',
			quantity: 3
		},
		{
			type: 'remedy',
			name: 'New coat of paint',
			description: 'Play on your sabotage pile to end a Pursuit.',
			quote: 'The cops were onto us. But here was a broad who knew the right color for a Plymouth. Scarlet. The color of her lipstick.',
			artwork: 'remedy-pursuit.jpg',
			remedies: 'pursuit',
			quantity: 3
		},

		// SKILLED DRIVERS
		{
			type: 'driver',
			name: 'The Mechanic', // F
			description: 'Play to your Journey area to protect against Stinger.',
			quote: 'Years doing jobs taught me a thing or two about mechanics. But this gal knew her way about a Plymouth. She was part of the car.',
			artwork: 'driver-mechanic.jpg',
			distance: 10,
			remedies: 'puncture',
			prevents: 'puncture',
			quantity: 3
		},
		{
			type: 'driver',
			name: 'The Brute', // M
			description: 'Play to your Journey area to protect against Pursuit.',
			quote: 'Life on the inside had taken its toll. He could barely murmur a word. But he was armed to the teeth. Nobody dared get close to us.',
			artwork: 'driver-brute.jpg',
			distance: 30,
			remedies: 'pursuit',
			prevents: 'pursuit',
			quantity: 3
		},
		{
			type: 'driver',
			name: 'Mayor Ducane', // F
			description: 'Play to your Journey area to protect against Speed Limit.',
			quote: 'The mayor’s an old friend. She swerves to avoid a crossing gal. ’Broads!’ I shouted. How was I supposed to know she had daughter. We didnt speak a word for 60 damn miles.',
			artwork: 'driver-mayor.jpg',
			distance: 50,
			remedies: 'speedlimit',
			prevents: 'speedlimit',
			quantity: 3
		},
		{
			type: 'driver',
			name: 'The Navigator',
			description: 'Play on your Journey area to protect against Detours.',
			quote: '',
			distance: 30,
			artwork: 'driver-navigator.jpg',
			prevents: 'detour',
			quantity: 3
		},

		// REVIVES
		{
			type: 'driver',
			name: 'Nurse',
			description: 'Play to your Journey pile then pick any discarded card and immediately play it.',
			quote: 'She took a drag of a cigarette and handed me a cup of brown. Tasted of ash.',
			artwork: 'driver-nurse.jpg',
			distance: 0,
			effect: 'revive',
			quantity: 3
		},
		{
			type: 'driver',
			name: 'Vet',
			description: 'Play to your Journey pile then pick any discarded card and immediately play it.',
			quote: 'He was a grisly guy with a stench of fomaldehyde. An animal doctor. Hospital wasn’t an option, so this was the next best thing.',
			artwork: 'driver-vet.jpg',
			distance: 0,
			effect: 'revive',
			quantity: 3
		},

		// TURNCOATS
		{
			type: 'driver',
			name: 'Turncoat Rita',
			description: 'Play to an opponent’s Journey pile and draw two cards.',
			quote: 'Damn you Rita. Broke my heart. I should have seen this coming. The way you talked about them.',
			artwork: 'driver-rita.png',
			distance: 0,
			effect: 'turncoat',
			quantity: 1
		},
		{
			type: 'driver',
			name: 'Crafty Jenkins',
			description: 'Play to an opponent’s Journey pile and draw two cards.',
			quote: 'I never trusted Jenkins. Had her hat in too many rings. But desperate times... I gave her the keys.',
			artwork: 'driver-jenkins.jpg',
			effect: 'turncoat',
			distance: 20,
			quantity: 2
		},
		{
			type: 'driver',
			name: 'Bill',
			description: 'Play to an opponent’s Journey pile and draw two cards.',
			quote: 'Bill was the kind of bastard you never trust. He’d sell out his own mother for a fix. Hope to never see his gnarly mug again.',
			artwork: 'driver-bill.jpg',
			distance: 50,
			effect: 'turncoat',
			quantity: 2
		},

		// DRIVER
		{
			type: 'driver',
			name: 'Old Smokey',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			quote: 'The stench of cheap cigarettes. He asks if I’ve got a light. I fumble for a match. Something wasn’t right.',
			artwork: 'driver-oldsmokey.jpg',
			distance: 5,
			quantity: 6
		},
		{
			type: 'driver',
			name: 'Dolly',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			quote: 'She said it was better on the outside. Dolly was feeding me a can of lies. It was for my own good. She was trying to save me.',
			artwork: 'driver-dolly.jpg',
			distance: 10,
			quantity: 8
		},
		{
			type: 'driver',
			name: 'Butler',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			quote: 'We go back. Last job he took four slugs to the chest. Never been the same. A stare that crushes hope and fills you with dread.',
			artwork: 'driver-butler.jpg',
			distance: 15,
			quantity: 10
		},
		{
			type: 'driver',
			name: 'Cat Ducane',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			quote: 'I run through the alley. A broad calls out ’get in.’ I did. I open my mouth to speak, but she didn’t give a damn who I am.',
			artwork: 'driver-cat.jpg',
			distance: 30,
			quantity: 8
		},
		{
			type: 'driver',
			name: 'Briggs',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			quote: 'The outsider. The loner. There are only tales of Briggs, he leaves no witnesses. But he drives stick.',
			artwork: 'driver-briggs.jpg',
			distance: 50,
			quantity: 6
		},
		{
			type: 'driver',
			name: 'Wheelman Phelps',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			quote: 'The thrill of the chase. We were pushing {{distance}}. I’d heard of Phelps through Ducane. A friend of Ducane is a friend of mine.',
			artwork: 'driver-wheelman.jpg',
			quantity: 2,
			distance: 75
		},
		{
			type: 'driver',
			name: 'Don Marloni',
			quote: 'A muffled scream in the trunk. I said nothing. The Don, the big man, he’ll rip your teeth out and wear them as cufflinks.',
			description: 'Play to your Journey area to travel {{distance}} miles.',
			artwork: 'driver-don.jpg',
			quantity: 2,
			distance: 100
		}
	];

	const topCard = arr => arr[arr.length - 1] || {};

	const createDeck = () => {
		let deck = [],
			i = 0;
		cards.forEach((card, j) => {
			times(card.quantity, () => {
				deck.push(Object.assign({ id: j, uid: i++ }, card));
			});
		});
		console.log(`Deck contains ${deck.length} cards`);
		return shuffle(deck);
	};

	// Sort by sabotage cards first, then remedy cards, then drivers in order of distance
	const orderCards = cards$$1 => {
		cards$$1.map(card => {
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
			.forEach((a, i) => cards$$1.splice(i, 1, a[1]));
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
					player.score = player.journey.reduce((sum$$1, card) => sum$$1 + card.distance, 0);
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

				skipChance = Math.max(0.1, Math.min(0.9, 0.5 - 0.4 * Math.log10(choices.length)));

			if (choices.length > 0 && Math.random() > skipChance) {
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
			//_player.original = player;
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
			await this._thinking(800);
			if (Math.random() > 0.4) { // TODO: make this more intelligent
				return pick(this.hand); 
			}
			return null; // skip redraw
		}

		// 1. Run 100 simulations. A simulation comprises of the following:
		// 	* pick a card in AI's hand
		// 	* reasonably predict a card that AI's opponent could play 
		// 	* repeat until the round is likely to end
		// 	* subtract AI's score from opponents score
		// 2. Pick the simultation which has the greatest score advantage.
		//    (for less difficult AI, run fewer simulations)
		async play(revive) {
			//await this._thinking(1800);

			if (revive) {
				return this.revivedCard;
			}

			let bestScoreAdvantage = -Infinity,
				bestCard, bestCardRevived;

			for (let i = 0; i < 200; i++) {
				await new Promise(resolve => {
					let game = cloneGame(this.game),
						cardPlayed, cardRevived,
						moved, revived,
						onMove = card => {
							if (!moved) {
								moved = true;
								cardPlayed = card;
							} else if (!revived) {
								revived = true;
								cardRevived = card;
							}
						};

					game.on('card-moved', card => onMove(card));
					game.on('pass', () => onMove());
					game.on('end-round', (winner, gameEnd) => {
						if (gameEnd) {
							let score = game.players[0].score,
								scoreAdvantage = score - game.players[1].score; // FIXME
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
				});
			}

			console.log(`Best: ${String(bestScoreAdvantage).padStart(3)} point win with ${bestCard ? bestCard.name : '[pass]'}`);
			this.revivedCard = bestCardRevived;
			return bestCard;
		}

		// Artificial thinking time
		async _thinking(min, max) {
			await wait(random(min, max || min));
		}
	}

	class IllegalMove extends Error {
		constructor(reason) {
			super(`This card cannot be played because ${reason}`);
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

	let resolvePickCard;

	const game = new Game();

	const message = async str => {
		$status.textContent = str;
		$status.classList.add('message');
		await wait(600);
		$status.classList.remove('message');
	};

	const fanCards = ($pile, cards$$1, cascade, facedown) => { // spread cards as a fan
		let cardWidth = $('.card').offsetWidth,
			coords = getCoords($pile),
			width = Math.min(cardWidth * cards$$1.length, $pile.offsetWidth),
			x = coords.x + $pile.offsetWidth / 2 - width / 2,
			offset = width / (cards$$1.length);
		
		if (offset < cardWidth) {
			offset -= (cardWidth - ($pile.offsetWidth / cards$$1.length)) / cards$$1.length;
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

	game.addPlayer(new PlayerSmartAI());
	game.addPlayer(new PlayerHuman({
		onWaitForPlay(revive, callback) {
			console.log('You must now pick a card to play');
			$('#pass').style.display = 'inline-block';
			if (revive) {
				$('#discard').classList.add('expand');
				setTimeout(() => fanCards($('#discard'), game.discard), 500);
				message('Pick a card to immediately play');
			}
			resolvePickCard = card => {
				try {
					console.log(`You picked ${card ? card.name : '[passed]'} to play`);
					callback(card);
					$('#pass').style.display = 'none';
					if (revive) {
						$('#discard').classList.remove('expand');
						setTimeout(() => fanCards($('#discard'), game.discard, true), 500);
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
					$('#skipredraw').style.display = 'none';
				} catch (e) {
					console.error('Failed!', e);
					message(e.message);
				}
			};
		}
	}));

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
	});

	game.on('start-round', async startPlayer => {
		console.log(`Start round`);
		game.players.forEach(player => {
			$(`#player${player.uid} .score`).textContent = `0 miles`;
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
		await message(`${winner.type === 'Human' ? 'You' : 'Your Opponent'} won the ${gameEnd ? 'game' : 'round'}`);
	});

	let zIndex = 140;
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
				fanCards($('#discard'), game.discard, true);
				$card.classList.add('discarded');
				setTimeout(() => {
					$card.classList.remove('discarding');
				});
			});
			await wait(400);
		}
		
		game.players.forEach(player => {
			fanCards($(`#player${player.uid} .hand`), player.hand, false, player.type === 'AI');
			fanCards($(`#player${player.uid} .journey-area`), player.journey);
			fanCards($(`#player${player.uid} .sabotage-area`), player.sabotage, true);
			let sabotaged = last(player.sabotage);
			$(`#player${player.uid}`).classList.toggle('sabotaged', !!sabotaged);
			if (sabotaged) {
				$(`#player${player.uid} .sabotage-status .icon`).src = `icons/${sabotaged.effect}.svg`;
			}
		});

		if (game.turn === -3) { // shorter wait when dealing cards
			await wait(100);
		} else {
			await wait(1200);
		}
	});

	game.on('end-turn', () => {
		console.log(`End turn`);
		game.players.forEach(player => {
			$(`#player${player.uid} .score`).textContent = `${player.score || 0} miles`;
		});
	});

	game.on('status', msg => {
		console.log(`%cStatus: ${msg}`, 'color:violet');
		$status.textContent = msg;
	});

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
