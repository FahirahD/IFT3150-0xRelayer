import { BigNumber } from "0x.js";


interface Token {
    name: string;
    address: string;
    symbol: string;
    decimals: number;
    isTradeable: boolean;
    isMintable: boolean;
    image: string;
}

interface TokenBalanceAllowance {
    token: Token;
    balance: BigNumber;
    allowance: BigNumber;
}
