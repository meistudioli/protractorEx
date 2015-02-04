var config, env, fs;
fs = require('fs');

config = {
    // ---------------------------------------------------------------------------
    // ----- Browser Drivers -----------------------------------------------------
    // ---------------------------------------------------------------------------

    seleniumAddress: 'http://localhost:4444/wd/hub',
    
    // ---------------------------------------------------------------------------
    // ----- What tests to run ---------------------------------------------------
    // ---------------------------------------------------------------------------
    
    specs: [
        'cucumber/**/*.feature'
    ],
    suites: {
        google: 'cucumber/google/**/*.feature',
        googleNG: 'cucumber/googleNG/**/*.feature',
        dragon: 'cucumber/dragon/**/*.feature'
    },

    // ---------------------------------------------------------------------------
    // ----- How to set up browsers ----------------------------------------------
    // ---------------------------------------------------------------------------

    capabilities: {
        browserName: 'chrome'
    },
    multiCapabilities: [],

    // ---------------------------------------------------------------------------
    // ----- Global test information ---------------------------------------------
    // ---------------------------------------------------------------------------

    beforeLaunch: function() {
        var resultPath = 'result', screenShotsPath = 'screenShots';
        if (!fs.existsSync(resultPath)) fs.mkdirSync(resultPath);
        if (!fs.existsSync(screenShotsPath)) fs.mkdirSync(screenShotsPath);

        if (env.clearResult == 'on') {
            //unlink exist results
            fs.readdirSync(resultPath).forEach(
                function(result) {
                    var path = resultPath + '/' + result;
                    if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path)) return;
                    fs.unlinkSync(path);
                }
            );
            //unlink screenshots
            fs.readdirSync(screenShotsPath).forEach(
                function(result) {
                    var path = screenShotsPath + '/' + result;
                    if (fs.lstatSync(path).isDirectory() || !fs.existsSync(path)) return;
                    fs.unlinkSync(path);
                }
            );
        }//end if
    },
    onPrepare: function() {
        var chai, chaiAsPromised;
        browser.ignoreSynchronization = true;

        chai = require('chai');
        chaiAsPromised = require('chai-as-promised');
        chai.use(chaiAsPromised);

        global.__base = __dirname;
        global.expect = chai.expect;
        global.common = require(__base + '/lib/common.js');
        global.constants = require(__base + '/lib/constants.js');
        global.PageObject = require(__base + '/lib/pages/pageObject.js');
    },
    onComplete: function() {
    },
    onCleanUp: function() {
    },
    afterLaunch: function() {
    },
    params: {
        loginId: '',
        forceRefresh: false
    },
    resultJsonOutputFile: 'result/result.json',

    // ---------------------------------------------------------------------------
    // ----- The test framework --------------------------------------------------
    // ---------------------------------------------------------------------------
    
    framework: 'cucumber',
    cucumberOpts: {
        require: 'cucumber/**/*.js',
        tags: [
            process.env.tags || '@E2E,@SMOKE,@REGRESSION,@FUNCTIONALITY',
            '~@X'
        ],
        format: 'summary'
    }
};

// environment variables
env = {
    browserName: process.env.browserName || 'chrome', // chrome || firefox || internet explorer
    tags: process.env.tags || '@E2E,@SMOKE,@REGRESSION,@FUNCTIONALITY',
    parallel: process.env.parallel || 'off',
    report: process.env.report || 'result',
    clearResult: process.env.clearResult || 'on'
};
for (var i in env) env[i] = env[i].trim();

config.capabilities.browserName = env.browserName;
config.cucumberOpts.tags = [env.tags, '~@X'];
config.resultJsonOutputFile = 'result/' + env.report + '.json';

if (env.parallel == 'on') {
    config.capabilities = {
        browserName: env.browserName,
        shardTestFiles: true,
        maxInstances: 3
    };
}//end if

exports.config = config;