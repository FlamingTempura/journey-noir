export const $ = (selector, $root = document) => $root.querySelector(selector);

export const $copy = (selector, $root = document) => $('*', $root.importNode($(selector).content, true));

export const shuffle = (arr) => {
	var j, x, i;
	for (i = arr.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		x = arr[i];
		arr[i] = arr[j];
		arr[j] = x;
	}
	return arr;
};

export const random = (min, max) => Math.round(min + Math.random() * (max - min));

export const wait = duration => new Promise(resolve => {
	setTimeout(resolve, duration);
});

export const last = arr => arr[arr.length - 1];

export const removeEl = (arr, el) => {
	let i = arr.indexOf(el);
	if (i > -1) {
		arr.splice(i, 1);
	}
};

export const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export class Events {
	constructor() {
		this.listeners = {};
	}
	on(event, callback) {
		if (!this.listeners[event]) { this.listeners[event] = []; }
		this.listeners[event].push(callback);
	}
	off(event, callback) {
		let callbacks = this.listeners[event] || [];
		this.listeners[event] = callbacks.filter(cb => cb !== callback);
	}
	async emit(event, ...args) {
		let callbacks = this.listeners[event] || [];
		await Promise.all(callbacks.map(cb => cb(...args)));
	}
}