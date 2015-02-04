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
                    // location.hash = 'protractor-mark';
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
    login: function(userId) {
        var user, path, stand = this, identity;
        user = constants.USERS[userId];
        path = 'https://accounts.google.com/ServiceLogin?hl=zh-TW&continue=https://www.google.com.tw/';
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
                                stand.one('#Email').clear().sendKeys(user.username),
                                stand.one('#Passwd').clear().sendKeys(user.password)
                            ]).then(
                                function() {
                                    stand.clickAndWaitUntilRedirect('#signIn', constants.TIMEOUT_SHORT);
                                }
                            ).then(
                                function() {
                                    browser.manage().getCookies().then(
                                        function(c) {
                                            c.forEach(
                                                function(unit, idx) {
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