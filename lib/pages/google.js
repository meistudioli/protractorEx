var google;

google = function() {
	PageObject.call(this); // call super constructor.

	this.data.id = 'google';
    this.data.url = constants.URL_MAP.google;
    this.data.urlPattern = /^https?:\/\/www\.google\.com\.tw\/?$/;

    this.selector = {
    	inputQ: '#lst-ib',
    	btnSearch: 'input[name="btnK"]',
    	btnSearchTop: 'button[name="btnG"]',
    	searchResultAmount: '#resultStats',
    	results: '#ires li',
    	logo: '#hplogo'
    };

};
google.prototype = Object.create(PageObject.prototype);

google.prototype.go = function() {
	var stand = this;
	return browser.getCurrentUrl().then(
		function(url) {
			if (stand.data.urlPattern.test(url)) return;
			browser.get(stand.data.url);
		}
    ).thenCatch(
        function(err) {
            //err catch
        }
    ).then(
        function() {
            return stand;
        }
    );
};

google.prototype.goSearch = function(keyword) {
	var stand = this;
	return this.one('inputQ').clear().sendKeys(keyword).then(
		function() {
			stand.one('logo').then(
				function(e) {
					e.click();
				},
				function(err) {
					//err catch
				}
			);
		}
	).then(
		function() {
			return stand.one('btnSearch').isDisplayed().then(
				function(flag) {
					return stand.one(flag ? 'btnSearch' : 'btnSearchTop');
				},
				function() {
					return stand.one('btnSearch');
				}
			);
		}
	).then(
		function(submit) {
			stand.clickAndWaitUntilRedirect(submit);
		}
	).then(
		function() {
			stand.waitUntilPresent('searchResultAmount');
		}
	).then(
		function() {
			return stand;
		}
	);
};

google.prototype.getSearchResultAmount = function() {
	return this.one('searchResultAmount').getInnerHtml().then(
		function(html) {
			html = html.replace(/,/g, '').replace(/約有 (\d+) 項結果.*/, '$1');
			return Number(html);
		},
		function() {
			return 0;
		}
	);
};

google.prototype.getFirstRecordTitle = function() {
	return this.one('results').$('a').getText().then(
		function(title) {
			return title;
		},
		function() {
			return '';
		}
	);
};

module.exports = google;