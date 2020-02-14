import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {Dialog} from "../core/Dialog";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";
import "../styles/settings.scss";

interface SettingsProps {
    openDialog: (dialog: Dialog) => void;
    warehouse: Warehouse | undefined;
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
            {//todo fixme add a drop down for this, or something that makes more sense.
                get: () => this.props.user.autoAdvanceMode === "off",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "off",
                label: "Enable Auto Advance off"
            },
            {
                get: () => this.props.user.autoAdvanceMode === "ce",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "ce",
                label: "Enable Auto Advance ce"
            }, {
                get: () => this.props.user.autoAdvanceMode === "w",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "w",
                label: "Enable Auto Advance w"
            },
            {
                get: () => this.props.user.autoAdvanceMode === "cew",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "cew",
                label: "Enable Auto Advance cew"
            },
            {
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
                <div className="settings-btns">
                    <button onClick={() => this.props.history.goBack()}>
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