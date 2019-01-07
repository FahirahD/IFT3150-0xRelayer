import { ContractWrappers, MetamaskSubprovider } from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import * as React from 'react';
import { ToastProvider, withToastManager }  from 'react-toast-notifications';
import './App.css';
import { Account } from './components/account';
import {ZeroExActions} from './components/zeroexActions';
import {  InstallMetamask} from './components/installMetamask'


interface IAppState {
  web3Wrapper?: Web3Wrapper;
  contractWrappers?: ContractWrappers;
  web3?: any;
}
export class App extends React.Component <{}, IAppState > {

  constructor(props: {}) {
    super(props);
    void this._initWeb3Async()
}
  
  public render() {
    const NotifiableAccount = withToastManager(Account);
    const NotifiableZeroExActions = withToastManager(ZeroExActions);
    if (!this.state || !this.state.contractWrappers || !this.state.web3Wrapper) {
      return <div />;
    }
    else{
      return (
        <ToastProvider>
            {this.state.web3 && (
            <div>
              <NotifiableAccount web3Wrapper = {this.state.web3Wrapper} erc20TokenWrapper = {this.state.contractWrappers.erc20Token}/>
              <NotifiableZeroExActions web3Wrapper = {this.state.web3Wrapper} contractWrappers = {this.state.contractWrappers}/>
            </div>
            )}
            {!this.state.web3 && (<InstallMetamask/>)}

        </ToastProvider>
          
            );
    }
  }
  
  private async _initWeb3Async(): Promise <void> {

    const web3 = (window as any).web3;

    if (web3){
      const provider = (web3.currentProvider as any).isMetaMask
      ? new MetamaskSubprovider(web3.currentProvider)
      : web3.currentProvider;

      const web3Wrapper = new Web3Wrapper(provider);
      const networkId = await web3Wrapper.getNetworkIdAsync()
      global.console.log(networkId)
      const contractWrappers = new ContractWrappers (provider , {networkId})

      _.map(
        [contractWrappers.exchange.abi,
            contractWrappers.erc20Token.abi,
            contractWrappers.etherToken.abi,
            contractWrappers.forwarder.abi,
        ],
        abi => web3Wrapper.abiDecoder.addABI(abi),
    );
 
    this.setState({ web3Wrapper, contractWrappers, web3 });
      
    }
    
  }
}
export default App;
