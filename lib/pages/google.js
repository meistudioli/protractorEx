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
    	logo: '#hplogo',
    	Gmail: '#gbzc li:nth-child(8) a',
    	searchTool: '#hdtb_tls',
    	filterArea: 'div[aria-label="不限國家/地區"]',
    	STExpands: 'ul.hdtbU[aria-expanded="true"]',
    	STExpandLinks: 'ul.hdtbU[aria-expanded="true"] a'
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

google.prototype.getUrlPattern = function(patternId, link) {
    var pattern;
    switch(patternId) {
    	case 'Gmail':
    		pattern = new RegExp('^https?:\/\/mail\.google\.com\/mail\/.*');
    		break;
        default:
            pattern = (typeof link == 'undefined') ? /^fail$/ : new RegExp(common.getLinkReg(link));
    }//end switch
    return pattern;
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
		function(err) {
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

google.prototype.filterAreaAs = function(key) {
	var stand = this;
	return this.one('searchTool').click().then(
		function() {
			stand.waitUntilDisplay('filterArea');
		}
	).then(
		function() {
			stand.one('filterArea').click().then(
				function() {
					stand.waitUntilPresent('STExpands');
				}
			);
		}
	).then(
		function() {
			var filter;
			stand.all('STExpandLinks').each(
				function(unit) {
					unit.getText().then(
						function(content) {
							if (content == key) filter = unit;
						}
					);
				}
			).then(
				function() {
					if (!filter) return;
					stand.clickAndWaitUntilRedirect(filter).then(
						function() {
							browser.sleep(500);// data query
							stand.one('searchTool').click().then(
								function() {
									browser.sleep(300);//animation
								}
							);
						}
					);
				}
			);
		}
	).then(
		function() {
			return stand;
		}
	);
};

module.exports = google;