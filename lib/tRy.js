'use strict';
var tRy = {
	types: [0, 1, 2, 4, 5, 7, 8], //reset, lighten, darken, underline, blink, switch F/B, hide
	foreground: [30, 31, 32, 33, 34, 35, 36, 37], //black, red, green, yellow, blue, magenta, cyan, white
	background: [40, 41, 42, 43, 44, 45, 46, 47], //black, red, green, yellow, blue, magenta, cyan, white
	//method
	fcamelCase: function(all, letter) {
		return letter.toUpperCase();
	},
	camelCase: function(str) {
		return str.replace(/-([a-z])/ig, this.fcamelCase);
	},
	stripColor: function(str) {
		return str.replace(/\\[(\d{1,2};?){1,3}m/g, '');
	},
	color: function(str, conf) {
		var set = {
			t: 0,
			f: 37,
			b: 40
		};
		if (typeof conf == 'number' && this.foreground.indexOf(conf) != -1) set.f = conf;
		else {
			for (var i in conf) {
				var map;
				if (typeof set[i] == 'undefined') continue;
				map = this[(i == 't') ? 'types' : (i == 'f') ? 'foreground' : 'background'];
				if (map.indexOf(conf[i]) != -1) set[i] = conf[i];
			}//end for
		}//end if

		set = [set.t, set.f, set.b];
		return '[' + set.join(';') + 'm' + str + '[0m';
	}
};

module.exports = tRy;