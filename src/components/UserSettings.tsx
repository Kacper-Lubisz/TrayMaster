import React from "react";
import {AutoAdvanceModes, User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";
import {ControlledInputComponent, ControlledInputComponentProps} from "./ControlledInputComponent";


import "./styles/_usersettings.scss";


interface UserSettingsProps {
    user: User;
    warehouse: Warehouse;
    repaintSettings: () => void;
}

export class UserSettings extends React.Component<UserSettingsProps, any> {

    render(): React.ReactNode {

        const settingsList: ControlledInputComponentProps[] = [
            {
                inputType: "boolean",
                get: () => this.props.user.showPreviousShelfButton,
                set: async (value: boolean) => {
                    this.props.user.showPreviousShelfButton = value;
                    await this.props.user.stage(true, true);
                },
                label: "Show Previous Shelf button"
            }, {
                inputType: "boolean",
                get: () => this.props.user.clearAboveSelection,
                set: async (value: boolean) => {
                    this.props.user.clearAboveSelection = value;
                    await this.props.user.stage(true, true);
                },
                label: "Clear all trays above when clearing"
            }, {
                inputType: "dropDown",
                get: () => this.props.user.autoAdvanceMode,
                set: async (value: AutoAdvanceModes) => {
                    this.props.user.autoAdvanceMode = value;
                    await this.props.user.stage(true, true);
                },
                options: [
                    {label: "Off", key: null},
                    {label: "Category > Expiry > Next Tray", key: {category: true, expiry: true, weight: false}},
                    {label: "Weight > Next Tray", key: {category: false, expiry: false, weight: true}},
                    {label: "Category > Expiry > Weight > Next Tray", key: {category: true, expiry: true, weight: true}}
                ],
                label: "Auto-advance mode",
            }, {
                // Be careful here, the setting name is inverted from the variable!
                inputType: "boolean",
                get: () => !this.props.user.onlySingleAutoAdvance,
                set: async (value: boolean) => {
                    this.props.user.onlySingleAutoAdvance = !value;
                    await this.props.user.stage(true, true);
                },
                label: "Auto-advance with multiple trays selected"
            }, {
                inputType: "boolean",
                get: () => this.props.user.useCustomKeyboard,
                set: async (value: boolean) => {
                    this.props.repaintSettings();
                    this.props.user.useCustomKeyboard = value;
                    await this.props.user.stage(true, true);
                },
                label: "Use unified keyboard (beta)"
            }
        ];
        return <div id="user-settings">
            <h3>Personal Settings</h3>
            <h4>Shelf View</h4>
            <table>
                <tbody>
                {settingsList.map((setting, index) =>
                    <ControlledInputComponent key={index} {...setting} />
                )}
                </tbody>
            </table>
        </div>;
    }

}

