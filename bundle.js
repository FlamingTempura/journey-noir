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

	const weightedPick = arr => {
		let sum = 0,
			choices = [];
		arr.forEach(([el, probability]) => {
			sum += probability;
			choices.push({ min: sum - probability, max: sum, el });
		});
		let val = Math.random() * sum;
		console.log(val, choices);
		return choices.find(({ min, max }) => val >= min && val < max).el;
	};

	const removeEl = (arr, el) => {
		let i = arr.indexOf(el);
		if (i > -1) {
			arr.splice(i, 1);
		}
	};

	const pick = arr => arr[Math.floor(Math.random() * arr.length)];

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
		console.log('order', cards$$1);
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
			this._emit('status', 'Dealing...');
			this.deck = createDeck();
			this.discard = [];
			this.turn = -3; // not yet started
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
			if (player.type === 'ai') {
				await this._thinking(player, 800);
				if (Math.random() > 0.4) { // TODO: make this more intelligent
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
					player.score = player.journey.reduce((sum$$1, card) => sum$$1 + card.distance, 0);
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
			if (player.type === 'ai') {
				await this._thinking(player, 1800);
				let choices = prospects
					.filter(prospect => prospect.value > 0)
					.map(prospect => [prospect.card, prospect.value]);
				let skipChance = 0.5 - 0.4 * Math.log10(choices.length);
				if (choices.length > 0 && Math.random() > skipChance) {
					await this._playCard(player, pile, weightedPick(choices)); // TODO: AI should intelligently pass
				} else if (!reviving) {
					await this._pass(player);
				}
			} else {
				await new Promise(resolve => {
					this.resolvePlay = async card => {
						if (card) {
							let prospect = prospects.find(p => p.card === card);
							if (!prospect) {
								console.log('ignored, not player\'s own card');
								return;
							}
							if (prospect.value < 0) {
								throw new Error(prospect.reason);
							}
							await this._playCard(player, pile, card);
						} else if (!reviving) {
							await this._pass(player);
						}
						resolve();
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

		_getProspects(player, cards$$1) {
			return cards$$1.map(card => {
				let prospect = this._getProspect(player, card);
				return { card, value: prospect[0], reason: prospect[1] };
			});
		}
	}

	const newGame = () => new Game();

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

}());
//# sourceMappingURL=bundle.js.map
