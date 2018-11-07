import { pick, wait, random } from './utils';
import PlayerBasicAI from './PlayerBasicAI';
import Player from './Player';
import Game from './Game';

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

export default class PlayerSmartAI extends Player {
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