import React from "react";
import {User} from "../core/Firebase/Authentication";

import "./styles/_settingscomponent.scss";

type Option = {
    label: string;
    key: string;
};

type Checkbox = {
    type: "checkBox";
    get: () => boolean;
    set: (value: boolean) => void;
};

type DropDown = {
    type: "dropDown";
    options: Option[];
    get: () => string;
    set: (value: string) => void;
};

export type Setting = (Checkbox | DropDown) & {
    label: string;
};

export type SettingsComponentProps = Setting & {
    user: User;
};


export class SettingsComponent extends React.Component<SettingsComponentProps> {


    render(): React.ReactNode {
        if (this.props.type === "checkBox") {
            const propsAtRender = this.props;
            return <div
                className="setting-checkbox"
                key={this.props.label}
                onClick={((props: Checkbox) => {
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
            return <div className="setting-drop-down" key={this.props.label}>
                <label>
                    <p>{this.props.label}</p>
                    <select defaultValue={this.props.get()}
                            onChange={(event) => {
                                propsAtRender.set(event.target.value);
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

}