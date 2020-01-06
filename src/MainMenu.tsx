import React from "react";
import {RouteComponentProps} from "react-router-dom";
import {withRouter} from "react-router";
import "./styles/mainmenu.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";
import {StandardDialog} from "./App";
import logoSkew from "./Logo_skew.svg";

/**
 * expiryAmount is the number of items expiring soon
 * TODO needs to be fetched from db
 */
interface MainMenuProps {
    openDialog: (dialog: ((close: () => void) => StandardDialog)) => void;
    expiryAmount: number;
}


/**
 * This class creates the main menu, redirecting to other screens
 * by changing state values when buttons are pressed
 * TODO change which path it pushes to when those are added
 * Only shows the alert when an item is withing chosen expiry range
 */
class MainMenu extends React.Component<RouteComponentProps & MainMenuProps> {

    render(): React.ReactNode {
        return (
            <div className="main-menu">
                <div className="menu-header">
                    <img alt="TrayMaster logo" src={logoSkew}/>
                </div>
                {this.props.expiryAmount === 0 ? undefined : <div className="alert">
                    <div className="alert-header">
                        <FontAwesomeIcon icon={warningIcon} className="alert-warning"/>
                        <h2>Expiry Imminent</h2>
                    </div>
                    <p>There are {this.props.expiryAmount} items expiring soon! Click here to see them.</p>
                </div>
                }

                <div className="menu-btn-container">
                    <button className="key-btn" onClick={() => this.props.history.push("/")}>
                        <p>Back to Shelf View</p></button>
                    <button className="key-btn"
                            onClick={() => alert("Search")}><p>Search</p>
                    </button>
                    <button className="key-btn"
                            onClick={() => alert("Report")}><p>Report</p>
                    </button>
                    <button className="key-btn"
                            onClick={() => this.props.history.push("/settings")}><p>Settings</p>
                    </button>

                </div>

            </div>
        );
    }
}

export default withRouter(MainMenu);