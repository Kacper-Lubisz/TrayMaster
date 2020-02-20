import React from "react";
import {render} from "react-dom";
import {User} from "../core/Firebase/Authentication";

type Option = {
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
    options: Option[];
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
            const key = this.props.get();
            console.log(key);
            const chosenOption = this.props.options.find(option => option.key === key)?.key;
            return <div className="settings-setting" key={this.props.label}>
                <label>
                    <p>{this.props.label}</p>
                    <select defaultValue={chosenOption}
                            onChange={(event) =>
                        this.setNewOption(event.target.value)
                    }>
                        {this.props.options.map(option =>
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

    setNewOption(newOption: Option["key"]): void{
        this.props.set(newOption);
    }

    render(): React.ReactNode {


        return (
            this.renderSetting()
        );
    }
}