import { ContractWrappers, SignedOrder } from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { Button, PanelBlock, TextArea } from 'bloomer';
import * as React from 'react';
import { PanelBlockField } from '../panelBlockField';
import { parseJSONSignedOrder } from '../utils';

interface Iprops {
    contractWrappers: ContractWrappers;
    web3Wrapper: Web3Wrapper;
    onTxSubmitted: (txHash: string) => void;
}
interface IfillOrderState {
    signedOrder?: string;
}

export class FillOrder extends React.Component<Iprops, IfillOrderState> {
    public fillOrderAsync = async (signedOrder: SignedOrder): Promise<string> => {
        const { web3Wrapper, contractWrappers } = this.props;
        // Query all available addresses
        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        // Taker is the first address
        const takerAddress = addresses[0];
        const takerFillAmount = signedOrder.takerAssetAmount;
        // Call fillOrder on the Exchange contract
        const txHash = await contractWrappers.exchange.fillOrderAsync(signedOrder, takerFillAmount, takerAddress);
        return txHash;
    }
    public render(): React.ReactNode {
        return (
            <div>
                <PanelBlock>
                    <div>
                        Orders are filled when a taker submits them to the blockchain.
                    </div>
                </PanelBlock>
                <PanelBlockField label="Order">
                    <TextArea
                        type="text"
                        placeholder="Order"
                        onChange={e => {
                            const value = (e.target as any).value;
                            this.setState(prev => ({ ...prev, signedOrder: value }));
                        }}
                    />
                </PanelBlockField>
                <PanelBlock>
                    <Button
                        onClick={this.fillOrderClick.bind(this)}
                        isFullWidth={true}
                        isSize="small"
                        isColor="primary"
                    >
                        Fill Order
                    </Button>
                </PanelBlock>
            </div>
        );
    }
    public fillOrderClick = async () => {
        const signedOrderJSON = this.state.signedOrder;
        if (signedOrderJSON) {
            const signedOrder = parseJSONSignedOrder(signedOrderJSON);
            const txHash = await this.fillOrderAsync(signedOrder);
            this.props.onTxSubmitted(txHash);
        }
    }
}
