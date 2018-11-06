import { deepCopy } from './utils';

let uid = 0;
export default class Player {
	constructor() {
		this.uid = uid++;
		this.name = `Player ${uid}`;
		this.hand = [];
		this.journey = [];
		this.sabotage = [];
		this.tokens = 0;
	}
	castTo(PlayerClass) {
		let copy = new PlayerClass();
		copy.hand = deepCopy(this.hand);
		copy.journey = deepCopy(this.journey);
		copy.sabotage = deepCopy(this.sabotage);
		copy.tokens = this.tokens;
		return copy;
	}
}