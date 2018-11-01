import { BigNumber, ERC20TokenWrapper } from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import * as React from 'react';
import { Token, TokenBalanceAllowance} from '../globals';
import { ETHER_TOKEN , TOKENS_BY_NETWORK } from '../tokens';

interface Iprops {
    web3Wrapper: Web3Wrapper;
    erc20TokenWrapper: ERC20TokenWrapper;
}



interface IaccountState {
    balances: {[address: string]:TokenBalanceAllowance[] };
    selectedAccount:string;  
}

const ACCOUNT_CHECK_INTERVAL_MS = 2000;
export  class Account extends React.Component<Iprops,IaccountState> {

    constructor(props: Iprops){
        super(props);
        this.state = { balances: {}, selectedAccount: '' };
        void this.fetchAccountDetailSAsync()
        setInterval(() => {
            void this.checkAccountChangeAsync();
        }, ACCOUNT_CHECK_INTERVAL_MS);

    }
    public async fetchAccountDetailSAsync(){

        const  web3Wrapper = this.props.web3Wrapper;
        const erc20TokenWrapper = this.props.erc20TokenWrapper;
        const balances  = this.state.balances

        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        const address = addresses[0];

        if(!_.isUndefined(address)){
            const networkId = await web3Wrapper.getNetworkIdAsync();
            const tokens = TOKENS_BY_NETWORK[networkId]
            // Getting all balances mapped by tokens
            const allBalancesAsync = _.map( tokens, async (token: Token): Promise< TokenBalanceAllowance | undefined > => {
                if (token.address){
                    const balance = await erc20TokenWrapper.getBalanceAsync(token.address, address);
                    const allowance = await erc20TokenWrapper.getProxyAllowanceAsync(token.address, address);
                    const numberBalance = new BigNumber(balance);
                    return { token, balance: numberBalance, allowance };
                }
                else {
                    return undefined
                }
            })
            
            const results = await Promise.all(allBalancesAsync);
            balances[address] = _.compact(results);
            // Fetch the Balance of Ether
            const weiBalance = await web3Wrapper.getBalanceInWeiAsync(address);
            balances[address] = [
                ...balances[address],
                {   allowance: new BigNumber(0),
                    balance: weiBalance,
                    token: ETHER_TOKEN,
                } as TokenBalanceAllowance,
            ];
            this.setState(prev => {
                const prevSelectedAccount = prev.selectedAccount;
                const selectedAccount = prevSelectedAccount !== address ? address : prevSelectedAccount;
                return { ...prev, balances, selectedAccount };
            });   
        }
    
        else{
            return
        }
        
    }
    public async checkAccountChangeAsync() {
        global.console.log(this.props)
    
        const web3Wrapper  = this.props.web3Wrapper;
        const selectedAccount  = this.state.selectedAccount;
        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        const address = addresses[0];
        if (_.isUndefined(address)) {
            return;
        }
        if (selectedAccount !== address) {
            const balances = {};
            // resetting the account state
            this.setState(prev => ({ ...prev, balances, selectedAccount }));
            void this.fetchAccountDetailSAsync();
        }
    }


    public render(){
        global.console.log(this.state.balances)
        return <div>Account:{this.state.selectedAccount}</div>
    }





}