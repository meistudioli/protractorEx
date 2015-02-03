var google = function() {
	var Given = When = Then = this.defineStep;

	/*------------------------ When ---------------------- --*/

	// I search "in 91"
	When(/^I search "([^"]*)"$/, function(key, callback) {
		this.stand.goSearch(key).then(
			function(google) {
				//do nothing
			}
		).then(callback, callback);
	});


	/*------------------------ Then ---------------------- --*/

	// search result must have more than "1" record 
    Then(/search result must have more than "(\d+)" record/, function(amount, callback) {
        var request = Number(amount);

        this.stand.getSearchResultAmount().then(
            function(amount) {
                expect(amount, 'search result error').to.be.at.least(request);
            }
        ).then(callback, callback);
    });


    // first record title must be "In 91 - 點部落"
    Then(/first record title must be "(.*)"/, function(key, callback) {
    	var request = key;

    	this.stand.getFirstRecordTitle().then(
    		function(title) {
    			expect(title, 'title is empty').to.not.be.empty;
    			expect(title, 'result title error').to.be.eq(request);
    		}
    	).then(callback, callback);
    });
};

module.exports = google;