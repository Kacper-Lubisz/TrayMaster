import {faSquare as tickEmpty} from "@fortawesome/free-regular-svg-icons";
import {faCheckSquare as tickFull} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {isEqual} from "lodash";

import React from "react";
import {User} from "../core/Firebase/Authentication";

import "./styles/_settingscomponent.scss";

export type Checkbox = {
    type: "checkBox";
    get: () => boolean;
    set: (value: boolean) => void;
};

export type DropDown<T> = {
    type: "dropDown";
    options: Option<T>[];
    get: () => T;
    set: (value: T) => void;
};

export type Option<T> = {
    label: string;
    key: T;
};

export type Setting = (Checkbox | DropDown<any>) & {
    label: string;
};

export type SettingsComponentProps = Setting & {
    user: User;
};


export class SettingsComponent extends React.Component<SettingsComponentProps> {


    render(): React.ReactNode {
        const propsAtRender = this.props;
        if (propsAtRender.type === "checkBox") {

            return <tr
                className="settings-component setting-checkbox"
                key={this.props.label}
                onClick={async () => {
                    propsAtRender.set(!propsAtRender.get());
                    await propsAtRender.user.stage(true, true);
                    this.forceUpdate();
                }}
            >
                <td><label>{this.props.label}</label></td>
                {/* tickbox is invisible & replaced visually by the FontAwesomeIcon */}
                <td><input
                    type="checkbox"
                    checked={propsAtRender.get()}
                    onChange={async e => {
                        propsAtRender.set(e.target.checked);
                        await propsAtRender.user.stage(true, true);
                        this.forceUpdate();
                    }}
                /><FontAwesomeIcon icon={propsAtRender.get() ? tickFull : tickEmpty}/>
                </td>
            </tr>;

        } else {

            const currentSelection = propsAtRender.options.findIndex(item =>
                isEqual(this.props.get(), item.key)
            );

            return <tr className="settings-component setting-drop-down" key={this.props.label}>
                <td><label>{this.props.label}</label></td>
                <td><select
                    defaultValue={currentSelection}
                    onChange={async e => {
                        propsAtRender.set(propsAtRender.options[Number(e.target.value)].key);
                        await propsAtRender.user.stage(true, true);
                    }}>
                    {propsAtRender.options.map((option, index) =>
                        <option value={index} key={index}>
                            {option.label}
                        </option>
                    )}
                </select></td>
            </tr>;
        }
    }

}