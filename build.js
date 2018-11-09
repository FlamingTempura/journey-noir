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
	await fs.writeFile(path.join(__dirname, 'assets', 'style.css'), output.css, 'utf8');
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
		file: path.join(__dirname, 'assets', 'bundle.js')
	});
};

const colors = {
	sabotage: '#b33939',
	remedy: '#218c74',
	driver: '#000',//'#1e272e',
	protection: '#ffb142'
};

const renderCard = async card => {
	let icon = card.effect || card.remedies || card.prevents ? await fs.readFile(`assets/icons/${card.effect || card.remedies || card.prevents}.svg`, 'utf8') : '',
		shield = await fs.readFile(`assets/icons/shield.svg`, 'utf8'),
		artwork = card.artwork ? await fs.readFile(`assets/artwork/${card.artwork}.svg`, 'utf8') : '';

	let html = `
	<div class="card ${card.type} ${card.prevents ? 'skilled' : ''} ${card.effect || ''}">
		<div class="title">${card.name.toUpperCase()}</div>
		<div class="angle top"></div>
		<div class="angle bottom"></div>`;
	if (icon) {
		html += `
		<div class="icon">${icon}</div>`;
	}
	if (card.type === 'remedy') {
		html += `
		<div class="cross-icon"></div>
		<div class="cross"></div>`;
	}
	if (card.prevents) {
		html += `
		<div class="shield">${shield}</div>`;
	}
	if (card.type === 'driver' && !card.effect && !card.prevents) {
		html += `
		<div class="distance-icon">${card.distance}</div>`;
	}
	if (card.type === 'sabotage' || card.type === 'remedy') {
		html += `
		<div class="circle"></div>
		<div class="artwork">${icon}</div>`;
	}
	if (card.effect === 'speedlimit') {
		html += `
		<div class="distance down">15</div>`;
	} else if (card.effect === 'pursuit') {
		html += `
		<div class="distance up">75</div>`;
	}
	if (card.type === 'driver') {
		html += `
		<div class="distance">${card.distance}</div>
		<div class="artwork ${card.artwork}">${artwork}</div>
		<div class="quote">${card.quote.replace('{{distance}}', card.distance)}</div>`;
	}
	html += `
		<div class="instruction">${card.description.replace('{{distance}}', card.distance)}</div>
	</div>`;
	return html;
};

const cards = async () => {
	let car  =await fs.readFile(`assets/icons/journey.svg`, 'utf8');
	let back = `
		<div class="card reverse" id="@ID">
			<div class="border"></div>
			<div class="title"></div>
			<div class="logo">Journey Noir!</div>
			<div class="angle top"></div>
			<div class="angle bottom"></div>
			<div class="instruction"></div>
			<div class="car car1">${car}</div>
			<div class="car car2">${car}</div>
		</div>`;

	let html = await fs.readFile(path.join(__dirname, 'src', 'cards.html'), 'utf8'),
		cards = '',
		ids = [];;
	cards += back;
	ids.push('0');
	for (let card of CARDS) {
		cards += await renderCard(card);
		ids.push(CARDS.indexOf(card) + 1);
	}
	cards += `<div class="small">`;
	cards += back;
	ids.push('0-sm');
	for (let card of CARDS) {
		cards += await renderCard(card);
		ids.push((CARDS.indexOf(card) + 1) + '-sm');
	}
	cards += `</div>`;
	html = html.replace(/(<!--CARDS-->).*(<!--\/CARDS-->)/s, `$1${cards}$2`);
	await fs.writeFile(path.join(__dirname, 'src', 'cards.html'), html, 'utf8');

	let instance = await phantom.create(),
		page = await instance.createPage();
	
	let palatte = {};
	html.replace(/--([^ :;]+):([^);]+);/g, (m, key, color) => palatte[key.trim()] = color.trim());
	html = html.replace(/var\(--([^)]+)\)/g, (m, key) => palatte[key.trim()]);
	html = html.replace(/\stransform:/g, '-webkit-transform:');
	html = html.replace(/#473522/, 'none');
	let width = html.match(/width:([^;]+)in/)[1].trim(),
		height = html.match(/height:([^;]+)in/)[1].trim();
	width = Math.round(Number(width) * 96); // 96 pixels per inch
	height = Math.round(Number(height) * 96);
	await page.setContent(html, `file:///${__dirname.replace(/\\/g, '/')}/src/`);
	await page.property('content');
	await page.property('zoomFactor', 4);
	
	for (let id of ids) {
		// ugly hacks below to make phantom work
		let js = `[].map.call(document.getElementsByClassName('card'), function (el, i) { el.setAttribute('show-only', i === ${ids.indexOf(id)} ? 'yes' : 'no'); }) && prompt`;
		page.evaluateJavaScript(js);
		if (String(id).endsWith('sm')) {
			await page.property('viewportSize', { width: width * 4, height: 2.65 * 96 * 4  });
		} else {
			await page.property('viewportSize', { width: width * 4, height: height * 4 });
		}
		await page.render(path.join(__dirname, 'assets', 'cards', `${id}.png`));
	}
	await instance.exit();
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

const restart = () => {
	console.log('Restarting...');
	process.exit(0);
}

const build = async () => {
	await Promise.all([
		watch('cards', ['src/cards.js', 'assets/icons/**/*', 'assets/artwork/**/*'], cards),
		watch('styles', ['src/**/*.less'], styles),
		watch('scripts', ['src/**/*.js'], scripts)
	]);
	console.log('Success. Waiting for changes...');

	gaze(['build.js'], (err, watcher) => watcher.on('all', restart));
};

build();
