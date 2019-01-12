import * as React from 'react';
import '../css/navbar.css'


export class Navbar extends React.Component<{}> {
    public render() {
        return (
            <nav className="navbar navbar-light navbar-expand-lg fixed-top bg-white clean-navbar">
        <div className="container"><a className="navbar-brand logo" href="#">0x Relayer</a><button className="navbar-toggler" data-toggle="collapse" data-target="#navcol-1">
        <span className="sr-only">Toggle navigation</span><span className="navbar-toggler-icon"></span></button>
            <div className="collapse navbar-collapse"
                id="navcol-1"></div>
        </div>
    </nav>
        );
    }
}