import { ContractWrappers, MetamaskSubprovider } from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import * as React from 'react';
import './App.css';
import { Account } from './components/account';

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
    if (!this.state || !this.state.contractWrappers || !this.state.web3Wrapper) {
      return <div />;
    }
    else{
      return (
        <div>
          {this.state.web3 && (<Account web3Wrapper = {this.state.web3Wrapper} erc20TokenWrapper= {this.state.contractWrappers.erc20Token}/> )}
          {!this.state.web3 && <p>install metamask</p>}
        </div>
          
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
      const contractWrappers = new ContractWrappers (provider , {networkId})

      _.map(
        [
            contractWrappers.exchange.abi,
            contractWrappers.erc20Token.abi,
            contractWrappers.etherToken.abi,
            contractWrappers.forwarder.abi,
        ],
        abi => web3Wrapper.abiDecoder.addABI(abi),
    );
    // global.console.log(web3)
    // global.console.log(web3Wrapper)
    // global.console.log(contractWrappers)
    this.setState({ web3Wrapper, contractWrappers, web3 });
      
    }
    
  }
}
export default App;
