import { random } from './utils';
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
		_player.original = player;
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