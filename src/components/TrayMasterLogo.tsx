import React from "react";
import logoSkew from "../img/Logo_skew.png";
import "./styles/_tmlogo.scss";

interface TrayMasterLogoProps {
    message?: JSX.Element;
}

export class TrayMasterLogo extends React.Component<TrayMasterLogoProps> {
    render(): React.ReactNode {
        return <div id="tm-logo">
            <img alt="TrayMaster Logo" src={logoSkew}/>
            <h2>{this.props.message ? this.props.message : `v${process.env.REACT_APP_VERSION}`}</h2>
        </div>;
    }
}