/*
	how to use:

	var opt = require('./getopt')
		.script('node dragonKeeper.js')
		.options(
			{
				source: {
					abbr: 's',
					help: 'path for dragon eggs, ex: ./egg'
				},
				destination: {
					abbr: 'd',
					help: 'path for dragons, ex: ./cucumber/dragon'
				},
				tags: {
					abbr: 't',
					help: 'tags for dragons'
				},
				paramsC: {
					position: 5,
					required: true,
					help: 'help for paramsC'
				},
				paramsB: {
					position: 10,
					required: true,
					help: 'help for paramsB'
				},
				paramsA: {
					position: 0,
					list: true,
					help: 'help for paramsA'
				}
			}
		).parse();

	CLI:
	node script.js ./egg ./cucumber/dragon --source param3 --grace param4 param5 param6 -s mei -c param7 --mei --angel
*/

'use strict';
var getopt,
	path = require('path'),
	tRy  = require(path.join(process.cwd(), 'lib/tRy'));

getopt = {
	scriptStr: '',
	optTab: '  ',
	colSpace: 4,
	conf: {},
	script: function(script) {
		this.scriptStr = script;
		return this;
	},
	options: function(conf) {
		var conf = JSON.parse(JSON.stringify(conf));
		for (var i in conf) this.conf[i] = conf[i];
		return this;
	},
	parse: function() {
		var args = process.argv.slice(2), data, conf, help, err, tmp;

		//data
		data = {
			'_': []
		};

		//conf
		conf = this.conf;
		for (var i in conf) {
			var opt = conf[i];
			opt.default = (typeof opt.default == 'undefined') ? '' : opt.default;
			opt.flag = (typeof opt.flag != 'boolean') ? false : opt.flag;
			opt.list = (typeof opt.list != 'boolean') ? false : opt.list;
			opt.required = (typeof opt.required != 'boolean') ? false : opt.required;
			opt.help = (typeof opt.help == 'undefined') ? '' : opt.help;
		}//end for

		for (var i=-1,l=args.length;++i<l;) {
			var e = args[i], key, opt = undefined;
			if (e == null) continue;

			if (/^--(.*)/.test(e)) {
				key = tRy.camelCase(e.replace(/^--(.*)/, '$1'));
				if (typeof conf[key] == 'undefined') {
					if (/^-(.*)/.test(args[i+1])) {
						data[key] = true;
					} else {
						data[key] = args[i+1] || true;
						args[i+1] = null;
					}//end if
				} else {
					opt = conf[key];
					if (opt.list) {
						if (/^-(.*)/.test(args[i+1]) || opt.flag) {
							data[key] = [true];
						} else {
							data[key] = [args[i+1]];
							args[i+1] = null;
						}//end if
					} else {
						if (/^-(.*)/.test(args[i+1]) || opt.flag) {
							data[key] = true;
						} else {
							data[key] = args[i+1] || true;
							args[i+1] = null;
						}//end if
					}//end if
				}//end if
			} else if (/^-.$/.test(e)) {
				key = e.replace(/^-(.*)/, '$1');
				for (var j in conf) {
					if (typeof conf[j].abbr != 'undefined' && conf[j].abbr == key) {
						opt = conf[j];
						key = j;
						break;
					}//end if 
				}//end for
				if (typeof opt == 'undefined') {
					if (/^-(.*)/.test(args[i+1])) {
						data[key] = true;
					} else {
						data[key] = args[i+1] || true;
						args[i+1] = null;
					}//end if
				} else {
					if (opt.list) {
						if (/^-(.*)/.test(args[i+1]) || opt.flag) {
							data[key] = [true];
						} else {
							data[key] = [args[i+1]];
							args[i+1] = null;
						}//end if
					} else {
						if (/^-(.*)/.test(args[i+1]) || opt.flag) {
							data[key] = true;
						} else {
							data[key] = args[i+1] || true;
							args[i+1] = null;
						}//end if
					}//end if
				}//end if
			} else {
				if (!(/^-(.*)/.test(e))) data['_'].push(e);
			}//end if
		}//end for

		//conf
		for (var i in conf) {
			var opt = conf[i];
			if (typeof data[i] != 'undefined') continue;

			if (typeof opt.position == 'undefined') {
				data[i] = (typeof opt.default != 'undefined') ? opt.default : '';
			} else {
				if (typeof data['_'][opt.position] == 'undefined') {
					if (opt.list) {
						data[i] = (typeof opt.default != 'undefined') ? [opt.default] : [];
					} else {
						data[i] = (typeof opt.default != 'undefined') ? opt.default : '';
					}//end if
				} else {
					data[i] = (opt.list) ? data['_'].slice(opt.position) : data['_'][opt.position];
				}//end if
			}//end if
		}//end for

		//serials
		for (var i=-1,l=data['_'].length;++i<l;) data[i] = data['_'][i];

		//help
		help = {
			params: [],
			paramsLen: 0,
			options: [],
			optionsLen: 0
		};
		for (var i in conf) {
			var opt = conf[i], count = 0;
			if (typeof opt.position != 'undefined') {
				help.params.push({id:i, pos:opt.position});
				if (i.length > help.paramsLen) help.paramsLen = i.length;
			} else {
				help.options.push({id:i});
				count = i.length + this.optTab.length;
				if (typeof opt.abbr != 'undefined') count += 4;
				if (count > help.optionsLen) help.optionsLen = count;
			}//end if
		}//end for

		help.params.sort(
			function(a, b) {
				return (a.pos < b.pos) ? -1 :  (a.pos > b.pos) ? 1 : 0;
			}
		);

		//err: check required flag for params only
		for (var i=-1,l=help.params.length;++i<l;) {
			var key = help.params[i].id, opt = conf[key];
			if (typeof opt.required == 'boolean' && opt.required && !data[key] && !err) err = key;
		}//end for

		if (typeof data['h'] != 'undefined' || typeof data['help'] != 'undefined' || err) {
			help.log = [];
			help.logParams = [];
			help.logOptions = [];
			help.paramsLen += this.colSpace;
			help.optionsLen += this.colSpace + this.optTab.length;

			tmp = (typeof this.script == 'undefined') ? 'node ' + process.argv[1].replace(/\\/g, '/').split('/').pop() : this.scriptStr;
			tmp = 'Usage: ' + tmp + ' ';

			//params
			for (var i=-1,l=help.params.length;++i<l;) {
				var key = help.params[i].id, opt = conf[key], str, space;

				str = tRy.color(key, 36);
				str = (opt.required) ? '<' + str + '>' : '[' + str + ']';
				if (opt.list) str += '...';
				tmp += str + ' ';

				//space
				space = '';
				for (var j=-1,l2=help.paramsLen-key.length;++j<l2;) space += ' ';

				help.logParams.push(tRy.color(key, 36) + space + opt.help);
			}//end for
			if (help.logParams.length) help.logParams.unshift('');

			//options
			if (help.options.length) {
				tmp += '[' + tRy.color('options', 36) + ']';
				help.logOptions.push('Options:');
				for (var i=-1,l=help.options.length;++i<l;) {
					var key = help.options[i].id, opt = conf[key], str, space;

					str = this.optTab;
					if (typeof opt.abbr != 'undefined') str += tRy.color('-' + opt.abbr, 36) + ', ';
					str += tRy.color('--' + key, 36);
					
					//space
					space = '';
					for (var j=-1,l2=help.optionsLen-tRy.stripColor(str).length;++j<l2;) space += ' ';		

					help.logOptions.push(str + space + opt.help);
				}//end for
			}//end if
			if (help.logOptions.length) help.logOptions.unshift('');

			if (err) {
				help.log.push(tRy.color(err, 31) + ' should set value');
				help.log.push('');
			}//end if

			help.log.push(tmp);
			help.log = help.log.concat(help.logParams);
			help.log = help.log.concat(help.logOptions);
			help.log.push('');
			console.log(help.log.join('\n'));

			process.exit(0);
		} else {
			//clear
			for (var i in help) help[i] = null;
		}//end for

		return data;
	}
};

module.exports = getopt;