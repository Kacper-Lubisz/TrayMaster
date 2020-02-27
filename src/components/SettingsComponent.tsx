import React from "react";
import {User} from "../core/Firebase/Authentication";

import "./styles/_settingscomponent.scss";

type Option = {
    label: string;
    key: string;
};

type RadioButton = {
    type: "checkBox";
    label: string;
    user: User;
    get: () => boolean;
    set: (value: boolean) => void;
};

type DropDown = {
    type: "dropDown";
    label: string;
    user: User;
    options: Option[];
    get: () => string;
    set: (value: string) => void;
};

type SettingsComponentProps = RadioButton | DropDown;


export class SettingsComponent extends React.Component<SettingsComponentProps> {


    renderSetting(): React.ReactNode {
        if (this.props.type === "checkBox") {
            const propsAtRender = this.props;
            return <div
                className="setting-checkbox"
                key={this.props.label}
                onClick={((props: RadioButton) => {
                    props.set(!props.get());
                    this.forceUpdate();
                }).bind(this, this.props)}
            >

                <input
                    type="checkbox"
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
            const propsAtRender: DropDown = this.props;
            const key = this.props.get();
            const chosenOption = this.props.options.find(option => option.key === key)?.key;
            return <div className="setting-drop-down" key={this.props.label}>
                <label>
                    <p>{this.props.label}</p>
                    <select defaultValue={chosenOption}
                            onChange={(event) => {
                                this.setNewOption(event.target.value, propsAtRender);
                            }}>
                        {propsAtRender.options.map(option =>
                            <option
                                value={option.key}
                                key={option.key}
                            >
                                {option.label}
                            </option>
                        )}
                    </select>
                </label>
            </div>;
        }
    }

    setNewOption(newOption: Option["key"], propsAtRender: DropDown): void {
        propsAtRender.set(newOption);
    }

    render(): React.ReactNode {


        return (
            this.renderSetting()
        );
    }
}