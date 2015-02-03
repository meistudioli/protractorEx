var PageObject, com_header, com_footer;

var PageObject = function() {
    this.data = {
        id: '',
        url: ''
    };

    this.selector = {};

    //components
    com_header = require(__base + constants.COM.header);
    com_footer = require(__base + constants.COM.footer);

    this.header = new com_header();
    this.footer = new com_footer();
};

PageObject.prototype = {
    one: function(key) {
        var s = this.selector[key.replace(/\s/g, '')] || key;
        return $(s);
    },
    all: function(key) {
        var s = this.selector[key.replace(/\s/g, '')] || key;
        return $$(s);
    },
    go: function() {
        var stand = this, pattern = new RegExp(common.getLinkReg(this.data.url));
        return browser.getCurrentUrl().then(
            function(url) {
                if (!browser.params.forceRefresh && pattern.test(url)) return;
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
        // var stand = this;
        // return browser.get(this.data.url).then(
        //     function() {
        //         return stand;
        //     }
        // );
    },
    waitUntilDisplay: function(element, timeout) {
        var timer = timeout || constants.TIMEOUT, e = (typeof element.isDisplayed != 'undefined') ? element : this.one(element);
        return browser.wait(
            function() {
                return e.isDisplayed().then(
                    function(flag) {
                        return flag;
                    },
                    function() {
                        return false;
                    }
                );
            }
        , timer);
    },
    waitUntilNotDisplay: function(element, timeout) {
        var timer = timeout || constants.TIMEOUT, e = (typeof element.isDisplayed != 'undefined') ? element : this.one(element);
        return browser.wait(
            function() {
                return e.isDisplayed().then(
                    function(flag) {
                        return !flag;
                    }
                );
            }
        , timer);
    },
    waitUntilPresent: function(element, timeout) {
        var timer = timeout || constants.TIMEOUT, e = (typeof element.isPresent != 'undefined') ? element : this.one(element);
        return browser.wait(
            function() {
                return e.isPresent().then(
                    function(flag) {
                        return flag;
                    },
                    function() {
                        return false;
                    }
                );
            }
        , timer);
    },
    waitUntilNotPresent: function(element, timeout) {
        var timer = timeout || constants.TIMEOUT, e = (typeof element.isPresent != 'undefined') ? element : this.one(element);
        return browser.wait(
            function() {
                return e.isPresent().then(
                    function(flag) {
                        return !flag;
                    } 
                );
            }
        , timer);
    },
    waitUntilUrlChange: function(url, timeout) {
        var timer = timeout || constants.TIMEOUT;
        return browser.wait(
            function() {
                return browser.getCurrentUrl().then(
                    function(cUrl) {
                        // console.log(cUrl)
                        return cUrl != url;
                    }
                );
            }
        , timer);
    },
    clickAndWaitUntilRedirect: function(target, timeout) {
        var timer = timeout || constants.TIMEOUT, e = (typeof target.isPresent != 'undefined') ? target : this.one(target), stand = this;

        return  browser.executeScript(
            function() {
                location.hash = 'protractor-mark';
            }
        ).then(
            function() {
                return browser.getCurrentUrl().then(
                    function(url) {
                        return e.click().then(
                            function() {
                                stand.waitUntilUrlChange(url, timer);
                            }
                        ).then(
                            function() {
                                stand.waitUntilPresent('body', constants.TIMEOUT_SHORT);
                            }
                        );
                    }
                );
            }
        );
    },
    detachWaitingDOMHandle: function() {
        return browser.executeScript(
            function() {
                try {
                    window.waitingDOMHandle.detach();
                } catch(e) {}
            }
        );
    },
    getContentAndRequestKey: function(key) {
        var data = {
            result: '',
            request: this.requestKey[key.replace(/\s/g, '')] || key
        };
        return this.one(key).getInnerHtml().then(
            function(content) {
                data.result = content.trim();
            },
            function() {
                data.result = '';
            }
        ).then(
            function() {
                return data;
            }
        );
    },
    io: function(uri, options) {
        var xhr = require('xmlhttprequest').XMLHttpRequest, cfg, params = '';
        xhr = new xhr();
        cfg = {
            method: options.method || 'POST',
            data: {}
        };
        cfg.method = cfg.method.toUpperCase();
        if (['GET', 'POST'].indexOf(cfg.method) == -1) cfg.method = 'POST';
        if (options.data && typeof options.data == 'string') {
            params = options.data.replace(/^&(.*)/, '$1');
        } else {
            for (var i in options.data) {
                if (options.data.hasOwnProperty(i)) cfg.data[i] = options.data[i];
            }//end if        
            for (var i in cfg.data) params += '&' + i + '=' + cfg.data[i];
            params = params.slice(1);
        }//end if

        if (/get/i.test(cfg.method)) uri += ((uri.indexOf('?') == -1) ? '?' : '&') + params;
        xhr.open(cfg.method, uri, false);
        
        return protractor.promise.all([
            xhr.send(params)
        ]).then(
            function() {
                return xhr.responseText.replace(/\)\]\}',\n/, '');
            }
        );
    },
	getURIs: function() {
		var vars = {}, data, uris = arguments[0];
		uri = uris;
		data = [uri.replace(/.*\?([^\#]*)(\#[^\#]*)*$/, '$1'), uri.replace(/([^\#\!]*)\#\!([^\#\!]*)$/, '$2')];//p,h
		for (var i=-1,l=data.length;++i<l;) {
			if (data[i] == uri) continue;
			var vs = data[i].split('&');
			for (var j=-1,l2=vs.length;++j<l2;) {
				if (vs[j].indexOf('=') == -1) continue;
				var kv = vs[j].split('=');
				vars[kv[0]] = kv[1];
			}//end for
		}//end for
		return [(uris.replace(/^([^\?]*)\??.*$/, '$1')).replace(/^([^\#]*)\#?.*$/, '$1'), vars];//[filename, vars]
	},
    hide: function(target) {
        var m = this, target = (typeof target.isPresent != 'undefined') ? target : this.one(target);
        return target.isDisplayed().then(
            function(flag) {
                if (flag) {
                    browser.executeScript(
                        function() {
                            arguments[0].style.display = 'none';
                        }
                    , target.getWebElement());
                }//end if
            },
            function() {
                // console.log('error')
            }
        );
    },
    rollTo: function(target) {
        var pos;
        if (typeof target == 'undefined' || target.hasOwnProperty('x') || target.hasOwnProperty('y')) {
            pos = {x:0, y:0};
            for (var i in target) pos[i] = target[i];
            return browser.executeScript(
                function() {
                    var pos = arguments[0];
                    scrollTo(pos.x, pos.y);
                }
            , pos);
        } else {
            if (typeof target == 'string') target = this.one(target);
            return target.getLocation().then(
                function(info) {
                    return info;
                }
            ).then(
                function(info) {
                    browser.executeScript(
                        function() {
                            var pos = arguments[0];
                            scrollTo(pos.x, pos.y);
                        }
                    , info);
                }
            );
        }//end if
    },
    rolloverFor: function(target, trigger, timout) {
        var t = timout || 1000, o = this, trigger = (typeof trigger.isPresent != 'undefined') ? trigger : this.one(trigger), target = (typeof target.isPresent != 'undefined') ? target : this.one(target);
        return browser.actions().mouseMove(trigger).perform().then(
            function() {
                browser.wait(
                    function() {
                        browser.actions().mouseMove(trigger).perform();
                        return  target.isDisplayed();
                    }
                , t);
            }
        ).then(
            function() {
                return  target.isDisplayed();
            },
            function() {
                return false;
            }
        );
    },
    redirect: function(target, patternId, userId) {
        var e = (typeof target.isPresent != 'undefined') ? target : this.one(target), pId = patternId.replace(/\s/g, ''), link, stand = this;
        return protractor.promise.all([
            browser.executeScript(
                function() {
                    var t = arguments[0];
                    t.target = '_top';
                    location.hash = 'protractor-mark';
                }
            , e.getWebElement()),
            e.getAttribute('href')
        ]).then(
            function(args) {
                link = args[1];
                browser.actions().mouseMove(e).perform().then(
                    function() {
                        browser.getCurrentUrl().then(
                            function(url) {
                                e.click().then(
                                    function() {
                                        stand.waitUntilUrlChange(url);
                                    }
                                ).then(
                                    function() {
                                        if (/^rss$/i.test(patternId)) return;
                                        stand.waitUntilPresent('body', constants.TIMEOUT_SHORT);
                                    }
                                ).then(
                                    function() {
                                        if (typeof userId == 'undefined') return;
                                        //login again
                                        browser.getCurrentUrl().then(
                                            function(uri) {
                                                if (!(/login\.yahoo/.test(uri))) return;
                                                var user = constants.get('USERS.'+userId);
                                                return browser.executeScript(
                                                    function() {
                                                        location.hash = 'protractor-mark';
                                                    }
                                                ).then(
                                                    function() {
                                                        stand.one('#login-passwd').clear().sendKeys(user.password);
                                                    }
                                                ).then(
                                                    function() {
                                                        stand.one('#login-signin').click().then(
                                                            function() {
                                                                stand.waitUntilUrlChange(url);
                                                            }
                                                        );
                                                    }
                                                );
                                            }
                                        );
                                    }
                                );
                            }
                        );
                    }
                );
            },
            function() {
                throw new Error('redirect prepare error');
            }
        ).then(
            function() {
                return browser.getCurrentUrl().then(
                    function(url) {
                        // console.log(stand.getUrlPattern(pId, link));
                        // console.log(url)
                        return stand.getUrlPattern(pId, link).test(url);
                    }
                );
            },
            function() {
                return false;
            }
        );
    },
    getUrlPattern: function(patternId, link) {
        var pattern;
        switch(patternId) {
            default:
                pattern = (typeof link == 'undefined') ? /^fail$/ : new RegExp(common.getLinkReg(link));
        }//end switch
        return pattern;
    },
    getAmount: function(key) {
        return this.all(key).count().then(
            function(amt) {
                return amt;
            },
            function() {
                return 0;
            }
        );
    },
    isExist: function(target) {
        var e = (typeof target.isPresent != 'undefined') ? target : this.one(target);
        return browser.wait(
            function() {
                return e.isPresent().then(
                    function(flag) {
                        return flag;
                    }
                );
            }
        , 5000).then(
            function() {
                return browser.actions().mouseMove(e).perform().then(
                    function() {
                        return true;
                    }
                );
            },
            function() {
                return false;
            }
        );
    },
    getHost: function(str) {
        return str.replace(/https?:\/\/([^\/]*)\/.*/i, '$1');
    },
    logout: function() {
        var redirect = 'http://tw.bid.yahoo.com/status.html';
        return browser.get('https://login.yahoo.com/config/login?logout=1&.direct=2&.src=ymbr&.intl=tw&.lang=zh-Hant-TW&.done='+redirect).then(
            function() {
                var pattern = /.*status.html$/;
                browser.wait(
                    function() {
                        return browser.getCurrentUrl().then(
                            function(url) {
                                return pattern.test(url);
                            }
                        );
                    }
                , 3000);
            }
        );
    },
    loginBK: function(userId) {
        var user, path, stand = this;

        user = constants.get('USERS.' + userId);
        path = 'https://login.yahoo.com/m?.lg=tw&.intl=tw&.src=mktg1&.done=http://tw.bid.yahoo.com/status.html';

        return browser.manage().deleteAllCookies().then(
            function() {
                browser.get(path).then(
                    function() {
                        protractor.promise.all([
                            stand.one('#login-username').clear().sendKeys(user.username),
                            stand.one('#login-passwd').clear().sendKeys(user.password)
                        ]).then(
                            function() {
                                stand.clickAndWaitUntilRedirect('#login-signin', constants.TIMEOUT_SHORT).thenCatch(
                                    function() {
                                        stand.clickAndWaitUntilRedirect('#login-signin', constants.TIMEOUT_SHORT);
                                    }
                                );
                            }
                        );
                    }
                );
            }
        );
    },
    login: function(userId) {
        var user, path, stand = this, identity, did;
        user = constants.get('USERS.' + userId);
        path = 'https://login.yahoo.com/m?.lg=tw&.intl=tw&.src=mktg1&.done=http://tw.bid.yahoo.com/status.html';
        if (!browser.params.identity) browser.params.identity = {};
        if (typeof browser.params.loginId == 'undefined') browser.params.loginId = '';

        browser.params.forceRefresh = (browser.params.loginId != userId) ? true : false;
        browser.params.loginId = userId;

        return browser.manage().deleteAllCookies().then(
            function() {
                if (browser.params.identity[userId]) {
                    identity = browser.params.identity[userId];
                    identity.forEach(
                        function(unit, idx) {
                            browser.manage().addCookie(unit.name, unit.value, unit.path, unit.domain);
                        }
                    );
                } else {
                    identity = [];
                    browser.get(path).then(
                        function() {
                            protractor.promise.all([
                                stand.one('#login-username').clear().sendKeys(user.username),
                                stand.one('#login-passwd').clear().sendKeys(user.password)
                            ]).then(
                                function() {
                                    stand.clickAndWaitUntilRedirect('#login-signin', constants.TIMEOUT_SHORT).thenCatch(
                                        function() {
                                            stand.clickAndWaitUntilRedirect('#login-signin', constants.TIMEOUT_SHORT);
                                        }
                                    );
                                }
                            ).then(
                                function() {
                                    if (!user.did) return;
                                    // pass did
                                    did = require(__base + constants.PO.did);
                                    did = new did();
                                    did.go().then(
                                        function() {
                                            did.pass(userId);
                                        }
                                    );
                                }
                            ).then(
                                function() {
                                    browser.manage().getCookies().then(
                                        function(c) {
                                            c.forEach(
                                                function(unit, idx) {
                                                    // if (['Y', 'T', 'B', 'F', 'SSL', 'K'].indexOf(unit.name) == -1) return;
                                                    if (['Y', 'T', 'F', 'SSL', 'K'].indexOf(unit.name) == -1) return;
                                                    identity.push(unit);
                                                }
                                            );
                                        }
                                    ).then(
                                        function() {
                                            browser.params.identity[userId] = identity;
                                        }
                                    );
                                }
                            );
                        }
                    );
                }//end if
            }
        );
    }
};

module.exports = PageObject;