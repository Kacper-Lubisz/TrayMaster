import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {CategoryEditor} from "../components/CategoryEditor";
import {CustomKeyboardEditor} from "../components/CustomKeyboardPage";
import {Dialog} from "../components/Dialog";
import {LayoutEditor} from "../components/LayoutEditor";
import {UserSettings} from "../components/UserSettings";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";

import "./styles/settings.scss";

interface SettingsPageProps {
    openDialog: (dialog: Dialog) => void;
    warehouse: Warehouse;
    user: User;
}

export type SettingsTab =
    "personal"
    | "layout-edit"
    | "cat-edit"
    | "handle-users"
    | "keyboard-editor"
    | "handle-warehouses";

interface SettingsPageState {
    currentTab: SettingsTab;
    tabChangeLock: (tab: SettingsTab) => boolean;
}

/**
 * RouteComponentProps enables the history.push to change paths
 * TODO change paths when those screens are added
 */
class SettingsPage extends React.Component<RouteComponentProps & SettingsPageProps, SettingsPageState> {

    constructor(props: any) {
        super(props);

        this.state = {
            currentTab: "personal",
            tabChangeLock: () => false
        };
    }


    renderTab(): React.ReactNode {

        if (this.state.currentTab === "personal") {
            return <UserSettings
                user={this.props.user}
                warehouse={this.props.warehouse}
                repaintSettings={this.forceUpdate.bind(this)}
            />;
        } else if (this.state.currentTab === "cat-edit") {
            return <CategoryEditor

                setLock={this.setLock.bind(this)}

                openDialog={this.props.openDialog}
                categories={this.props.warehouse.categories}
                user={this.props.user}

                addCategory={this.props.warehouse.addCategory.bind(this.props.warehouse)}
                removeCategory={this.props.warehouse.removeCategory.bind(this.props.warehouse)}
                editCategory={this.props.warehouse.editCategory.bind(this.props.warehouse)}
                getCategoryID={this.props.warehouse.getCategoryID.bind(this.props.warehouse)}
                stage={this.props.warehouse.stage.bind(this.props.warehouse)}

                repaintSettings={this.forceUpdate.bind(this)}
            />;
        } else if (this.state.currentTab === "layout-edit") {
            return <LayoutEditor
                setLock={this.setLock.bind(this)}

                openDialog={this.props.openDialog}
                user={this.props.user}
                warehouse={this.props.warehouse}

                updatePage={() => this.forceUpdate()}
            />;

        } else if (this.state.currentTab === "handle-warehouses") {
            return <div>Make new warehouses here </div>;
        } else if (this.state.currentTab === "keyboard-editor") {
            return <CustomKeyboardEditor user={this.props.user} warehouse={this.props.warehouse}/>;
        } else { // "handle-users"
            return <div>Unimplemented Tab</div>;
        }

    }

    private setLock(lockFunction: (tab: SettingsTab) => boolean): void {
        this.setState(state => ({
            ...state,
            tabChangeLock: lockFunction
        }));
    }

    /**
     * Changes the tab if the tab lock state function returns false
     * @param tab
     */
    private changeTab(tab: SettingsTab): void {
        if (
            this.state.currentTab !== tab &&
            this.state.tabChangeLock !== undefined &&
            !this.state.tabChangeLock(tab)
        ) {
            this.setState(state => ({...state, currentTab: tab}));
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
                        <div
                            className={classNames("tab", {
                                "tab-selected": this.state.currentTab === "personal"
                            })}
                            onClick={this.changeTab.bind(this, "personal")}
                        >
                            Personal Settings
                        </div>
                        {/*{this.props.user.customKeyboard ? <div*/}
                        {/*    className={classNames("tab", {*/}
                        {/*        "tab-selected": this.state.currentTab === "keyboard-editor"*/}
                        {/*    })}*/}
                        {/*    onClick={this.changeTab.bind(this, "keyboard-editor")}*/}
                        {/*>*/}
                        {/*    Custom Keyboard*/}
                        {/*</div> : null}*/}
                    </div>
                    {this.props.user.isAdmin ? <>
                        <div>
                            <h2>Warehouse</h2>
                            <div
                                className={classNames("tab", {
                                    "tab-selected": this.state.currentTab === "cat-edit"
                                })}
                                onClick={this.changeTab.bind(this, "cat-edit")}
                            >
                                Category Editor
                            </div>
                            <div
                                className={classNames("tab", {
                                    "tab-selected": this.state.currentTab === "layout-edit"
                                })}
                                onClick={this.changeTab.bind(this, "layout-edit")}
                            >
                                Layout Editor
                            </div>
                        </div>
                        {/*<div>
                            <h2>Admin</h2>
                            <div
                                className={classNames("tab", {
                                    "tab-selected": this.state.currentTab === "handle-users"
                                })}
                                onClick={this.changeTab.bind(this, "handle-users")}
                            >
                                Users
                            </div>
                            <div
                                className={classNames("tab", {
                                    "tab-selected": this.state.currentTab === "handle-warehouses"
                                })}
                                onClick={this.changeTab.bind(this, "handle-warehouses")}
                            >
                                Warehouses
                            </div>
                        </div>*/}
                    </> : undefined}
                </div>

                <div id="settings-btns">
                    <button onClick={() => this.props.history.goBack()}>
                        <FontAwesomeIcon className="back-btn" icon={faArrowLeft}/>
                    </button>
                </div>

            </div>

            <div id="settings-content">
                {this.renderTab()}
            </div>
        </div>;
    }

}

export default withRouter(SettingsPage);