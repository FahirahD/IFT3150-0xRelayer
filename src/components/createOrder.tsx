import {
    assetDataUtils,
    BigNumber,
    ContractWrappers,
    generatePseudoRandomSalt,
    Order,
    orderHashUtils,
    signatureUtils,
    SignedOrder,
} from '0x.js';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { Button, Control, Field, Input, PanelBlock, Select, TextArea } from 'bloomer';
import * as _ from 'lodash';
import * as React from 'react';
import { PanelBlockField } from '../panelBlockField';
import { TOKENS, TOKENS_BY_NETWORK } from '../tokens';
import { NULL_ADDRESS, ZERO } from '../utils';


interface Iprops {
    contractWrappers: ContractWrappers;
    web3Wrapper: Web3Wrapper;
    onTxSubmitted: (txHash: string) => void;
}
interface IcreateOrderState {
    makerTokenSymbol: string;
    takerTokenSymbol: string;
    makerAmount: string;
    takerAmount: string;
    signedOrder?: SignedOrder;
    orderHash?: string;
    errorMessage?: string;
}

enum TraderSide {
    MAKER,
    TAKER,
}

export class CreateOrder extends React.Component<Iprops, IcreateOrderState> {
    constructor(props: Iprops) {
        super(props);
        this.state = {
            makerAmount: '1',
            makerTokenSymbol: TOKENS.ZRX.symbol,
            takerAmount: '1',
            takerTokenSymbol: TOKENS.WETH.symbol,
        };
    }
    public createOrderAsync = async (): Promise<SignedOrder> => {
        const { makerTokenSymbol, makerAmount, takerTokenSymbol, takerAmount } = this.state;
        const { web3Wrapper, contractWrappers } = this.props;
        // Query the available addresses
        const addresses = await web3Wrapper.getAvailableAddressesAsync();
        // Retrieve the network for the correct token addresses
        const networkId = await web3Wrapper.getNetworkIdAsync();
        // Use the first account as the maker
        const makerAddress = addresses[0];
        // Get the Token Metadata, address, decimals
        const tokensForNetwork = TOKENS_BY_NETWORK[networkId];
        const makerToken = tokensForNetwork[makerTokenSymbol];
        const takerToken = tokensForNetwork[takerTokenSymbol];
        // Encode the selected makerToken as assetData for 0x
        const makerAssetData = assetDataUtils.encodeERC20AssetData(makerToken.address);
        // Encode the selected takerToken as assetData for 0x
        const takerAssetData = assetDataUtils.encodeERC20AssetData(takerToken.address);
        // Amounts are in Unit amounts, 0x requires base units (as many tokens use decimals)
        const makerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(makerAmount), makerToken.decimals);
        const takerAssetAmount = Web3Wrapper.toBaseUnitAmount(new BigNumber(takerAmount), takerToken.decimals);
        const exchangeAddress = contractWrappers.exchange.address;
        // Create the order
        const order: Order = {
            exchangeAddress,
            expirationTimeSeconds: new BigNumber(Date.now() + 10 * 60), // Time when this order expires
            feeRecipientAddress: NULL_ADDRESS, // No fee recipient
            makerAddress, // maker is the first address
            makerAssetAmount, // The maker asset amount
            makerAssetData,
            makerFee: ZERO, // 0 maker fees
            salt: generatePseudoRandomSalt(), // Random value to provide uniqueness
            senderAddress: NULL_ADDRESS, // Sender address is open and can be submitted by anyone
            takerAddress: NULL_ADDRESS, // taker is open and can be filled by anyone
            takerAssetAmount, // The taker asset amount
            takerAssetData,
            takerFee: ZERO, // 0 taker fees
    
            
        };
        // Generate the order hash for the order
        const orderHashHex = orderHashUtils.getOrderHashHex(order);
        const provider = web3Wrapper.getProvider();
        // The maker signs the order as a proof
        try {
            const signedOrder = await signatureUtils.ecSignOrderAsync(provider, order, makerAddress);
            // Store the signed Order
            this.setState(prevState => ({ ...prevState, signedOrder, orderHash: orderHashHex }));
            return signedOrder;
        } catch (err) {
            this.setState({ errorMessage: err.message });
            return null as any;
        }
    }
    public render(): React.ReactNode {
        const signedOrderRender = this.state.signedOrder ? (
            <div>
                <PanelBlockField label="Order Hash">
                    <Input value={this.state.orderHash} readOnly={true} />
                </PanelBlockField>
                <PanelBlockField label="Signed Order">
                    <TextArea value={JSON.stringify(this.state.signedOrder, null, 2)} type="text" readOnly={true} />
                </PanelBlockField>
            </div>
        ) : (
            <div />
        );
        const makerTokenRender = (
            <PanelBlockField label="Maker Token">
                <Field hasAddons={true}>
                    <Control>{this.buildTokenSelector(TraderSide.MAKER)}</Control>
                    <Input
                        onChange={this.orderTokenAmountChangedEvent.bind(TraderSide.MAKER)}
                        value={this.state.makerAmount}
                        type="text"
                        placeholder="Amount"
                    />
                </Field>
            </PanelBlockField>
        );
        const takerTokenRender = (
            <PanelBlockField label="Taker Token">
                <Field hasAddons={true}>
                    <Control>{this.buildTokenSelector(TraderSide.TAKER)}</Control>
                    <Control isExpanded={true}>
                        <Input
                            onChange={this.orderTokenAmountChangedEvent.bind(this,TraderSide.TAKER)}
                            value={this.state.takerAmount}
                            type="text"
                            placeholder="Amount"
                        />
                    </Control>
                </Field>
            </PanelBlockField>
        );
        const errorMessageRender = this.state.errorMessage ? <div>{this.state.errorMessage}</div> : <div />;
        return (
            <div>
                <PanelBlock>
                    <div>
                        Creates a 0x order, specifying the Maker and Taker tokens and their amounts. Orders are signed
                        by the maker. Takers find these signed orders and "fill" them by submitting to the blockchain.
                    </div>
                </PanelBlock>
                {makerTokenRender}
                {takerTokenRender}
                {errorMessageRender}
                {signedOrderRender}
                <PanelBlock>
                    <Button onClick={this.createOrderAsync} isFullWidth={true} isSize="small" isColor="primary">
                        Sign Order
                    </Button>
                </PanelBlock>
            </div>
        );
    }
    public orderTokenSelected = (symbol: string, traderSide: TraderSide) => {
        this.setState(prevState => {
            return traderSide === TraderSide.MAKER
                ? { ...prevState, makerTokenSymbol: symbol }
                : { ...prevState, takerTokenSymbol: symbol };
        });
    }
    public orderTokenAmountChanged = (amount: string, traderSide: TraderSide) => {
        this.setState(prevState => {
            return traderSide === TraderSide.MAKER
                ? { ...prevState, makerAmount: amount }
                : { ...prevState, takerAmount: amount };
        });
    }

    public orderTokenSelectedEvent(event:any,traderSide:TraderSide){
        this.orderTokenSelected(event.target.value,traderSide)
    }

    public orderTokenAmountChangedEvent(event:any,traderSide:TraderSide){
        this.orderTokenAmountChanged(event.target.value,traderSide)
    }

    public buildTokenSelector = (traderSide: TraderSide) => {
        const selected = traderSide === TraderSide.MAKER ? this.state.makerTokenSymbol : this.state.takerTokenSymbol;
        return (
            <Select onChange={this.orderTokenSelectedEvent.bind(this,traderSide)} value={selected}>
                {_.map(Object.keys(TOKENS), tokenSymbol => {
                    return (
                        <option key={`${tokenSymbol}-${traderSide}`} value={tokenSymbol}>
                            {tokenSymbol}
                        </option>
                    );
                })}
            </Select>
        );
    }
}