var commonStepDefinition = function() {
	var Given = When = Then = this.defineStep;

    /*------------------------ Given ------------------------*/

    // I login as "buyer_general"
    Given(/I login as "([^"]*)"/, function(userId, callback) {
    	var world = this;

    	this.stand = new PageObject();
    	this.stand.login(userId).then(
    		function() {
    			world.userId = userId;
    		}
    	).then(callback, callback);
    });

    // I visit "google"
    Given(/I visit "([^"]*)"/, function(type, callback) {
        var stand, param, type = type.replace(/\s/g, '');
        switch(true) {
            case (/^google/i.test(type)):
                stand = require(__base + constants.PO.google);
                break;
        }//end switch

        stand = new stand(param);
        this.stand = stand;

        stand.go().then(
            function() {
                callback();
            },
            function() {
                callback();
            }
        );
    });


    /*------------------------ When ---------------------- --*/

    // I roll to "footer"
    When(/I roll to "([^"]*)"/, function(key, callback) {
        this.stand.rollTo(key).then(callback, callback);
    });


    /*------------------------ Then -------------------------*/

    // booth search result must exactly be "0"
    Then(/search result must exactly be "(\d+)"/, function(amount, callback) {
        var request = Number(amount);
        //listMerchandise || boothSearch
        this.stand.getSearchResultAmount().then(
            function(amount) {
                expect(amount, 'search result error').to.be.eq(request);
            }
        ).then(callback, callback);
    });    

    // "each favoritestore thumbnail" amount must exactly be "3" pieces
    Then(/"([^"]*)" amount must exactly be "(\d+)"/, function(key, request, callback) {
        this.stand.getAmount(key).then(
            function(amount) {
                expect(amount, 'element amount error').to.be.eq(Number(request));
            }
        ).then(callback, callback);
    });

    // "item title" must match request data
    Then(/^"([^"]*)" must match request data/, function(key, callback) {
        var world = this;
        this.stand.getContentAndRequestKey(key).then(
            function(data) {
                // console.log(data)
                var request = world.testData[data.request];
                expect(request, 'request data missing').not.to.be.undefined;
                if (typeof data.result != typeof request) {
                    if (typeof data.result == 'string') request = request.toString();
                    if (typeof data.result == 'number') request = Number(request);
                }//end if
                expect(data.result, 'data match error').to.eq(request);
            }
        ).then(callback, callback);
    });

    // "emailInfo" must exist
    Then(/"([^"]*)" must exist/, function(key, callback) {
        this.stand.isExist(key).then(
            function(flag) {
                expect(flag, key+' missing').to.be.true;
            }
        ).then(callback, callback);
    });

    // "emailInfo" must not exist
    Then(/"([^"]*)" must not exist/, function(key, callback) {
        this.stand.isExist(key).then(
            function(flag) {
                expect(!flag, key+' exist').to.be.true;
            }
        ).then(callback, callback);
    });

    // "emailInfo" redirect function must correct
    Then(/^"([^"]*)" redirect function must correct$/, function(key, callback) {
        this.stand.redirect(key, key, this.userId).then(
            function(flag) {
                expect(flag, 'redirect result error').to.be.true;
            }
        ).then(callback, callback);
    });

    // "positive rating" must have content 
    Then(/"([^"]*)" must have content/, function(key, callback) {
        this.stand.one(key).getInnerHtml().then(
            function(html) {
                // console.log('html: '+html);
                expect(html, key + "'s content is empty").to.not.be.empty;
            },
            function() {
                expect(false, key+' missing').to.be.true;
            }
        ).then(callback, callback);
    });

    // "positive rating" content must empty 
    Then(/"([^"]*)" content must empty/, function(key, callback) {
        this.stand.one(key).getInnerHtml().then(
            function(html) {
                // console.log('html: '+html);
                expect(html, key + "'s content is not empty").to.be.empty;
            },
            function() {
                expect(true, key+' is missing').to.be.true;
            }
        ).then(callback, callback);
    });

    // header must exist
    Then(/^header must exist$/, function(callback) {
        var header = this.stand.header.one('header');
        this.stand.isExist(header).then(
            function(flag) {
                expect(flag, 'header missing').to.be.true;
            }
        ).then(callback, callback);
    });

    // footer must exist
    Then(/^footer must exist$/, function(callback) {
        var footer = this.stand.footer.one('footer');
        this.stand.isExist(footer).then(
            function(flag) {
                expect(flag, 'footer missing').to.be.true;
            }
        ).then(callback, callback);
    });


};

module.exports = commonStepDefinition;