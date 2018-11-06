import { pick, wait, random, weightedPick } from './utils';
import StupidAIPlayer from './player-aistupid';
import Player from './player';

export default class CleverAIPlayer extends Player {
	constructor() {
		super();
		this.type = 'AI';
	}
	async redraw() {
		await this._thinking(800);
		if (Math.random() > 0.4) { // TODO: make this more intelligent
			return pick(this.player.hand); 
		}
		return null; // skip redraw
	}
	// 1. Run 100 simulations. A simulation comprises of the following:
	// 	* pick a card in AI's hand
	// 	* reasonably predict a card that AI's opponent could play 
	// 	* repeat until the round is likely to end
	// 	* subtract AI's score from opponents score
	// 2. Pick the simultation which has the greatest score advantage.
	//    (for less difficult AI, pick simulations with lower score advantages)
	async play(prospects) {
		await this._thinking(1800);

		let simulations = times(10, i => {
			let game = this.game.clone();
			game.players.forEach(player => player.castTo(StupidAI));
			game.on('end-round', () => {
				let simulations[i] = {
					card,
					score: game.player[0].score - game.player[1].score
				};
				game.finish();
			});
			game.continue();
		});

		return simulations.highest().card; // otherwise, pass
	}
	// Artificial thinking time
	async _thinking(min, max) {
		this.game._emit('status', 'AI is thinking....');
		this.player._thinking = true;
		await wait(random(min, max || min));
		this.player._thinking = false;
	}
}