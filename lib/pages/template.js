var myAuc;

myAuc = function(itemId) {
	PageObject.call(this); // call super constructor.

	this.data.id = 'myAuc';
    this.data.url = constants.URL_MAP.my_auction;

    this.selector = {
    };

    //components
    com_navigation = require(__base + constants.COM.navigation);
    this.navigation = new com_navigation();
};
myAuc.prototype = Object.create(PageObject.prototype);

module.exports = myAuc;