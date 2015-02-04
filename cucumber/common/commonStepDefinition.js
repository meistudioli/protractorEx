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

    /*------------------------ Then -------------------------*/

    // "emailInfo" must exist
    Then(/"([^"]*)" must exist/, function(key, callback) {
        this.stand.isExist(key).then(
            function(flag) {
                expect(flag, key+' missing').to.be.true;
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