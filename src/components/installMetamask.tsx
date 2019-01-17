import * as React from 'react';


export class InstallMetamask extends React.Component<{}> {
    public render() {

        const div1= {
            minHeight:'100vh',
        }

        const div2= {
            margin:'auto auto',
            padding:'auto auto',
        }


        

        return (
            <div className='row' style={div1}>
                <div className="center" style = {div2}>
                    <h1> Please install Metamask or Enable it on your browser </h1>
                    <a style={{ textAlign: "center"}}
                        href="https://metamask.io/"
                        target="_blank"
                        title="Metamask is required to use the application. Click to download."
                    >
                    <div className="">
                        <img 
                            src="https://github.com/MetaMask/faq/raw/master/images/download-metamask-dark.png"
                            width="200px"
                            alt="Download Metamask"
                        />
                        </div>
                    </a>
                <p style={{ textAlign: "center"}}> Refresh this page once MetaMask is installed </p>
                </div>
            </div>
        );
    }
}

