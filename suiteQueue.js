#!/usr/bin/env node

/*
	how to use:
	1. put suite id as parameter to excute
	example:
	node suiteQueue.js mutantOn flow mutantOff

	2. suite id can be added some environment variables, just use sign "+" to join parameters
	example:
	node suiteQueue.js mutantOn myAuc+multiThread=on mutantOff
*/
'use strict';

var exec = require('child_process').exec,
	fs   = require('fs'),
	suiteQueue;

suiteQueue = {
	resultPath: 'result',
	screenShotsPath: 'screenShots',
	conf: 'google.conf',// protractor conf filename
	timer: [],
	log: '',
	raw: '',
	data: {},
	stamps: [30, 31, 32, 33, 34, 35, 36, 37], //black, red, green, yellow, blue, magenta, cyan, white
	suites: [],
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
				process.stdout.write(anis[counter]);// write text
				counter++;
				if (counter > anis.length-1) counter = 0;
			}
		, 250);
	},
	getAssertions: function() {
		var results = [], passed = 0, failed = 0;
		fs.readdirSync(this.resultPath).forEach(
		    function(result) {
		        var path = suiteQueue.resultPath + '/' + result, data = [];
		        if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path) || !(/.*\.json$/i.test(path))) return;
				try {
					data = JSON.parse(fs.readFileSync(path, {encoding: 'utf8'}));
				} catch(err) {}
				results = results.concat(data);
		    }
		);

		for (var i=-1,l=results.length;++i<l;) {
			var d = results[i], assertions;
			if (typeof d.assertions == 'undefined') continue;
			assertions = d.assertions;
			for (var j=-1,l2=assertions.length;++j<l2;) {
				(assertions[j].passed) ? passed++ : failed++;
			}//end for
		}//end for

		results = passed + failed;
		results = results + ' assertion' + ((results > 1) ? 's' : '') + ' (';
		if (failed) results += this.color(failed + ' failed', 31) + ', ';
		results += this.color(passed + ' passed', 32) + ')';

		return results;
	},
	dataPlug: function(rawData) {
		var tmp = {}, result = rawData;
		result = this.stripColor(result);
		result = result.replace(/^\[.*#\d+\w\]/gim, '');
		result = result.replace(/^\s+/gim, '');

		//basic
		for (var i in this.data) {
			var d = this.data[i], atts = ['passed', 'failed', 'skipped'], pattern;
			if (['assertionError', 'failingScenario'].indexOf(i) != -1) continue;
			tmp[i] = {};
			pattern = new RegExp('^\\d+ '+i+'.*', 'gim');
			result.replace(pattern, function(match) {
				atts.forEach(
					function(att, idx) {
						var p = new RegExp('(\\d+)\\s'+att), amt;
						if (typeof tmp[i][att] == 'undefined') tmp[i][att] = 0;
						if (typeof d[att] == 'undefined') d[att] = 0;
						if (p.test(match)) {
							amt = Number(match.match(p)[1]);
							d[att] += amt;
							tmp[i][att] += amt;
						}//end if
					}
				);
			});
		}//end for

		//AssertionError
		tmp.assertionError = [];
		result.replace(/^AssertionError.*/gim, function(match) {
			tmp.assertionError.push(match);
			suiteQueue.data.assertionError.push(match);
		});

		//failingScenario
		tmp.failingScenario = [];
		result.replace(/.*feature:\d+ # Scenario:.*/gim, function(match) {
			tmp.failingScenario.push(match);
			suiteQueue.data.failingScenario.push(match);
		});
		return tmp;
	},
	stripColor: function(str) {
		return str.replace(/\\[\d{1,2}m/g, '');
	},
	color: function(str, stamp) {
		var stamp = (this.stamps.indexOf(stamp) == -1) ? this.stamps[this.stamps.length-1] : stamp;
		return '[' + stamp + 'm' + str + '[0m';
	},
	logData: function(str) {
		this.log += str + "\n";
	},
	showDuration: function(isFinal) {
		var time, info, tmp, timer = this.timer;
		timer.push(new Date().getTime());

		if (timer.length < 2) return;

		if (isFinal) {
			time = [timer[0], timer[timer.length-1]];
			info = ['Total tests finished in'];
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

		if (time > 0) {
			//second
			info.push(this.color(time, 36));
			info.push('second' + ((time > 1) ? 's' : ''));		
		}//end if

		info = info.join(' ');
		
		if (!isFinal) {
			info += "\n\n";
			this.logData(info);
		} else {
			var dividingLine = '', strips = {};
			strips.assertion = this.getAssertions();
			strips.info = info;

			//scenario & step
			['scenario', 'step'].forEach(
				function(key, idx) {
					var d = suiteQueue.data[key], tmp = '', arr = [];
					tmp = d.passed + d.failed + d.skipped;
					tmp = tmp + ' ' + key + ((tmp > 1) ? 's' : '') + ' (';
					if (d.failed) arr.push(suiteQueue.color(d.failed + ' failed', 31));
					if (d.skipped) arr.push(suiteQueue.color(d.skipped + ' skipped', 36));
					if (d.passed) arr.push(suiteQueue.color(d.passed + ' passed', 32));
					strips[key] = tmp + arr.join(', ') + ')';
				}
			);

			strips.scenarios = this.stripColor(strips.scenario);
			strips.steps = this.stripColor(strips.step);
			strips.assertions = this.stripColor(strips.assertion);
			strips.infos = this.stripColor(strips.info);
			strips.max = Math.max(strips.scenarios.length, strips.steps.length, strips.assertions.length, strips.infos.length);

			for (var i=-1,l=strips.max;++i<l;) dividingLine += '-';
			info = dividingLine + '\n';
			info += strips.scenario + '\n';
			info += strips.step + '\n';
			info += strips.assertion + '\n';
			info += '\n' + strips.info + '\n';
			info += dividingLine;

			this.logData(info);

			//log
			fs.writeFileSync(this.resultPath + '/result.log', this.stripColor(this.log), {encoding: 'utf8'});

			//raw
			fs.writeFileSync(this.resultPath + '/raw.log', this.stripColor(this.raw), {encoding: 'utf8'});
		}//end if
		console.log(info);
	},
	tenuto: function() {
		var comm = [], suite, params, title, dividingLine, act;
		this.showDuration();

		if (!this.suites.length) {
			this.showDuration(true);
			return;
		}//end if

		params = this.suites.shift().split('+');
		suite = params.shift();

		//comm
		act = (suiteQueue.os == 'win32') ? 'set ' : '';
		comm.push(act + 'activeMutant=off');
		comm.push(act + 'clearResult=off');
		comm.push(act + 'report=' + suite);
		for (var i=-1,l=params.length;++i<l;) comm.push(act + params[i]);
		comm.push('protractor ' + suiteQueue.conf + '.js --suite ' + suite);
		comm = comm.join((!act) ? ' ': ' & ');

		title = '※ Suite -「' + suite + '」';
		dividingLine = '';
		for (var i=-1,l=title.length+3;++i<l;) dividingLine += '-';
		title = dividingLine + '\n' + title + '\n' + dividingLine + '\n' + comm;
		console.log(title);
		this.logData(title);
		
		this.loading('on');

		exec(comm, function (error, stdout, stderr) {
			var result = stdout, display = [];
			suiteQueue.raw += stdout + '\n';

			result = suiteQueue.dataPlug(result);

			//assertionError
			if (result.assertionError.length) {
				display.push('\n(::) failed steps (::)\n');
				display = display.concat(result.assertionError.map(
					function(e) {
						return e + '\n'; 
					}
				));
			}//end if

			//failingScenario
			if (result.failingScenario.length) {
				if (display.length) display.push('\n');
				display.push('\nFailing scenarios:\n');
				display = display.concat(result.failingScenario.map(
					function(e) {
						return e + '\n'; 
					}
				));
			}//end if

			//scenario & step
			if (display.length) display.push('\n');
			['scenario', 'step'].forEach(
				function(key, idx) {
					var d = result[key], tmp = '', arr = [];
					tmp = d.passed + d.failed + d.skipped;
					tmp = tmp + ' ' + key + ((tmp > 1) ? 's' : '') + ' (';
					if (d.failed) arr.push(suiteQueue.color(d.failed + ' failed', 31));
					if (d.skipped) arr.push(suiteQueue.color(d.skipped + ' skipped', 36));
					if (d.passed) arr.push(suiteQueue.color(d.passed + ' passed', 32));
					tmp += arr.join(', ') + ')';
					display.push('\n'+tmp);
				}
			);

			suiteQueue.loading('off');

			display = display.join('');
			console.log(display);
			suiteQueue.logData(display);
			suiteQueue.tenuto();
		});

	},
	init: function() {
		this.suites = process.argv.slice(2);
		
		//data
		this.data = {
			scenario: {},
			step: {},
			assertionError: [],
			failingScenario: []
		};

		if (!fs.existsSync(this.resultPath)) fs.mkdirSync(this.resultPath);
		if (!fs.existsSync(this.screenShotsPath)) fs.mkdirSync(this.screenShotsPath);

		//unlink exist results
		fs.readdirSync(this.resultPath).forEach(
		    function(result) {
		        var path = suiteQueue.resultPath + '/' + result;
		        if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path)) return;
		        fs.unlinkSync(path);
		    }
		);

		//unlink screenshots
		fs.readdirSync(this.screenShotsPath).forEach(
		    function(result) {
		        var path = suiteQueue.screenShotsPath + '/' + result;
		        if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path)) return;
		        fs.unlinkSync(path);
		    }
		);

		//os
		this.os = process.platform;

		this.tenuto();
	}
};

suiteQueue.init();