var footer;

footer = function() {
	this.selector = {
        footer: '#footer'
    };
};

footer.prototype = {
    one: PageObject.prototype.one,
    all: PageObject.prototype.all
};

module.exports = footer;