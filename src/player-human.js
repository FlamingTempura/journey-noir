import { pick, wait, random, weightedPick } from './utils';

export default class HumanPlayer {
	constructor({ onWaitForRedraw, onWaitForPlay }) {
		this.type = 'Human';
		this.onWaitForPlay = onWaitForPlay;
		this.onWaitForRedraw = onWaitForRedraw;
	}
	// Redraws a card in player's hand. If undefined, no card will be redrawed
	async redraw() {
		return await this.onWaitForRedraw(redrawCount);
	}
	async play(prospects) {
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

	async play(card) {
		if (this.resolvePlay) {
			await this.resolvePlay(card);
		}
	}
}