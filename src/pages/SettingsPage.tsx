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
                openDialog={() => this.props.openDialog.bind(this)}
                categories={this.props.warehouse.categories}
                user={this.props.user}
                warehouse={this.props.warehouse}
                updatePage={() => this.forceUpdate()}
            />;
        } else if (this.state.currentTab === "wh-edit") {
            //return warehouse editor
        }
    }

    render(): React.ReactNode {

        return <div id="settings">
            <div id="settings-sidebar">
                <div id="settings-header">
                    <h1>Settings</h1>
                </div>

                <div id="settings-tabs">
                    <div>
                        <h2>User</h2>
                        <div className={classNames("tab", {
                            "tab-selected": this.state.currentTab === "personal"
                        })}
                             onClick={() => this.setState(state => ({...state, currentTab: "personal"}))}
                        >
                            Personal <br/> Settings
                        </div>
                    </div>
                    {this.props.user.isAdmin ?
                     <>
                         <div>
                             <h2>Warehouse</h2>
                             <div className={classNames("tab", {
                                 "tab-selected": this.state.currentTab === "cat-edit"
                             })}
                                  onClick={() => this.setState(state => ({...state, currentTab: "cat-edit"}))}
                             >
                                 Category <br/> Editor
                             </div>
                             <div className={classNames("tab", {
                                 "tab-selected": this.state.currentTab === "wh-edit"
                             })}
                                  onClick={() => this.setState(state => ({...state, currentTab: "wh-edit"}))}
                             >
                                 Warehouse <br/> Editor
                             </div>
                         </div>
                         <div>
                             <h2>Admin</h2>
                             <div className={classNames("tab", {
                                 "tab-selected": this.state.currentTab === "handle-users"
                             })}
                                  onClick={() => this.setState(state => ({...state, currentTab: "handle-users"}))}
                             >
                                 Handle Users
                             </div>
                         </div>
                     </>
                                             : undefined}
                </div>

                <div id="settings-btns">
                    <button onClick={() => this.props.history.goBack()}>
                        Back
                    </button>
                </div>

            </div>

            <div id="settings-content">
                {this.showCurrentSetting()}
            </div>
        </div>;
    }

}

export default withRouter(SettingsPage);