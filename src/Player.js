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
}