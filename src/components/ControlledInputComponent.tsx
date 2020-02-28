import {faSquare as tickEmpty} from "@fortawesome/free-regular-svg-icons";
import {faCheckSquare as tickFull} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {isEqual} from "lodash";

import React from "react";

import "./styles/_controleldinputcomponent.scss";

export type Checkbox = {
    inputType: "checkBox";
    get: () => boolean;
    set: (value: boolean) => void;
};

export type DropDown<T> = {
    inputType: "dropDown";
    options: DropDownOption<T>[];
    get: () => T;
    set: (value: T) => void;
};

export type DropDownOption<T> = {
    label: string;
    key: T;
};

export type TextField = {
    inputType: "textField";
    type: string;
    placeholder: string | undefined;
    get: () => string;
    set: (value: string) => void;
};

export type NumberInput = {
    inputType: "number";
    placeholder: string | undefined;
    get: () => number | null;
    set: (value: number | null) => void;
};

export type ControlledInputComponentProps = (Checkbox | DropDown<any> | TextField | NumberInput) & {
    label: string;
};


export class ControlledInputComponent extends React.Component<ControlledInputComponentProps> {

    render(): React.ReactNode {
        const propsAtRender = this.props;
        if (propsAtRender.inputType === "checkBox") {
            return <tr
                className="settings-component setting-checkbox"
                key={propsAtRender.label}
                onClick={() => {
                    propsAtRender.set(!propsAtRender.get());
                    this.forceUpdate();
                }}
            >
                <td><label>{propsAtRender.label}</label></td>
                <td>
                    <input
                        type="checkbox"
                        checked={propsAtRender.get()}
                        onChange={e => propsAtRender.set(e.target.checked)}
                    />
                    <FontAwesomeIcon icon={propsAtRender.get() ? tickFull : tickEmpty}/>
                    {/* tickbox is invisible & replaced visually by the FontAwesomeIcon */}
                </td>
            </tr>;

        } else if (propsAtRender.inputType === "dropDown") {

            const currentSelection = propsAtRender.options.findIndex(item =>
                isEqual(this.props.get(), item.key)
            );

            return <tr className="settings-component setting-drop-down" key={propsAtRender.label}>
                <td><label>{this.props.label}</label></td>
                <td>
                    <select
                        defaultValue={currentSelection}
                        onChange={e =>
                            propsAtRender.set(propsAtRender.options[Number(e.target.value)].key)
                        }
                    >{propsAtRender.options.map((option, index) =>
                        <option value={index} key={index}>
                            {option.label}
                        </option>
                    )}</select>
                </td>
            </tr>;

        } else if (propsAtRender.inputType === "textField") {

            return <tr className="settings-component setting-text-field" key={propsAtRender.label}>
                <td><label>{propsAtRender.label}</label></td>
                <td>
                    <input
                        type={propsAtRender.inputType}
                        value={propsAtRender.get()}
                        placeholder={propsAtRender.placeholder}
                        onChange={e => propsAtRender.set(e.target.value)}
                    />
                </td>
            </tr>;
        } else { //propsAtRender.inputType === "number"

            const value = propsAtRender.get();
            return <tr className="settings-component setting-number" key={propsAtRender.label}>
                <td><label>{propsAtRender.label}</label></td>
                <td>
                    <input
                        type="text"
                        pattern="[0-9]*"
                        value={value ? value : ""}
                        placeholder={propsAtRender.placeholder}
                        onChange={e =>
                            propsAtRender.set(e.target.value.length === 0 ? null : Number(e.target.value))
                        }
                    />
                </td>
            </tr>;

        }

    }

}