import { pick, wait, random } from './utils';
import Player from './Player';

export default class PlayerBasicAI extends Player {
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