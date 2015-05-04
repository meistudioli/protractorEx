#!/usr/bin/env node

'use strict';

var featureRoot    = 'cucumber',
	fs             = require('fs'),
	util           = require('util'),
	exec           = require('child_process').exec,
	tRy            = require('./lib/tRy'),
	getopt         = require('./lib/getopt'),
	impress;

impress = {
	source: 'features',
	destination: 'exports',
	stepDefinition: '',
	lists: [],
	seeds: [],
	timer: [],
	seedAmount: 0,
	progress: 0,
	final: {},
	//method
	loading: function(mode) {
		var mode = (['on', 'off'].indexOf(mode) == -1) ? 'off' : mode,
			counter = 0,
			anis = ['--', '\\', '|', '/'];

		clearInterval(this.iid);
		process.stdout.clearLine();// clear current text
		process.stdout.cursorTo(0);// move cursor to beginning of line

		if (mode == 'off') return;
		this.iid = setInterval(
			function() {
				process.stdout.clearLine();// clear current text
				process.stdout.cursorTo(0);// move cursor to beginning of line
				process.stdout.write(anis[counter]+(!counter ? ' ' : '  '));// write text
				counter++;
				if (counter > anis.length-1) counter = 0;
			}
		, 250);
	},
	showDuration: function(isFinal) {
		var time, info, tmp, timer = this.timer, lists, html;
		timer.push(new Date().getTime());

		if (timer.length < 2) return;

		if (isFinal) {
			time = [timer[0], timer[timer.length-1]];
			info = ['Total impressing process finished in'];
		} else {
			time = timer.slice(timer.length-2);
			info = ['Finished in'];
		}//end if
		time = Math.floor((time[1] - time[0])/1000);

		if (time > 3600) {
			//hour
			tmp = Math.floor(time / 3600);
			info.push(tRy.color(tmp, 36));
			info.push('hour' + ((tmp > 1) ? 's' : ''));
			time = time % 3600;
		}//end if

		if (time > 60) {
			//minute
			tmp = Math.floor(time / 60);
			info.push(tRy.color(tmp, 36));
			info.push('minute' + ((tmp > 1) ? 's' : ''));
			time = time % 60;		
		}//end if

		if (time >= 0) {
			//second
			info.push(tRy.color(time, 36));
			info.push('second' + ((time > 1) ? 's' : ''));
		}//end if

		info = info.join(' ');
		
		if (!isFinal) info += "\n\n";
		else {
			var dividingLine = '', strips = {};

			//remove folder - stepDefinition
			if (fs.existsSync(this.stepDefinition)) fs.rmdirSync(this.stepDefinition);

			lists = '<ul class="lists hide">';
			for (var i=-1,l=this.lists.length;++i<l;) {
				var key = this.lists[i], d = this.final[key], icon;
				icon = 'no_image.png';
				if (d.author) {
					icon = 'icon_' + d.author + '.jpg';
				}//end if
				lists += '<li>';
				lists += '<img src="http://mei.homin.com.tw/img/impress/icon/' + icon + '">';
				lists += '<p class="title">' + key + '</p>';
				lists += '<p class="describe">' + d.describe + '</p>';
				lists += '<p class="others">' + d.others + '</p>';
				lists += '</li>';
			}//end for
			lists += '</ul>';

			html = '';
			html += '<!DOCTYPE html>';
			html += '<html lang="en" x-frame-options="sameorigin">';
			html += '<head>';
			html += '<meta http-equiv="CACHE-CONTROL" content="NO-CACHE">';
			html += '<meta http-equiv="PRAGMA" content="NO-CACHE">';
			html += '<meta http-equiv="Expires" content="Wed, 26 Feb 1997 08:21:57 GMT">';
			html += '<meta http-equiv="imagetoolbar" content="no">';
			html += '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">';
			html += '<meta name="Keywords" content="impress">';
			html += '<meta name="Description" content="「impress」是款架構在 Web Components 上所開發的 module, 主要的作用是讓條列式的 data 呈現可以更加的活潑有趣, 藉由「Fluid design」讓它可以面對任何的 resolution 挑戰, 不管 resolution 如何變化, 均不會憾動所呈現的黃金比例, 當中有效的運用了 viewport unit 元素以及 icon font, 使其不管在結構或者是 design 的表現上, 均能有亮眼的表現">';
			html += '<meta property="og:title" content="impress Prototype">';
			html += '<meta property="og:site_name" content="mei">';
			html += '<meta property="og:description" content="「impress」是款架構在 Web Components 上所開發的 module, 主要的作用是讓條列式的 data 呈現可以更加的活潑有趣, 藉由「Fluid design」讓它可以面對任何的 resolution 挑戰, 不管 resolution 如何變化, 均不會憾動所呈現的黃金比例, 當中有效的運用了 viewport unit 元素以及 icon font, 使其不管在結構或者是 design 的表現上, 均能有亮眼的表現">';
			html += '<meta property="og:image" content="http://mei.homin.com.tw/img/preview/impress.png">';
			html += '<title>impress Prototype</title>';
			html += '<link href="http://mei.homin.com.tw/css/basic.css" rel="stylesheet">';
			html += '<link href="http://mei.homin.com.tw/css/impress.css" rel="stylesheet">';
			html += '<script src="http://mei.homin.com.tw/js/pageRender.js" data-source="http://mei.homin.com.tw/js/prototype-min.js&http://mei.homin.com.tw/js/func.js&http://mei.homin.com.tw/js/iDiaglogClass.js&http://mei.homin.com.tw/js/impressClass.js&http://mei.homin.com.tw/js/impressInit.js"></script>';
			html += '</head>';
			html += '<body>';
			html += '<header id="hd" role="banner">';
			html += '<h1>impress</h1>';
			html += '</header>';
			html += '<main id="bd" role="main">';
			html += '<section>';
			html += '<h2>impress wrapper</h2>';
			html += '<impress-module>';
			html += '<h3>impress</h3>';
			html += '<p class="slogan hide">provide vivid data with more fun & more interesting</p>';
			html += '<p class="subject hide">Features</p>';
			html += lists;
			html += '</impress-module>';
			html += '</section>';
			html += '</main>';
			html += '<footer id="ft">';
			html += '<small role="contentinfo">Powered by mei\'s studio.</small>';
			html += '</footer>';
			html += '</body>';
			html += '</html>';

			//write file
			lists = util.format('%s/%s.html', this.destination, 'impress');
			fs.writeFileSync(lists, html, {encoding: 'utf8'});

			//log
			strips.info = info;
			strips.infos = tRy.stripColor(strips.info);
			strips.cong = 'All feature' + ((this.lists.length > 1) ? 's have' : ' has') +' beed catalysis.';
			strips.features = tRy.color(this.lists.length, 33) + ' feature' + ((this.lists.length > 1) ? 's have' : ' has');
			strips.features += ' been analyzed.';
			strips.max = Math.max(strips.cong.length, strips.infos.length, strips.features.length);

			for (var i=-1,l=strips.max;++i<l;) dividingLine += '-';
			info = [dividingLine, strips.cong, '', strips.features, strips.info, dividingLine];
			info = info.join('\n');

			for (var i in strips) strips[i] = null;
			strips = null;
		}//end if
		console.log(info);
	},
	catalysis: function(seed, data) {
		var others = data.others, path;
		others = tRy.stripColor(others);
		others = others.replace(/@X/gm, '');
		others = others.replace(/(\n|\t|\r)+/g, '\n');
		
		others = others.replace(/@([^\s]*)/g, '');
		others = others.replace(/^\s*(.*)/gim, '    $1');
		others = others.replace(/^\s*(Scenario.*)/gim, '\n\n$1');
		// others = others.replace(/Scenario:/gim, '◎');
		others = others.replace(/Scenario:(.*)/gim, '<span class="hyphenate scenario">◎ $1</span>');
		others = others.trim();
		others = others.replace(/\n/gm, '<br>');
		data.others = others;

		this.final[seed] = data;

		this.loading('off');

		console.log(tRy.color(seed, 32) + ' has already been analyzed.');
	},
	tenuto: function() {
		var	data = {},
			path,
			seed,
			dividingLine,
			comm,
			tmp,
			title;

		this.showDuration();

		if (!this.seeds.length) {
			this.showDuration(true);
			return;
		}//end if

		seed = this.seeds.shift();
		path = util.format('%s/%s.feature', this.source, seed);

		title = '※ feature -「' + seed + '」';
		dividingLine = '';
		for (var i=-1,l=title.length+3;++i<l;) dividingLine += '-';
		title = dividingLine + '\n' + title + '\n' + dividingLine + '\n';
		console.log(title);

		this.loading('on');

		tmp = fs.readFileSync(path, {encoding: 'utf8'});
		//author
		data.author = '';
		if (tmp.match(/author:.*/i)) {
			data.author = tmp.match(/author:.*/i)[0].replace(/author:\s*(.*)/, '$1');
		}//end if

		//describe
		tmp = tmp.replace(/author:\s*(.*)/gim, '');
		tmp = tmp.replace(/Feature:/gim, '');
		tmp = tmp.replace(/^\s*(.*)/gim, '$1');
		tmp = tmp.replace(/@([^\s]*)/g, '');
		tmp = tmp.replace(/scenario[\s\S]*/gim, '');
		tmp = tmp.replace(/background[\s\S]*/gim, '');
		tmp = tmp.replace(/\n/gm, '<br>');
		data.describe = tmp.trim();

		//scenarios
		comm = util.format('cucumber' + ((this.os == 'win32') ? '-' : '.') + 'js -f pretty %s --require %s', path, this.stepDefinition);
		exec(comm, function (error, stdout, stderr) {
			var output = stdout;
			output = output.replace(/\s*at\s.*\n/mg, '');
			output = output.replace(/\s*.*failed steps.*\s*/g, '');
			output = output.replace(/\s*ReferenceError.*/g, '');
			output = output.replace(/Failing scenarios:[\s\S]*/mg, '');

			output = output.replace(/\d+ scenario(|s)[\s\S]*/mg, '');
			output = output.replace(/#.*:\d+/gm, '');
			output = output.replace(/feature:([^@]*)@/gim, '  @');

			data.others = output;
			impress.progress++;// record process amount

			impress.catalysis(seed, data);
			impress.tenuto();			
		});
		return;
	},
	init: function() {
		var opts, sets, seeds;

		opts = getopt.script('node impress.js')
				.options(
					{
						source: {
							abbr: 's',
							default: 'features',
							help: 'set path for dragon eggs, ex: ./features'
						},
						destination: {
							abbr: 'd',
							default: 'exports',
							help: 'set path for dragons, ex: ./exports'
						}
					}
				)
				.parse();

		sets = ['source', 'destination'];
		for (var i=-1,l=sets.length;++i<l;) if (opts[sets[i]]) this[sets[i]] = opts[sets[i]];

		//mkdir
		this.stepDefinition = this.source + '/sd';
		if (!fs.existsSync(this.source)) fs.mkdirSync(this.source);
		if (!fs.existsSync(this.destination)) fs.mkdirSync(this.destination);
		if (!fs.existsSync(this.stepDefinition)) fs.mkdirSync(this.stepDefinition);

		//unlink exist html
		fs.readdirSync(this.destination).forEach(
			function(html) {
				var path = util.format('%s/%s', impress.destination, html);
		        if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path)) return;
		        fs.unlinkSync(path);
			}
		);

		//os
		this.os = process.platform;

		//get seed
		seeds = fs.readdirSync(this.source);
		seeds.forEach(
			function(seed) {
				var key;
				if (!(/.*\.feature$/i.test(seed))) return;
				key = seed.replace(/(.*).feature/, '$1');
				impress.seeds.push(key);
				impress.lists.push(key);
			}
		);
		this.seedAmount = this.seeds.length;
		this.tenuto();
	}
};

impress.init();