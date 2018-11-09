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