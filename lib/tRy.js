'use strict';
var tRy = {
	stamps: [30, 31, 32, 33, 34, 35, 36, 37], //black, red, green, yellow, blue, magenta, cyan, white
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
	color: function(str, stamp) {
		var stamp = (this.stamps.indexOf(stamp) == -1) ? this.stamps[this.stamps.length-1] : stamp;
		return '[' + stamp + 'm' + str + '[0m';
	}
};

module.exports = tRy;