import React from "react";
import {User} from "../core/Firebase/Authentication";

import "./styles/_usersettings.scss";


interface UserSettingsProps {
    user: User;
}

export class UserSettings extends React.Component<UserSettingsProps, any> {


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
            <div id="user-settings">
                {settings.map(setting =>
                    <SettingsComponent get={setting.get} set={setting.set} label={setting.label}
                                       user={this.props.user}/>
                )}
            </div>
        );
    }

}


interface SettingsComponentProps {
    get: () => boolean;
    set: (value: boolean) => void;
    label: string;
    user: User;
}

class SettingsComponent extends React.Component<SettingsComponentProps> {

    render(): React.ReactNode {

        return (
            <div className="settings-setting" key={this.props.label}
                 onClick={() => {
                     this.props.set(!this.props.get());
                     this.forceUpdate();
                 }}>
                <input
                    type="checkbox"
                    checked={this.props.get()}
                    onChange={async e => {
                        this.props.set(e.target.checked);
                        await this.props.user.stage(true, true);
                        this.forceUpdate();
                    }}
                />
                <p>{this.props.label}</p>
            </div>
        );
    }
}