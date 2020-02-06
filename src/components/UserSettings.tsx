import React from "react";
import {User} from "../core/Firebase/Authentication";

import "../styles/settings.scss";


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
        return settings.map(setting =>
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
        );
    }

}