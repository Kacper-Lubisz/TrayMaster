import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {CategoryEditor} from "../components/CategoryEditor";
import {UserSettings} from "../components/UserSettings";
import {Dialog} from "../core/Dialog";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";

import "../styles/settings.scss";

interface SettingsProps {
    openDialog: (dialog: Dialog) => void;
    warehouse: Warehouse;
    user: User;
}

interface SettingsState {
    currentTab: Tab;
}

type Tab = "personal" | "wh-edit" | "cat-edit" | "handle-users";


/**
 * RouteComponentProps enables the history.push to change paths
 * TODO change paths when those screens are added
 */
class SettingsPage extends React.Component<RouteComponentProps & SettingsProps, SettingsState> {

    constructor(props: any) {
        super(props);

        this.state = {
            currentTab: "personal"
        };
    }


    showCurrentSetting(): React.ReactNode {

        if (this.state.currentTab === "personal") {
            return <UserSettings
                user={this.props.user}
            />;
        } else if (this.state.currentTab === "cat-edit") {
            return <CategoryEditor
                categories={this.props.warehouse.categories}
                user={this.props.user}
            />;
        } else if (this.state.currentTab === "wh-edit") {
            //return warehouse editor
        }
    }

    render(): React.ReactNode {

        return (
            <div className="settings">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>
                <div className="settings-tabs">
                    <p>User</p>
                    <div className={classNames("tab", {
                        "tab-selected": this.state.currentTab === "personal"
                    })}
                         onClick={() => this.setState(state => ({...state, currentTab: "personal"}))}
                    >
                        Personal Settings
                    </div>
                    {this.props.user.isAdmin ?
                     <div>
                         <p>Warehouse</p>
                         <div className={classNames("tab", {
                             "tab-selected": this.state.currentTab === "cat-edit"
                         })}
                              onClick={() => this.setState(state => ({...state, currentTab: "cat-edit"}))}
                         >
                             Category Editor
                         </div>
                         <div className={classNames("tab", {
                             "tab-selected": this.state.currentTab === "wh-edit"
                         })}
                              onClick={() => this.setState(state => ({...state, currentTab: "wh-edit"}))}
                         >
                             Warehouse Editor
                         </div>
                         <p>Admin</p>
                         <div className={classNames("tab", {
                             "tab-selected": this.state.currentTab === "handle-users"
                         })}
                              onClick={() => this.setState(state => ({...state, currentTab: "handle-users"}))}
                         >
                             Handle Users
                         </div>
                     </div>
                                             : undefined}
                </div>

                <div className="settings-content">
                    {this.showCurrentSetting()}
                </div>

                <div className="settings-btns">
                    <button onClick={() => this.props.history.goBack()}>
                        <FontAwesomeIcon className="back-btn" icon={faArrowLeft}/>
                        <p>Back</p>
                    </button>
                </div>
            </div>
        );
    }

}

export default withRouter(SettingsPage);