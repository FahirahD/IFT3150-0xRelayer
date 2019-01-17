import { ContractWrappers, MetamaskSubprovider } from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import * as _ from 'lodash';
import * as React from 'react';
import { ToastProvider, withToastManager }  from 'react-toast-notifications';
import './App.css';
import { Account } from './components/account';
import {  InstallMetamask} from './components/installMetamask'
import { Navbar } from './components/navbar';





interface IAppState {
  web3Wrapper?: Web3Wrapper;
  contractWrappers?: ContractWrappers;
  web3?: any;
  addresses?:any;
}
export class App extends React.Component <{}, IAppState > {

  constructor(props: {}) {
    super(props);
    void this._initWeb3Async()
}

  public async isAdresses(){
      try {
        if(!_.isUndefined(this.state.web3Wrapper)){
          const a =await  Promise.all(await this.state.web3Wrapper.getAvailableAddressesAsync())
            console.log(this.state.addresses[0])
            console.log(a[0])
          if (this.state.addresses[0] !== a[0]){
            this.setState({addresses:a})
            return this.state.addresses
          }
          else{
            return undefined
          }
      }
      else{
        return undefined
      }
    }
      catch (e) {
        return undefined
       
      }
  }
  

  public render() {

   /* const div1 = {
      width: '500px',
      border: 'padding: 0'
    };

    const div2 = {
      width: '500px',
      border: 'padding: 0',
      padding:'auto 0'
    };*/
    
    const NotifiableAccount = withToastManager(Account);
    console.log(this.isAdresses)
    if (!this.state || !this.state.contractWrappers || !this.state.web3Wrapper) {
      return (
        <div>
          <main className="page landing-page">
            <div className="container">
              <Navbar/>
              <InstallMetamask/>
            </div> 
        </main>
      </div>
      )
    }
    else{
      return (
      <div>
        <main className="page landing-page">
        <div className="container">
          <Navbar/>
          <ToastProvider>
              {this.state.web3 && (
                  <NotifiableAccount web3Wrapper = {this.state.web3Wrapper} erc20TokenWrapper = {this.state.contractWrappers.erc20Token} contractWrappers={this.state.contractWrappers}/>
              )}
              {!this.state.web3 && (<InstallMetamask/>)}
          </ToastProvider>
          </div> 
        </main>
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
      const addresses = Promise.all(await web3Wrapper.getAvailableAddressesAsync())
      
      _.map(
        [contractWrappers.exchange.abi,
            contractWrappers.erc20Token.abi,
            contractWrappers.etherToken.abi,
            contractWrappers.forwarder.abi,
        ],
        abi => web3Wrapper.abiDecoder.addABI(abi),
    );
    this.setState({ web3Wrapper, contractWrappers, web3,addresses});
    
      
    }
    
  }
}
export default App;
