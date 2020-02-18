import React from "react";
import {User} from "../core/Firebase/Authentication";


interface SettingsComponentProps {
    get: () => boolean;
    set: (value: boolean) => void;
    label: string;
    user: User;
}


export class SettingsComponent extends React.Component<SettingsComponentProps> {

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