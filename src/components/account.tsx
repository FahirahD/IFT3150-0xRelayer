import { BigNumber, ContractWrappers,ERC20TokenWrapper } from '0x.js';
import { DummyERC20TokenContract } from '@0x/abi-gen-wrappers';
import { DummyERC20Token } from '@0x/contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { withToastManager }  from 'react-toast-notifications';
import {ZeroExActions} from './zeroexActions';
import { /*"Button,*/ Icon} from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';
import { Token, TokenBalanceAllowance} from '../globals';
import { ETHER_TOKEN , TOKENS_BY_NETWORK } from '../tokens';

interface Iprops {

    web3Wrapper: Web3Wrapper;
    contractWrappers: ContractWrappers;
    erc20TokenWrapper: ERC20TokenWrapper;
    toastManager: { add: (msg: string, appearance: {}) => void }
}

interface IaccountState {
    balances: {[address: string]:TokenBalanceAllowance[] };
    selectedAccount:string;  
}

const ACCOUNT_CHECK_INTERVAL_MS = 2000;
const MAX_MINTABLE_AMOUNT = new BigNumber('10000000000000000000000');
const GREEN = '#00d1b2';
export class Account extends React.Component<Iprops,IaccountState> {

    constructor(props: Iprops){
        super(props);
        this.state = { balances: {}, selectedAccount: '' };
        void this.fetchAccountInfosAsync()
        setInterval(() => {
            void this.checkAccountChangeAsync();
        }, ACCOUNT_CHECK_INTERVAL_MS);
    }

    public async fetchAccountInfosAsync(){

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
        const web3Wrapper  = this.props.web3Wrapper;
        const selectedAccount  = this.state.selectedAccount;
        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        const address = addresses[0];
        // if there is no address
        if (_.isUndefined(address)) {
            this.setState({selectedAccount: '', balances:{}})
            return;
        }
        // we logged in a different account
        if (selectedAccount !== address) {
            const balances = {};
            // resetting the account state[address:string]:TokenBalanceAllowance[] 
            this.setState(prev => ({ ...prev, balances, selectedAccount }));
            void this.fetchAccountInfosAsync();
        }
    }

    public renderAllowanceForTokenBalance(tokenBalance: TokenBalanceAllowance): React.ReactNode {
        let allowanceRender;
        if (tokenBalance.token.isTradeable) {
            allowanceRender = tokenBalance.allowance.greaterThan(0) ? (
                //<Icon isSize="small" className="fa fa-check-circle" style={{ color: GREEN }} />
                <Icon className="fa fa-check-circle" style={{color:GREEN}}></Icon>  
            ) : (
                <a href="#" onClick={void this.setProxyAllowanceAsync(tokenBalance.token.address)}>
                    <Icon isSize="small" className="fa fa-lock" />
                </a>
            );
        } else {
            allowanceRender = <div />;
        }
        global.console.log(allowanceRender)
        return allowanceRender;
    }

    public async transactionSubmittedAsync(txHash: string) {
        const { toastManager, web3Wrapper } = this.props;
        toastManager.add(`Transaction Submitted: ${txHash}`, {
            appearance: 'success',
            autoDismiss: true,
        });
        const receipt = await web3Wrapper.awaitTransactionMinedAsync(txHash);
        const appearance = receipt.status === 1 ? 'success' : 'error';
        toastManager.add(`Transaction Mined: ${txHash}`, {
            appearance,
            autoDismiss: true,
        });
        await this.fetchAccountInfosAsync();
    }


  public async setProxyAllowanceAsync(tokenAddress: string) {
        const { erc20TokenWrapper } = this.props;
        const { selectedAccount } = this.state;
        const txHash = await erc20TokenWrapper.setUnlimitedProxyAllowanceAsync(tokenAddress, selectedAccount);
        void this.transactionSubmittedAsync(txHash);
    }
    
    public async mintTokenAsync(tokenBalance: TokenBalanceAllowance) {
        const { selectedAccount } = this.state;
        const token = new DummyERC20TokenContract(
            (DummyERC20Token as any).compilerOutput.abi,
            tokenBalance.token.address,
            this.props.web3Wrapper.getProvider(),
        );
        const maxAmount = await token.MAX_MINT_AMOUNT.callAsync();
        const balanceDiffToMaxAmount = maxAmount.minus(tokenBalance.balance);
        const amountToMint = BigNumber.min(maxAmount, balanceDiffToMaxAmount);
        const txHash = await token.mint.sendTransactionAsync(amountToMint, { from: selectedAccount });
        this.transactionSubmittedAsync(txHash);
    }

    public renderMintForTokenBalance(tokenBalance: TokenBalanceAllowance): React.ReactNode {
        if (tokenBalance.token.isMintable && tokenBalance.balance.lt(MAX_MINTABLE_AMOUNT)) {
            return (
                <a href="#" onClick={void this.mintTokenAsync(tokenBalance)}>
                    <Icon isSize="small" className="fa fa-coins" />
                </a>
            );
        } else {
            return <div />;
        }
    }

    public render(){
        const balances = this.state.balances ;
        const selectedAccount = this.state.selectedAccount ; 
        const accountBalances = balances[selectedAccount]
        const NotifiableZeroExActions = withToastManager(ZeroExActions);

        if (!_.isEmpty(selectedAccount)){
            const balanceRows=_.map(accountBalances,(tokenBalance:TokenBalanceAllowance)=>{  
            const name = tokenBalance.token.name;
                const symbol = tokenBalance.token.symbol;
                const image = tokenBalance.token.image ; 
                const tokenImage = <img src={image} style={{ width: '28px', height: '28px' }} />;

                const balance = Web3Wrapper.toUnitAmount(tokenBalance.balance,tokenBalance.token.decimals) ; 
                const balanceRender = balance.toFixed(4);
                const allowanceRender = this.renderAllowanceForTokenBalance(tokenBalance);
                //const mintRender = this.renderMintForTokenBalance(tokenBalance);

              /*  const colStyle = {
                    width: '500px',
                    border: 'padding:0px'
                }*/
                const cardStyle = {
                    height: 'auto',
                }
                const cardBody = {
                    height: '115px',
                    margin: 'auto',
                    width: '400px'
                }
                const img = {
                    width:'30',
                    height:'30'
                }
                const rowStyle = {
                    width: 'auto',
                    height: 'auto',
                }
                const h5Style = {
                    height: 'auto',
                    margin: '0',
                    width: '154px',
                    padding: '7.5px'
                }
                const h6Style = {
                    height: 'auto',
                    margin: '0',
                    width: '200px',
                    padding: '7.5px',
                }
                /*const i = {
                    color:"rgb(53,203,40)",
                    fontSize: "40px",
                    paddingTop:"auto",
                    paddingBottom:"auto",
                    paddingLeft:"10px",
                    margin:'10px auto',
                    marginTop:"0"
                }*/

                    return (
                        <div key= {name} className="card" style={cardStyle}>
                            <div className="card-body row" style={cardBody}>
                                <div className ="row" style={img}> {tokenImage} </div>
                                <div className ="col" style={rowStyle}>
                                    <h5 className ="col"style={h5Style}>&nbsp;{symbol}&nbsp;</h5>
                                    <h6 style={h6Style}>&nbsp;Balance: ${balanceRender}</h6>
                                    <div>{allowanceRender}</div>
                                </div>   
                        </div>
                                 
                        </div>
                    )
            });
            
            const contentRender = (
                <div className="">
                        {balanceRows}
                </div>
            );
            return(<div className="row">
                        <div className="col">
                            <div className="row">
                                <div className="card">
                                    <div className="card-body">
                                        <h4 className="card-title .col-md-5">Account :</h4>
                                        <p className="card-text .col-md-5">{selectedAccount}</p>
                                    </div>
                                </div>
                            </div>
                            <div className= 'row'>
                                {contentRender}
                            </div>
                        </div>
                    
                    <div className="col">
                        <NotifiableZeroExActions web3Wrapper = {this.props.web3Wrapper} contractWrappers = {this.props.contractWrappers}/>
                    </div>
                    
                </div>
            );
        }
        else{
            const signIn = {
            minHeight: '100vh',
            padding:' auto auto'
        }
         const header = {
            margin:'auto auto'
         }
            return(
                <div className='row' style = {signIn}><h1 style={header}>Sign in your Metamask account</h1></div>
                )
        }
    }
}