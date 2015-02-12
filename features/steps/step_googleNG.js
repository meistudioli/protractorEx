var google = function() {
	var Given = When = Then = this.defineStep;

    /*----------------------- Given ---------------------- --*/

    // I go to "google"
    Given(/I go to "([^"]*)"/, function(key, callback) {
        var url;

        switch (key) {
            case 'google':
                url = 'https://www.google.com.tw/';
                break;
        }//end switch

        browser.get(url).then(callback, callback);
    });

    Given(/I login as account - "([^"]*)"/, function(userId, callback) {
        var path, user;

        path = 'https://accounts.google.com/ServiceLogin?hl=zh-TW&continue=https://www.google.com.tw/';
        user = constants.USERS[userId];

        browser.get(path).then(
            function() {
                protractor.promise.all([
                    $('#Email').clear().sendKeys(user.username),
                    $('#Passwd').clear().sendKeys(user.password)
                ]).then(
                    function() {
                        return browser.getCurrentUrl().then(
                            function(url) {
                                $('#signIn').click().then(
                                    function() {
                                        browser.wait(
                                            function() {
                                                return browser.getCurrentUrl().then(
                                                    function(cUrl) {
                                                        return cUrl != url;
                                                    }
                                                );
                                            }
                                        , 5000);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        ).then(callback, callback);
    });

	/*------------------------ When ---------------------- --*/

    // When I search "google" from google
    When(/^I search "(.*)" from google$/, function(key, callback) {
        $('#lst-ib').clear().sendKeys(key).then(
            function() {
                $('#hplogo').then(
                    function(e) {
                        e.click();
                    },
                    function(err) {
                        //err catch
                    }
                )
            }
        ).then(
            function() {
                return $('input[name="btnK"]').isDisplayed().then(
                    function(flag) {
                        return $(flag ? 'input[name="btnK"]' : 'button[name="btnG"]');
                    },
                    function() {
                        return $('input[name="btnK"]');
                    }
                );
            }
        ).then(
            function(submit) {
                browser.getCurrentUrl().then(
                    function(url) {
                        submit.click().then(
                            function() {
                                browser.wait(
                                    function() {
                                        return browser.getCurrentUrl().then(
                                            function(cUrl) {
                                                return cUrl != url;
                                            }
                                        );
                                    }
                                , 5000);
                            }
                        );
                    }
                );
            }
        ).then(
            function() {
                browser.wait(
                    function() {
                        return $('#resultStats').isPresent().then(
                            function(flag) {
                                return flag;
                            }
                        );
                    }
                , 5000);
            }
        ).then(callback, callback);
    });

	/*------------------------ Then ---------------------- --*/

    Then(/header should exist/, function(callback) {
        $('#mngb').isPresent().then(
            function(flag) {
                expect(flag, 'header missing').to.be.true;
            }
        ).then(callback, callback);
    });

    Then(/footer should exist/, function(callback) {
        $('#footer').isPresent().then(
            function(flag) {
                expect(flag, 'footer missing').to.be.true;
            }
        ).then(callback, callback);
    });

    Then(/logo should exist/, function(callback) {
        $('#hplogo').isPresent().then(
            function(flag) {
                expect(flag, 'logo missing').to.be.true;
            }
        ).then(callback, callback);
    });

    Then(/search result should have more than "(\d+)" record/, function(amount, callback) {
        var request = Number(amount);

        $('#resultStats').getInnerHtml().then(
            function(html) {
                html = html.replace(/,/g, '').replace(/約有 (\d+) 項結果.*/, '$1');
                return Number(html);
            },
            function() {
                return 0;
            }
        ).then(
            function(amount) {
                expect(amount, 'search result error').to.be.at.least(request);
            }
        ).then(callback, callback);
    });

    Then(/first record title should be "(.*)"/, function(key, callback) {
        var request = key;

        $$('#ires li').get(0).$('a').getText().then(
            function(title) {
                return title;
            },
            function() {
                return '';
            }
        ).then(
            function(title) {
                expect(title, 'title is empty').to.not.be.empty;
                expect(title, 'title error').to.be.eq(request);
            }
        ).then(callback, callback);
    });
};

module.exports = google;