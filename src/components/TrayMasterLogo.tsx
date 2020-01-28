import React from "react";
import logoSkew from "../Logo_skew.svg";
import "./styles/_tmlogo.scss";

interface TrayMasterLogoProps {
    message?: JSX.Element;
}

export class TrayMasterLogo extends React.Component<TrayMasterLogoProps> {
    render(): React.ReactNode {
        return <div id="tm-logo">
            <img alt="TrayMaster Logo" src={logoSkew}/>
            {this.props.message ? <h2>{this.props.message}</h2> : ""}
        </div>;
    }
}