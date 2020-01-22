import React from "react";
import {RouteComponentProps} from "react-router-dom";
import {withRouter} from "react-router";
import "../styles/mainmenu.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";
import {Dialog} from "../core/App";
import {SearchQuery, SortBy} from "./SearchPage";

/**
 * expiryAmount is the number of items expiring soon
 * TODO needs to be fetched from db
 */
interface MainMenuProps {
    openDialog: (dialog: Dialog) => void;
    expiryAmount: number;

    setSearch: (query: SearchQuery) => void;
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
                    <h1>Shelfmaster</h1>
                </div>
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
                </div>}
                <div className="menu-btn-container">
                    <button className="key-btn" onClick={() => this.props.history.push("/")}>
                        <p>Back to Shelf View</p></button>
                    <button className="key-btn"
                            onClick={() => this.props.history.push("/search")}><p>Search</p>
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