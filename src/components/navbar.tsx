import * as React from 'react';
import '../css/navbar.css'


export class Navbar extends React.Component<{}> {
    public render() {
        return (
            <nav className="navbar navbar-light navbar-expand-lg bg-white clean-navbar">
        <div className="container"><a className="navbar-brand logo" href="#">0x Relayer</a>
            <div className="collapse navbar-collapse"
                id="navcol-1"></div>
        </div>
    </nav>
        );
    }
}