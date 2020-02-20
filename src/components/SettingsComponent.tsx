import React from "react";
import {User} from "../core/Firebase/Authentication";

type Options = {
    label: string;
    key: string;
};

type SettingsComponentProps =
    | {
    type: "radioButton";
    label: string;
    user: User;
    get: () => boolean;
    set: (value: boolean) => void;
}
    | {
    type: "dropDown";
    label: string;
    user: User;
    options: Options[];
    get: () => string;
    set: (value: string) => void;
};


export class SettingsComponent extends React.Component<SettingsComponentProps> {


    renderSetting(): React.ReactNode {
        if (this.props.type === "radioButton") {
            return <div className="settings-setting" key={this.props.label}
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
            </div>;
        } else {
            //const defaultOption = this.props.options.filter(option => option.key.includes(this.props.get));
            return <div className="settings-setting" key={this.props.label}>
                <label>
                    <p>{this.props.label}</p>
                    <select onChange={event => this.handleChange(event.target.value)}>
                        {this.props.options.map(option =>
                            <option value={option.key}>{option.label}</option>
                        )}
                    </select>
                </label>
            </div>;
        }
    }

    handleChange(newOption: string): void {
        this.props.set(newOption);
    }

    render(): React.ReactNode {


        return (
            this.renderSetting()
        );
    }
}