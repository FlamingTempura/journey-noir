'use strict';

const fs = require('fs').promises;
const path = require('path');
const gaze = require('gaze');
const less = require('less');
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const CARDS = require('./src/cards.js');
const phantom = require('phantom');

const styles = async () => {
	let data = await fs.readFile(path.join(__dirname, 'src', 'style.less'), 'utf8'),
		output = await less.render(data);
	await fs.writeFile(path.join(__dirname, 'style.css'), output.css, 'utf8');
};

const scripts = async () => {
	let bundle = await rollup.rollup({
		input: path.join(__dirname, 'src', 'main.js'),
		plugins: [resolve(), commonjs()]
	});
	await bundle.write({
		name: 'journey',
		format: 'iife',
		sourcemap: true,
		file: 'bundle.js'
	});
};

const mustache = (str = '', data = {}) => str.replace(/\{\{([^}]+)\}\}/g, (m, key) => data[key.trim()]);

const svg2png = async (svg, filename, { width, height }) => {
	let instance = await phantom.create(),
		page = await instance.createPage();
	await page.setContent(svg, `file:///${__dirname.replace(/\\/g, '/')}/`);
	await page.property('content');
	await page.property('viewportSize', { width, height });
	await page.render(filename);
	await instance.exit();
};

const svgSize = svg => {
	let m = svg.match(/viewBox="\d+ \d+ (\d+) (\d+)"/);
	return { width: Number(m[1]), height: Number(m[2]) };
};

const colors = {
	sabotage: '#b33939',
	remedy: '#218c74',
	driver: '#000',//'#1e272e',
	protection: '#ffb142'
};

const cards = async () => {
	let templateSmall = await fs.readFile(path.join(__dirname, 'src', 'templates', 'small.svg'), 'utf8'),
		templateLarge = await fs.readFile(path.join(__dirname, 'src', 'templates', 'large.svg'), 'utf8'),
		promises = [];

	for (let card of CARDS) {
		let icon = card.effect || card.remedies || card.prevents,
			data = {
				color: colors[card.type],
				ringColor: card.prevents ? '#ffb142' : colors[card.type],
				distance: card.hasOwnProperty('distance') ? card.distance : '',
				icon: icon && await fs.readFile(path.join(__dirname, 'icons', `${icon}.svg`), 'utf8'),
				showIcon1: card.type !== 'driver' && icon ? 1 : 0,
				showIcon2: card.type === 'driver' && icon ? 1 : 0,
				crossIcon1: card.type !== 'driver' && (card.remedies || card.prevents) ? 1 : 0,
				crossIcon2: card.type === 'driver' && (card.remedies || card.prevents) ? 1 : 0,
				name: card.name.toUpperCase(),
				quote: `“${mustache(card.quote, card)}”`,
				description: mustache(card.description, card)
			},
			[large, small] = [templateLarge, templateSmall].map(template => {
				return template
					.replace(/(\n\s*).*<!--CONTENT:([^-]+)-->/g, (m, indent, key) => indent + data[key])
					.replace(/\sx-style-([^=]+)="([^"]+)"/g, (m, attr, key) => ` style="${attr}:${data[key]}"`)
					.replace(/\sx-([^=]+)="([^"]+)"/g, (m, attr, key) => ` ${attr}="${data[key]}"`)
					.replace(/href="[^"]*\.jpg"/, `href="./src/artwork/${card.artwork}"`);
			});
		promises.push(
			svg2png(large, path.join(__dirname, 'cards', `${CARDS.indexOf(card)}.png`), svgSize(templateLarge)),
			svg2png(small, path.join(__dirname, 'cards', `${CARDS.indexOf(card)}-sm.png`), svgSize(templateSmall))
		);
	}
	await Promise.all(promises);
};

const watch = (id, patterns, callback) => {
	let build = () => {
		console.log(`Building ${id}...`);
		console.time(`Built ${id}`);
		return Promise.resolve(callback())
			.then(() => console.timeEnd(`Built ${id}`))
			.catch(err => console.error(`failed building ${id}`, err));
	};
	gaze(patterns, (err, watcher) => watcher.on('all', build));
	return build();
};

const build = async () => {
	await Promise.all([
		watch('cards', ['src/cards.js', 'icons/**/*', 'artwork/**/*'], cards),
		watch('styles', ['src/**/*.less'], styles),
		watch('scripts', ['src/**/*.js'], scripts)
	]);
	console.log('Success. Waiting for changes...');
};

build();
