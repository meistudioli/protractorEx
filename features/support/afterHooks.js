var afterHooks = function() {
	this.registerHandler('AfterFeatures', function (event, callback) {
		// clean up!
		// Be careful, there is no World instance available on `this` here
		// because all scenarios are done and World instances are long gone.
		callback();
	});
};
module.exports = afterHooks;