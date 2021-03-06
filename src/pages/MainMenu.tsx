import {faExchangeAlt, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {withRouter} from "react-router";
import {RouteComponentProps} from "react-router-dom";
import {Dialog} from "../components/Dialog";
import {CustomButtonProps, Keyboard} from "../components/Keyboard";
import {TrayMasterLogo} from "../components/TrayMasterLogo";
import {User} from "../core/Firebase";
import {Warehouse} from "../core/WarehouseModel";
import {FindQuery, SortBy} from "./FindPage";
import "./styles/mainmenu.scss";

export interface MainMenuProps {
    openDialog: (dialog: Dialog) => void;

    changeWarehouse: (user: User) => void;
    signOut: () => void;

    warehouse: Warehouse;
    user: User;

    setFind: (query: FindQuery) => void;
}


/**
 * This class creates the main menu, redirecting to other screens
 * by changing state values when buttons are pressed
 */
class MainMenuPage extends React.Component<RouteComponentProps & MainMenuProps> {

    downloadManual(): void {
        const element = document.createElement("a");
        element.href = "/manual.pdf";
        element.download = "TrayMaster User Manual";
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    }

    render(): React.ReactNode {

        const menuButtons: CustomButtonProps[] = [
            {
                name: "Shelf View",
                onClick: () => this.props.history.push("/")
            },
            {
                name: "Find",
                onClick: () => {
                    this.props.setFind({
                        categories: null,
                        weight: null,
                        commentSubstring: null,
                        excludePickingArea: false,
                        sort: {orderAscending: true, type: SortBy.expiry}
                    });
                    this.props.history.push("/find");
                }
            },
            /*{
                name: "Report",
                onClick: () => alert("Report"),
                disabled: true
            },*/
            {
                name: "Settings",
                onClick: () => this.props.history.push("Settings")
            },
            {
                name: "User Manual",
                onClick: () => this.downloadManual()
            }
        ];

        return <div className="main-menu">
            <TrayMasterLogo/>

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