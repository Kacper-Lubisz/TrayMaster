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
            }, {
                get: () => this.props.user.clearAboveSelection,
                set: (value: boolean) => this.props.user.clearAboveSelection = value,
                label: "Clear all trays above when clearing"
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