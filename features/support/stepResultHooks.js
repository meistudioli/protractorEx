var stepResultHooks = function() {
	var fs = require('fs'), dir = '/screenShots/';
	if (typeof __base != 'undefined') dir = __base + dir;

	this.StepResult(function (event, callBack) {
		var stepResult = event.getPayloadItem('stepResult'), step = stepResult.getStep();

		if (stepResult.isFailed()) {
			browser.takeScreenshot().then(function (png) {
				var stream, fname;

				fname = 'err_' + new Date().getTime() + '_' + step.getLine() + '_' + step.getName() + '_' + new Date().toISOString() + '.png';
				fname = fname.replace(/"|'|\//g, '').replace(/\s|:|>/g, '_');

				stream = fs.createWriteStream(dir + fname);
				stream.write(new Buffer(png, 'base64'));
				stream.end();
			}).then(callBack);
		} else callBack();
	});
};
module.exports = stepResultHooks;