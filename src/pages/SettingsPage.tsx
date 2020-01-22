import React from "react";
import "../styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";
import {Dialog} from "../core/Dialog";
import {User} from "../core/Firebase/Authentication";

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
        return (
            <div className="settings">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>
                <div className="settings-btns">
                    <button className="key-btn" onClick={() => alert("Alerts")}>
                        <p>Alerts</p></button>
                    <button className="key-btn"
                            onClick={() => alert("Type Labels")}><p>Type Labels</p>
                    </button>
                    <button className="key-btn"
                            onClick={() => alert("Time Labels")}><p>Time Labels</p>
                    </button>
                    <button className="key-btn"
                            onClick={() => alert("General")}><p>General</p>
                    </button>
                    <hr className="line"/>
                    <button className="key-btn" onClick={() => this.props.history.goBack()}>
                        <FontAwesomeIcon className="back-btn" icon={faArrowLeft}/>
                        <p>Back</p>
                    </button>
                </div>
                <div className="settings-content">
                    <h1>User Settings</h1>
                    <div className="settings-setting">
                        <input
                            type="checkbox"
                            checked={this.props.user.willAutoAdvance}
                            onChange={async e => {
                                this.props.user.willAutoAdvance = e.target.checked;
                                await this.props.user.stage(true, true);
                                this.forceUpdate();
                            }}
                        />
                        <p>Will Auto Advance</p>
                    </div>
                </div>
            </div>
        );
    }

}

export default withRouter(SettingsPage);