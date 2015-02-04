var common = {
    getLinkReg: function(str) {
        return str.replace(/user\./g, '').replace(/page\./g, '').replace(/\//g, '\\/').replace(/\./g, '\\.').replace(/\?/g, '\\?');
    },
    trim: function(str) {
        return str.trim();
    },
    getHost: function(str) {
        return str.replace(/https?:\/\/([^\/]*)\/.*/i, '$1');
    },
    capitalize: function(str) {
        return str.replace(/^[a-z]{1}/,function($1){return $1.toLocaleUpperCase()});
    },
    stripTags: function(str) {
        return str.replace(/(<([^>]+)>)/ig, '');
    },
    registerDestruction: function(host, type, value) {
        var destruction, args;
        if (arguments.length != 3) return;
        if (typeof browser.params.destruction == 'undefined') browser.params.destruction = {};
        destruction = browser.params.destruction;

        args = [host, type];
        args.forEach(
            function(e, idx) {
                if (!destruction[e]) destruction[e] = (!idx) ? {} : [];
                destruction = destruction[e];
            }
        );
        if (destruction.indexOf(value) == -1) destruction.push(value);
        // console.log(browser.params.destruction)
    },
    getTestData: function(layer) {
    	var data;

    	//shadow
        data = browser.params.shadow;
    	for (var i=-1,l=layer.length;++i<l;) data = data[layer[i]];

    	if (typeof data == 'undefined') {
	    	// data = testData;
            data = browser.params.face;
	    	for (var i=-1,l=layer.length;++i<l;) data = data[layer[i]];
    	}//end for

    	return data;
    }
};

module.exports = common;
