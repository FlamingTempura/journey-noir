export const $ = (selector, $root = document) => $root.querySelector(selector);

export const $$ = (selector, $root = document) => [...$root.querySelectorAll(selector)];

export const $copy = (selector, $root = document) => $('*', $root.importNode($(selector).content, true));

export const times = (n, cb) => Array(n).fill(0).map((u, i) => cb(i));

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

export const sum = (arr, key) => arr.reduce((memo, obj) => memo + obj[key], 0);

export const weightedPick = arr => {
	let sum = 0,
		choices = [];
	arr.forEach(([el, probability]) => {
		sum += probability;
		choices.push({ min: sum - probability, max: sum, el });
	});
	let val = Math.random() * sum;
	console.log(val, choices);
	return choices.find(({ min, max }) => val >= min && val < max).el;
};

export const removeEl = (arr, el) => {
	let i = arr.indexOf(el);
	if (i > -1) {
		arr.splice(i, 1);
	}
};

export const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export const deepClone = obj => {
	if (obj instanceof Array) {
		return obj.map(el => deepClone(el));
	} else if (obj instanceof Object) {
		let copy = {};
		Object.entries(obj).forEach(([k, v]) => copy[k] = deepClone[v]);
		return copy;
	}
	return obj;
};
