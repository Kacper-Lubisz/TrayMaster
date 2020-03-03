import React from "react";
import {AutoAdvanceModes, User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";
import {ControlledInputComponent, ControlledInputComponentProps} from "./ControlledInputComponent";
import {buildDefaultUnifiedKeyboard} from "./CustomKeyboardPage";

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
                inputType: "checkBox",
                get: () => this.props.user.onlySingleAutoAdvance,
                set: async (value: boolean) => {
                    this.props.user.onlySingleAutoAdvance = value;
                    await this.props.user.stage(true, true);
                },
                label: "Don't Advance in Multi-select"
            }, {
                inputType: "checkBox",
                get: () => this.props.user.showPreviousShelfButton,
                set: async (value: boolean) => {
                    this.props.user.showPreviousShelfButton = value;
                    await this.props.user.stage(true, true);
                },
                label: "Show Previous Shelf Button"
            }, {
                inputType: "checkBox",
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
                    {label: "Category > Expiry > Next Tray", key: ["category", "expiry"]},
                    {label: "Weight > Next Tray", key: ["weight"]},
                    {label: "Category > Expiry > Weight > Next Tray", key: ["category", "expiry", "weight"]}
                ],
                label: "Auto Advance",
            }, {
                inputType: "checkBox",
                get: () => this.props.user.unifiedKeyboard !== null,
                set: async (value: boolean) => {
                    this.props.repaintSettings();
                    this.props.user.unifiedKeyboard = value ? buildDefaultUnifiedKeyboard(this.props.warehouse)
                                                            : null;
                    await this.props.user.stage(true, true);
                },
                label: "Secret feature"
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

