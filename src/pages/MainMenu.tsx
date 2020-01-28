import {faExchangeAlt, faExclamationTriangle as warningIcon, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {withRouter} from "react-router";
import {RouteComponentProps} from "react-router-dom";
import {Keyboard, KeyboardButtonProps} from "../components/Keyboard";
import {TrayMasterLogo} from "../components/TrayMasterLogo";
import {Dialog} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Warehouse} from "../core/WarehouseModel";
import "../styles/mainmenu.scss";
import {SearchQuery, SortBy} from "./SearchPage";

/**
 * expiryAmount is the number of items expiring soon
 * TODO needs to be fetched from db
 */
interface MainMenuProps {
    openDialog: (dialog: Dialog) => void;

    changeWarehouse: (user: User) => void;
    signOut: () => void;

    warehouse: Warehouse;
    user: User;
    expiryAmount: number;

    setSearch: (query: SearchQuery) => void;
}


/**
 * This class creates the main menu, redirecting to other screens
 * by changing state values when buttons are pressed
 * TODO change which path it pushes to when those are added
 * Only shows the alert when an item is withing chosen expiry range
 */
class MainMenuPage extends React.Component<RouteComponentProps & MainMenuProps> {

    render(): React.ReactNode {

        const menuButtons: KeyboardButtonProps[] = [
            {
                name: "Shelf View",
                onClick: () => this.props.history.push("/")
            },
            {
                name: "Search",
                onClick: () => {
                    this.props.setSearch({
                        categories: null,
                        weight: null,
                        commentSubstring: null,
                        excludePickingArea: true,
                        sort: {orderAscending: true, type: SortBy.expiry}
                    });
                    this.props.history.push("/search");
                }
            },
            {
                name: "Report",
                onClick: () => alert("Report"),
                disabled: true
            },
            {
                name: "Settings",
                onClick: () => this.props.history.push("Settings")
            }
        ];

        return <div className="main-menu">
            <TrayMasterLogo/>
            {/*todo fixme the expiry amount ought to be derived from warehouse*/}
            {this.props.expiryAmount === 0 ? undefined : <div
                className="alert"
                onClick={(_) => {
                    this.props.setSearch({
                        categories: null,
                        weight: null,
                        commentSubstring: null,
                        excludePickingArea: true,
                        sort: {orderAscending: true, type: SortBy.expiry}
                    });
                    this.props.history.push("/search");
                }}>
                <div className="alert-header">
                    <FontAwesomeIcon icon={warningIcon} className="alert-warning"/>
                    <h2>Expiry Imminent</h2>
                </div>
                <p>There are {this.props.expiryAmount} items expiring soon! Click here to see them.</p>
            </div>
            }

            <Keyboard id="menu-nav-kb" buttons={menuButtons} gridX={1}/>

            <div id="menu-warehouse-user-area">
                <div>
                    <h1>{this.props.user.name}</h1>
                    <button onClick={this.props.signOut}>
                        <FontAwesomeIcon icon={faSignOutAlt}/>
                    </button>
                </div>
                <div>
                    <h1>{this.props.warehouse.name}</h1>
                    <button onClick={this.props.changeWarehouse.bind(undefined, this.props.user)}>
                        <FontAwesomeIcon icon={faExchangeAlt}/>
                    </button>
                </div>
            </div>

        </div>;

    }
}

export default withRouter(MainMenuPage);