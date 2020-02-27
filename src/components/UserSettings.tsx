import React from "react";
import {User} from "../core/Firebase/Authentication";
import {SettingsComponent} from "./SettingsComponent";

import "./styles/_usersettings.scss";


interface UserSettingsProps {
    user: User;
}

export class UserSettings extends React.Component<UserSettingsProps, any> {


    render(): React.ReactNode {
        const settingsRadioButtons: {
            get: () => boolean;
            set: (value: boolean) => void;
            label: string;
        }[] = [
            {//todo fixme add a drop down for this, or something that makes more sense.
                get: () => this.props.user.onlySingleAutoAdvance,
                set: (value: boolean) => this.props.user.onlySingleAutoAdvance = value,
                label: "Don't Advance in Multi-select"
            }, {
                get: () => this.props.user.showPreviousShelfButton,
                set: (value: boolean) => this.props.user.showPreviousShelfButton = value,
                label: "Show Previous Shelf Button"
            }, {
                get: () => this.props.user.clearAboveSelection,
                set: (value: boolean) => this.props.user.clearAboveSelection = value,
                label: "Clear all trays above when clearing"
            }
        ];
        const optionsAutoAdvance = [
            {
                label: "Auto Advance Off",
                key: "off"
            }, {
                label: "Auto Advance On: Category > Expiry > Loop",
                key: "ce"
            }, {
                label: "Auto Advance On: Weight > Loop",
                key: "w"
            }, {
                label: "Auto Advance On: Category > Expiry > Weight > Loop",
                key: "cew"
            }
        ];

        return (
            <div id="user-settings">
                {settingsRadioButtons.map(setting =>
                    <SettingsComponent type="checkBox" key={setting.label} get={setting.get} set={setting.set}
                                       label={setting.label}
                                       user={this.props.user}/>
                )}
                <SettingsComponent
                    type="dropDown"
                    label="Auto Advance"
                    user={this.props.user}
                    options={optionsAutoAdvance}
                    get={() => this.props.user.autoAdvanceMode}
                    set={(value: string) => {
                        if (value === "ce" || value === "w" || value === "cew" || value === "off") {
                            this.props.user.autoAdvanceMode = value;
                        }
                    }}/>
            </div>
        );
    }

}

