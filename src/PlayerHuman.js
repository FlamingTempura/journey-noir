import Player from './Player';

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

export default class PlayerHuman extends Player {
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