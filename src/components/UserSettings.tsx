import React from "react";
import {User} from "../core/Firebase/Authentication";
import {SettingsComponent} from "./SettingsComponent"

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

