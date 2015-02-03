module.exports = {
    TIMEOUT_SHORT: 2000,
    TIMEOUT: 5000,
    USERS: {
        buyer_general: {
            username: 'buyer_general',
            password: 'XXXXXXXX'
        },
        buyer_general2: {
            username: 'buyer_general2',
            password: 'XXXXXXXX'
        },
        seller_mei: {
            username: 'seller_mei',
            password: 'XXXXXXXX',
            did: 'XXXXXXXX',
            ecid: 'Y9311276010'
        },
        seller_super_bra: {
            ecid: 'Y5783386229'
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
