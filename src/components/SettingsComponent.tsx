import React from "react";
import {User} from "../core/Firebase/Authentication";

type Options = {
    label: string;
    key: string;
};

type RadioButton = {
    type: "radioButton";
    label: string;
    user: User;
    get: () => boolean;
    set: (value: boolean) => void;
};

type DropDown = {
    type: "dropDown";
    label: string;
    user: User;
    options: Options[];
    get: () => string;
    set: (value: string) => void;
}
type SettingsComponentProps = RadioButton | DropDown;


export class SettingsComponent extends React.Component<SettingsComponentProps> {


    renderSetting(): React.ReactNode {
        if (this.props.type === "radioButton") {
            const propsAtRender = this.props;
            return <div
                className="settings-setting"
                key={this.props.label}
                onClick={((props: RadioButton) => {
                    props.set(!props.get());
                    this.forceUpdate();
                }).bind(this, this.props)}
            >

                <input
                    type="radio"
                    checked={propsAtRender.get()}
                    onChange={async e => {
                        propsAtRender.set(e.target.checked);
                        await propsAtRender.user.stage(true, true);
                        this.forceUpdate();
                    }}
                />
                <p>{this.props.label}</p>
            </div>;
        } else {
            const propsAtRender = this.props;
            const key = this.props.get;
            //const defaultOption = this.props.options.find(option => option.key === key);
            return <div className="settings-setting" key={this.props.label}>
                <label>
                    <p>{this.props.label}</p>
                    <select value={propsAtRender.options[1].label}>
                        {this.props.options.map(option =>
                            <option
                                key={option.label}
                                onClick={() => {
                                    propsAtRender.set(option.key);
                                    this.forceUpdate();
                                }}
                            >
                                {option.label}
                            </option>
                        )}
                    </select>
                </label>
            </div>;
        }
    }

    render(): React.ReactNode {


        return (
            this.renderSetting()
        );
    }
}