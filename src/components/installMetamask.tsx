import * as React from 'react';


export class InstallMetamask extends React.Component<{}> {
    public render() {
        return (
            <div>
                <h1> Please install Metamask </h1>
                <a
                    href="https://metamask.io/"
                    target="_blank"
                    title="Metamask is required to use the 0x Sandbox. Click to download."
                >
                    <img
                        src="https://github.com/MetaMask/faq/raw/master/images/download-metamask-dark.png"
                        width="200px"
                        alt="Download Metamask"
                    />
                </a>
                <p> Refresh this page once MetaMask is installed </p>
            </div>
        );
    }
}