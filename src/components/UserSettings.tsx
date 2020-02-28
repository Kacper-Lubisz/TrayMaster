import React from "react";
import {AutoAdvanceModes, User} from "../core/Firebase/Authentication";
import {Setting, SettingsComponent} from "./SettingsComponent";

import "./styles/_usersettings.scss";


interface UserSettingsProps {
    user: User;
}

export class UserSettings extends React.Component<UserSettingsProps, any> {


    render(): React.ReactNode {

        const settingsList: Setting[] = [
            {
                type: "checkBox",
                get: () => this.props.user.onlySingleAutoAdvance,
                set: (value: boolean) => this.props.user.onlySingleAutoAdvance = value,
                label: "Don't Advance in Multi-select"
            }, {
                type: "checkBox",
                get: () => this.props.user.showPreviousShelfButton,
                set: (value: boolean) => this.props.user.showPreviousShelfButton = value,
                label: "Show Previous Shelf Button"
            }, {
                type: "checkBox",
                get: () => this.props.user.clearAboveSelection,
                set: (value: boolean) => this.props.user.clearAboveSelection = value,
                label: "Clear all trays above when clearing"
            }, {
                type: "dropDown",
                get: () => this.props.user.autoAdvanceMode,
                set: (value: AutoAdvanceModes) => this.props.user.autoAdvanceMode = value,
                options: [
                    {label: "Off", key: null},
                    {label: "Category > Expiry > Next Tray", key: ["category", "expiry"]},
                    {label: "Weight > Next Tray", key: ["weight"]},
                    {label: "Category > Expiry > Weight > Next Tray", key: ["category", "expiry", "weight"]}
                ],
                label: "Auto Advance",
            },
        ];
        return <div id="user-settings">
            <h3>Personal Settings</h3>
            <h4>Shelf View</h4>
            <table>
                <tbody>
                {settingsList.map((setting, index) =>
                    <SettingsComponent
                        key={index}
                        user={this.props.user}
                        {...setting}
                    />
                )}
                </tbody>
            </table>
        </div>;
    }

}

