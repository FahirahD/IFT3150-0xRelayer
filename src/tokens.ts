import {Token} from "./globals"

export const TOKENS = {
    GNT: {
        decimals: 18,
        image: 'https://0xproject.com/images/token_icons/GNT.png',
        isMintable: true,
        isTradeable: true,
        name: 'Golem Network Token',
        symbol: 'GNT',
    },

    MKR: {
        decimals: 18,
        image: 'https://0xproject.com/images/token_icons/MKR.png',
        isMintable: true,
        isTradeable: true,
        name: 'Maker DAO',
        symbol: 'MKR',
        
    },
    REP: {
        decimals: 18,
        image: 'https://0xproject.com/images/token_icons/REP.png',
        isMintable: true,
        isTradeable: true,
        name: 'Augur Reputation Token',
        symbol: 'REP',
    },
    WETH: {
        decimals: 18,
        image: 'https://0xproject.com/images/token_icons/WETH.png',
        isMintable: false,
        isTradeable: true,
        name: 'Wrapped ETH',
        symbol: 'WETH',
    },
    ZRX: {
        decimals: 18,
        image: 'https://0xproject.com/images/token_icons/ZRX.png',
        isMintable: true,
        isTradeable: true,
        name: '0x Protocol Token',
        symbol: 'ZRX',
    },
    
};

export const ETHER_TOKEN: Token = {
    address: '0x0',
    decimals: 18,
    image: 'https://0xproject.com/images/ether.png',
    isMintable: false,
    isTradeable: false,
    name: 'Ether',
    symbol: 'ETH',
};

export const TOKENS_BY_NETWORK: { [networkId: number]: { [tokenSymbol: string]: Token } } = {
    3: {
        
        GNT: {
            ...TOKENS.GNT,
            address: '0x7f8acc55a359ca4517c30510566ac35b800f7cac',
        },
        MKR: {
            ...TOKENS.MKR,
            address: '0x06732516acd125b6e83c127752ed5f027e1b276e',
        },
        REP: {
            ...TOKENS.REP,
            address: '0xb0b443fe0e8a04c4c85e8fda9c5c1ccc057d6653',
        },
        WETH: {
            ...TOKENS.WETH,
            address: '0xc778417e063141139fce010982780140aa0cd5ab',
        },
        ZRX: {
            ...TOKENS.ZRX,
            address: '0xff67881f8d12f372d91baae9752eb3631ff0ed00',
        },
    },
    
    42: {
        GNT: {
            ...TOKENS.GNT,
            address: '0x31fb614e223706f15d0d3c5f4b08bdf0d5c78623',
        },
        MKR: {
            ...TOKENS.MKR,
            address: '0x7b6b10caa9e8e9552ba72638ea5b47c25afea1f3',
        },
        REP: {
            ...TOKENS.REP,
            address: '0x8cb3971b8eb709c14616bd556ff6683019e90d9c',
        },
        WETH: {
            ...TOKENS.WETH,
            address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
        },
        ZRX: {
            ...TOKENS.ZRX,
            address: '0x2002d3812f58e35f0ea1ffbf80a75a38c32175fa',
        },
    },

    5777: {
        
        GNT: {
            ...TOKENS.GNT,
            address: '0x7f8acc55a359ca4517c30510566ac35b800f7cac',
        },
        MKR: {
            ...TOKENS.MKR,
            address: '0x06732516acd125b6e83c127752ed5f027e1b276e',
        },
        REP: {
            ...TOKENS.REP,
            address: '0xb0b443fe0e8a04c4c85e8fda9c5c1ccc057d6653',
        },
        WETH: {
            ...TOKENS.WETH,
            address: '0xc778417e063141139fce010982780140aa0cd5ab',
        },
        ZRX: {
            ...TOKENS.ZRX,
            address: '0xff67881f8d12f372d91baae9752eb3631ff0ed00',
        },
    },
};
