var header;

header = function() {
	this.selector = {
        header: '#mngb'
    };
};

header.prototype = {
    one: PageObject.prototype.one,
    all: PageObject.prototype.all
};

module.exports = header;