import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {CategoryEditor} from "../components/CategoryEditor";
import {Dialog} from "../core/Dialog";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";

import "../styles/settings.scss";

interface SettingsProps {
    openDialog: (dialog: Dialog) => void;
    warehouse: Warehouse;
    user: User;
}

/**
 * RouteComponentProps enables the history.push to change paths
 * TODO change paths when those screens are added
 */
class SettingsPage extends React.Component<RouteComponentProps & SettingsProps, any> {

    render(): React.ReactNode {

        const settings: {
            get: () => boolean;
            set: (value: boolean) => void;
            label: string;
        }[] = [
            {
                get: () => this.props.user.enableAutoAdvance,
                set: (value: boolean) => this.props.user.enableAutoAdvance = value,
                label: "Enable Auto Advance"
            }, {
                get: () => this.props.user.onlySingleAutoAdvance,
                set: (value: boolean) => this.props.user.onlySingleAutoAdvance = value,
                label: "Don't Advance in Multi-select"
            }, {
                get: () => this.props.user.showPreviousShelfButton,
                set: (value: boolean) => this.props.user.showPreviousShelfButton = value,
                label: "Show Previous Shelf Button"
            }
        ];

        return (
            <div className="settings">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>
                <div>
                    <CategoryEditor
                        categories={this.props.warehouse.categories}
                        user={this.props.user}
                    />
                </div>
                <div className="settings-btns">
                    <button className="key-btn" onClick={() => this.props.history.goBack()}>
                        <FontAwesomeIcon className="back-btn" icon={faArrowLeft}/>
                        <p>Back</p>
                    </button>
                </div>
                <div className="settings-content">
                    <h1>User Settings</h1>
                    {settings.map(setting =>
                        <div className="settings-setting" key={setting.label}
                             onClick={() => {
                                 setting.set(!setting.get());
                                 this.forceUpdate();
                             }}>
                            <input
                                type="checkbox"
                                checked={setting.get()}
                                onChange={async e => {
                                    setting.set(e.target.checked);
                                    await this.props.user.stage(true, true);
                                    this.forceUpdate();
                                }}
                            />
                            <p>{setting.label}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

}

export default withRouter(SettingsPage);