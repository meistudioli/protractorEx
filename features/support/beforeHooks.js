var beforeHooks = function() {
    this.Before(function(callback) {
        browser.clearMockModules();
        browser.manage().deleteAllCookies();
        callback();
    });
};
module.exports = beforeHooks;