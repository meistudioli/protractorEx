#!/usr/bin/env node

/*
	how to use:
	1. put xxx.json into folder - egg
	2. all element in json file must have the following structure and "tags" can't be null
	example:
	[
		{
			"feature": "cucumber/flow/flowMultiSpec.feature",
			"tags": "@CREATEBASIC"
		},
		{
			"feature": "cucumber/flow/flowMultiSpec.feature",
			"tags": "@OFFSHELFBASIC"
		}
	]

	3. if "feature" equal empty, process will go throug folder - "cucumber" which setting by var - "featureRoot"
	example:
	[
		{
			"feature": "",
			"tags": "@C3790"
		}
	]

	4. "feature" & "tags" could be String or Array, just like "cucumberOpts" & "suites" setting
	example:
	[
		{
			"feature": [
				"cucumber/flow/flowMultiSpec.feature",
				"cucumber/myAuc"
			],
			"tags": "@C3792,@C485"
		},
		{
			"feature": "cucumber/flow/flowMultiSpec.feature",
			"tags": [
				"@C3796,@C3963",
				"@E2E"
			]
		}
	]

	5. After the upper setting, just goto command line and execute - "node dragonKeeper.js"
	6. All features will be auto created and put in folder which setting by var - "dragonKeeper.destination"
*/

'use strict';

var featureRoot = 'cucumber',
	fs          = require('fs'),
	util        = require('util'),
	exec        = require('child_process').exec,
	dragonKeeper;

dragonKeeper = {
	source: 'egg',
	destination: featureRoot + '/dragon',
	hatched: 0,
	eggAmount: 0,
	eggs: [],
	timer: [],
	stamps: [30, 31, 32, 33, 34, 35, 36, 37], //black, red, green, yellow, blue, magenta, cyan, white
	progress: 0,
	dragon: 0,
	scenario: 0,
	os: '',
	iid: '',
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
				process.stdout.write(anis[counter]+(!counter ? ' ' : '  ')+'... ('+dragonKeeper.progress+'%)');// write text
				counter++;
				if (counter > anis.length-1) counter = 0;
			}
		, 250);
	},
	stripColor: function(str) {
		return str.replace(/\\[\d{1,2}m/g, '');
	},
	color: function(str, stamp) {
		var stamp = (this.stamps.indexOf(stamp) == -1) ? this.stamps[this.stamps.length-1] : stamp;
		return '[' + stamp + 'm' + str + '[0m';
	},
	catalysis: function(fileName, data) {
		var path = this.destination + '/' + fileName + '.feature.tmp', amount;

		data.unshift('Feature: Dragon series - 「' + fileName + '」');
		data = data.join('\n');

		data = this.stripColor(data);
		data = data.replace(/@X/gm, '');
		data = data.replace(/(\n|\t|\r)+/g, '\n');
		data = data.replace(/^(\s*@.*)/gm, '\n\n$&');

		amount = data.match(/scenario:/gi).length;
		this.scenario += amount;
		
		fs.writeFileSync(path, data, {encoding: 'utf8'});
		this.dragon++;

		this.loading('off');

		console.log(this.color(fileName, 32) + ' is ready.');
		data = (amount > 1) ? ' scenarios have' : ' scenarios has';
		console.log(this.color(amount, 33) + data + ' been merged.');

		data = null;
	},
	showDuration: function(isFinal) {
		var time, info, tmp, timer = this.timer;
		timer.push(new Date().getTime());

		if (timer.length < 2) return;

		if (isFinal) {
			time = [timer[0], timer[timer.length-1]];
			info = ['Total hatchings finished in'];
		} else {
			time = timer.slice(timer.length-2);
			info = ['Finished in'];
		}//end if
		time = Math.floor((time[1] - time[0])/1000);

		if (time > 3600) {
			//hour
			tmp = Math.floor(time / 3600);
			info.push(this.color(tmp, 36));
			info.push('hour' + ((tmp > 1) ? 's' : ''));
			time = time % 3600;
		}//end if

		if (time > 60) {
			//minute
			tmp = Math.floor(time / 60);
			info.push(this.color(tmp, 36));
			info.push('minute' + ((tmp > 1) ? 's' : ''));
			time = time % 60;		
		}//end if

		if (time >= 0) {
			//second
			info.push(this.color(time, 36));
			info.push('second' + ((time > 1) ? 's' : ''));
		}//end if

		info = info.join(' ');
		
		if (!isFinal) info += "\n\n";
		else {
			var dividingLine = '', strips = {}, features;

			//rename xxx.feature.tmp --> xxx.feature
			features = fs.readdirSync(this.destination);
			features.forEach(
				function(feature) {
					if (/(.*)\.tmp$/.test(feature)) {
						feature = dragonKeeper.destination + '/' + feature;
						fs.renameSync(feature, feature.replace(/(.*)\.tmp$/, '$1'));
					}//end if
				}
			);
			
			strips.info = info;
			strips.infos = this.stripColor(strips.info);
			strips.cong = 'All eggs has beed catalysis.';
			strips.dragon = (this.dragon > 1) ? ' dragons have' : ' dragon has';
			strips.dragon = this.color(this.dragon, 32) + strips.dragon + ' flied away.';
			strips.dragons = this.stripColor(strips.dragon);
			strips.scenario = (this.scenario > 1) ? ' scenarios have' : ' scenario has';
			strips.scenario = this.color(this.scenario, 33) + strips.scenario + ' been active.';
			strips.scenarios = this.stripColor(strips.scenario);
			strips.max = Math.max(strips.cong.length, strips.infos.length, strips.dragons.length, strips.scenarios.length);

			for (var i=-1,l=strips.max;++i<l;) dividingLine += '-';
			info = [dividingLine, strips.cong, '', strips.dragon, strips.scenario, strips.info, dividingLine]
			info = info.join('\n');

			for (var i in strips) strips[i] = null;
			strips = null;
		}//end if
		console.log(info);
	},
	tenuto: function() {
		var processAmt = 0,
			data = [],
			fileName = '',
			path,
			seed = [],
			title,
			dividingLine,
			egg;

		this.showDuration();

		if (!this.eggs.length) {
			this.showDuration(true);
			return;
		}//end if

		egg = this.eggs.shift();
		path = util.format('%s/%s', this.source, egg);
		fileName = egg.replace(/(.*).json/, '$1'),

		seed = JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));

		if (!seed.length) return;

		title = '※ egg -「' + fileName + '」';
		dividingLine = '';
		for (var i=-1,l=title.length+3;++i<l;) dividingLine += '-';
		title = dividingLine + '\n' + title + '\n' + dividingLine + '\n';
		console.log(title);

		this.loading('on');

		this.progress = 0;
		seed.forEach(
			function(e, idx) {
				var comm;
				if (!e.tags) return;

				if (!e.feature) e.feature = [featureRoot];
				else if (!(e.feature instanceof Array)) e.feature = [e.feature];

				if (!(e.tags instanceof Array)) e.tags = [e.tags];

				comm = util.format('cucumber' + ((dragonKeeper.os == 'win32') ? '-' : '.') + 'js -f pretty %s --tags %s', e.feature.join(' '), e.tags.join(' --tags '));

				exec(comm, function (error, stdout, stderr) {
					var output = stdout;

					output = output.replace(/\d+ scenario(|s)[\s\S]*/mg, '');
					output = output.replace(/#.*:\d+/gm, '');
					output = output.replace(/feature:([^@]*)@/gim, '  @');

					data[idx] = output;
					processAmt++;
					dragonKeeper.progress = Math.floor(processAmt/seed.length*100);

					if (processAmt == seed.length) {
						dragonKeeper.catalysis(fileName, data);
						dragonKeeper.tenuto();
					}//end if
				});
			}
		);
	},
	init: function() {
		var eggs;

		//mkdir
		if (!fs.existsSync(this.source)) fs.mkdirSync(this.source);
		if (!fs.existsSync(this.destination)) fs.mkdirSync(this.destination);

		//unlink exist feature
		fs.readdirSync(this.destination).forEach(
			function(feature) {
				var path = util.format('%s/%s', dragonKeeper.destination, feature);
		        if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path)) return;
		        fs.unlinkSync(path);
			}
		);

		//os
		this.os = process.platform;

		//get eggs
		eggs = fs.readdirSync(this.source);
		eggs.forEach(
			function(egg) {
				if (!(/.*\.json$/i.test(egg))) return;
				dragonKeeper.eggs.push(egg);
			}
		);
		this.eggAmount = this.eggs.length;
		this.tenuto();
	}
};

dragonKeeper.init();
