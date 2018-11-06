import { pick, wait, random, weightedPick } from './utils';

export default class StupidAIPlayer {
	constructor() {
		this.type = 'AI';
	}
	async redraw() {
		await this._thinking(800);
		if (Math.random() > 0.4) { // TODO: make this more intelligent
			return pick(this.hand); 
		}
		return null; // skip redraw
	}
	async play(prospects) {
		await this._thinking(1800);
		let choices = prospects
			.filter(prospect => prospect.value > 0)
			.map(prospect => [prospect.card, prospect.value]);
		let skipChance = 0.5 - 0.4 * Math.log10(choices.length);
		console.log('choice', choices, skipChance)
		if (choices.length > 0 && Math.random() > skipChance) {
			return weightedPick(choices); // TODO: AI should intelligently pass
		}
		return null; // otherwise, pass
	}
	// Artificial thinking time
	async _thinking(min, max) {
		this.game._emit('status', 'AI is thinking....');
		await wait(random(min, max || min));
	}
}