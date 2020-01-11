import React from "react";
import {RouteComponentProps} from "react-router-dom";
import {withRouter} from "react-router";
import "../styles/mainmenu.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faExchangeAlt,
    faExclamationTriangle as warningIcon,
    faSignInAlt,
    faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import {Dialog} from "../core/App";
import {Warehouse} from "../core/WarehouseModel";
import {User} from "../core/WarehouseModel/Firebase";

/**
 * expiryAmount is the number of items expiring soon
 * TODO needs to be fetched from db
 */
interface MainMenuProps {
    openDialog: (dialog: Dialog) => void;

    changeWarehouse: () => void;
    showSignIn: () => void;
    signOut: () => void;

    warehouse: Warehouse | undefined;
    user?: User;
    expiryAmount: number;
}


/**
 * This class creates the main menu, redirecting to other screens
 * by changing state values when buttons are pressed
 * TODO change which path it pushes to when those are added
 * Only shows the alert when an item is withing chosen expiry range
 */
class MainMenuPage extends React.Component<RouteComponentProps & MainMenuProps> {

    render(): React.ReactNode {

        return (
            <div className="main-menu">
                <div className="menu-header">
                    <h1>Shelfmaster</h1>
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
                    {this.props.warehouse ? <button className="key-btn" onClick={() => this.props.history.push("/")}>
                        <p>Back to Shelf View</p></button> : undefined}
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

                <div id="menu-warehouse-user-area">
                    <div>
                        <h1>{this.props.user?.name ?? "Not Signed in"}</h1>
                        <button onClick={this.props.user === undefined ? this.props.showSignIn :
                                         this.props.signOut}>
                            <FontAwesomeIcon icon={this.props.user === undefined ? faSignInAlt : faSignOutAlt}/>
                        </button>
                    </div>
                    {this.props.user === undefined ? undefined : <div>
                        <h1>{this.props.warehouse?.name ?? "No Warehouse Open"}</h1>
                        <button onClick={this.props.changeWarehouse}>
                            <FontAwesomeIcon icon={faExchangeAlt}/>
                        </button>
                    </div>}
                </div>

            </div>
        );
    }
}

export default withRouter(MainMenuPage);