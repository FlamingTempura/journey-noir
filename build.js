'use strict';

const fs = require('fs').promises;
const fs2 = require('fs');
const gaze = require('gaze');
const less = require('less');
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const CARDS = require('./src/cards.js');
const phantom = require('phantom');

const styles = () => {
	return fs.readFile('src/style.less', 'utf8')
		.then(data => less.render(data))
		.then(output => fs.writeFile('build/style.css', output.css, 'utf8'));
};

const assets = () => {
	return fs.copyFile('src/index.html', 'build/index.html')
		.then(() => fs.mkdir('build/assets').catch(() => {}))
		.then(() => fs.readdir('src/assets'))
		.then(files => {
			return Promise.all(files.map(file => {
				return fs.copyFile(`src/assets/${file}`, `build/assets/${file}`);
			}));
		});
};

const scripts = () => {
	return rollup
		.rollup({
			input: 'src/main.js',
			plugins: [
				resolve(),
				commonjs()
			]
		})
		.then(bundle => bundle.write({
			name: 'blah',
			format: 'iife',
			sourcemap: true,
			file: 'build/bundle.js'
		}));
};

const mustache = (str = '', data = {}) => str.replace(/\{\{([^}]+)\}\}/g, (m, key) => data[key.trim()]);

const svg2png = (svg, filename, { width, height }) => {
	return phantom.create()
		.then(instance => instance.createPage())
		.then(page => {
			page.setContent(svg, `file://${__dirname}/src/cards/`);
			setTimeout(() => {
				page.property('viewportSize', { width, height });
				page.render(filename);
			}, 100);
		});
};

const svgSize = svg => {
	let m = svg.match(/viewBox="\d+ \d+ (\d+) (\d+)"/);
	return { width: Number(m[1]), height: Number(m[2]) };
};

const cards = () => {
	const colors = {
		sabotage: '#b33939',
		remedy: '#218c74',
		driver: '#1e272e',
		protection: '#ffb142'
	};
	return Promise
		.all([
			fs.readFile('./src/cards/templates/large.svg', 'utf8'),
			fs.readFile('./src/cards/templates/small.svg', 'utf8')
		])
		.then(([templateLarge, templateSmall]) => Promise.all(CARDS.map((card, i) => {
			let icon = card.causes || card.remedies || card.prevents || card.ignores,
				data = {
					color: colors[card.type],
					ringColor: card.ignores ? '#ffb142' : colors[card.type],
					distance: card.hasOwnProperty('distance') ? card.distance : '',
					icon: icon && fs2.readFileSync(`./src/cards/icons/${icon}.svg`, 'utf8'),
					showIcon1: card.type !== 'driver' && icon ? 1 : 0,
					showIcon2: card.type === 'driver' && icon ? 1 : 0,
					crossIcon1: card.type !== 'driver' && (card.remedies || card.prevents || card.ignores) ? 1 : 0,
					crossIcon2: card.type === 'driver' && (card.remedies || card.prevents || card.ignores) ? 1 : 0,
					name: card.name.toUpperCase(),
					quote: `“${mustache(card.quote, card)}”`,
					description: mustache(card.description, card)
				},
				[large, small] = [templateLarge, templateSmall].map(template => {
					return template
						.replace(/(\n\s*).*<!--CONTENT:([^-]+)-->/g, (m, indent, key) => indent + data[key])
						.replace(/\sx-style-([^=]+)="([^"]+)"/g, (m, attr, key) => ` style="${attr}:${data[key]}"`)
						.replace(/\sx-([^=]+)="([^"]+)"/g, (m, attr, key) => ` ${attr}="${data[key]}"`)
						.replace(/href="[^"]*\.jpg"/, `href="./artwork/${card.artwork}"`);
				});
			return Promise.all([
				svg2png(large, `./build/cards/${i}.png`, svgSize(templateLarge)),
				svg2png(small, `./build/cards/${i}-sm.png`, svgSize(templateSmall))
			]);
		})));
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

fs.mkdir('build')
	.catch(() => {})
	.then(() => Promise.all([
		//watch('cards', ['src/cards.js', 'src/cards/**/*'], cards),
		watch('styles', ['src/**/*.less'], styles),
		watch('assets', ['src/index.html', 'src/assets/**/*'], assets),
		watch('scripts', ['src/**/*.js'], scripts)
	]))
	.then(() => console.log('Success. Waiting for changes...'));
