module.exports = {
    TIMEOUT_SHORT: 2000,
    TIMEOUT: 5000,
    USERS: {
        mei: {
            username: 'mei.dummy.01',
            password: 'xxxxxxxx'
        }
    },
    URL_MAP: {
        google: 'https://www.google.com.tw/'
    },
    PO: {
        pageObject: '/lib/pages/pageObject.js',
        google: '/lib/pages/google.js'
    },
    COM: {
        header: '/lib/components/header.js',
        footer: '/lib/components/footer.js'
    }
};
