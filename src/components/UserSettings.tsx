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
            {//todo fixme add a drop down for this, or something that makes more sense.
                get: () => this.props.user.autoAdvanceMode === "off",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "off",
                label: "Auto Advance Off"
            },
            {
                get: () => this.props.user.autoAdvanceMode === "ce",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "ce",
                label: "Auto Advance On: Category > Expiry > Loop"
            }, {
                get: () => this.props.user.autoAdvanceMode === "w",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "w",
                label: "Auto Advance On: Weight > Loop"
            },
            {
                get: () => this.props.user.autoAdvanceMode === "cew",
                set: (_: boolean) => this.props.user.autoAdvanceMode = "cew",
                label: "Auto Advance On: Category > Expiry > Weight > Loop"
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
            <div id="user-settings">
                {
                    settings.map(setting =>
                        <label key={setting.label} onClick={() => {
                            setting.set(!setting.get());
                            this.forceUpdate();
                        }}>
                            <input
                                type="checkbox"
                                name={setting.label}
                                checked={setting.get()}
                                onChange={async e => {
                                    setting.set(e.target.checked);
                                    await this.props.user.stage(true, true);
                                    this.forceUpdate();
                                }}
                            />
                            {setting.label}
                        </label>
                    )}
            </div>
        );
    }

}