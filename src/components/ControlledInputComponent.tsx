import {faSquare as tickEmpty} from "@fortawesome/free-regular-svg-icons";
import {faCheckSquare as tickFull} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {isEqual} from "lodash";

import React, {ReactNode} from "react";
import {SketchPicker} from "react-color";

import "./styles/_controlledinputcomponent.scss";

export type BooleanInput = {
    inputType: "boolean";
    get: () => boolean;
    set: (value: boolean) => void;
};

export type OptionInput<T> = {
    inputType: "dropDown";
    options: DropDownOption<T>[];
    get: () => T;
    set: (value: T) => void;
};

export type DropDownOption<T> = {
    label: string;
    key: T;
};

export type TextInput = {
    inputType: "text";
    placeholder: string | undefined;
    get: () => string;
    set: (value: string) => void;
};

export type NumberInput = {
    inputType: "number";
    placeholder: string | undefined;
    get: () => number | null;
    set: (value: number | null) => void;
    min: number | undefined;
    max: number | undefined;
};

export type ColorInput = {
    inputType: "color";
    get: () => string;
    set: (value: string | null) => void;
    onClear: string | null;
};

export type ControlledInputComponentProps =
    (BooleanInput | OptionInput<any> | TextInput | NumberInput | ColorInput)
    & { label: string };


export class ControlledInputComponent extends React.Component<ControlledInputComponentProps> {

    render(): React.ReactNode {
        const propsAtRender = this.props;
        if (propsAtRender.inputType === "boolean") {
            return <tr
                className="settings-component setting-checkbox"
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

            return <tr className="settings-component setting-drop-down">
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

        } else if (propsAtRender.inputType === "text") {

            return <tr className="settings-component setting-text-field">
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
        } else if (propsAtRender.inputType === "number") { //

            const value = propsAtRender.get();
            return <tr className="settings-component setting-number">
                <td><label>{propsAtRender.label}</label></td>
                <td>
                    <input
                        type="number"
                        // pattern="[0-9]*"
                        value={value ? value : ""}
                        placeholder={propsAtRender.placeholder}
                        onChange={e =>
                            propsAtRender.set(e.target.value.length === 0 ? null : Number(e.target.value))
                        }
                        min={propsAtRender.min}
                        max={propsAtRender.max}
                    />
                </td>
            </tr>;

        } else { //propsAtRender.inputType === "color"

            return <tr className="settings-component setting-color">
                <td><label>{propsAtRender.label}</label></td>
                <td>
                    <SketchPopup
                        color={propsAtRender.get()}
                        onChange={color => propsAtRender.set(color)}/>
                    <button
                        onClick={_ => propsAtRender.set(propsAtRender.onClear)}
                    >Clear
                    </button>
                </td>
            </tr>;

        }

    }

}

interface SketchPopupState {
    displayColorPicker: boolean;
}

interface SketchPopupProps {
    onChange: (color: string) => void;
    color: string;
}

class SketchPopup extends React.Component<SketchPopupProps, SketchPopupState> {
    state = {
        displayColorPicker: false
    };

    private toggleOpen(): void {
        this.setState(state => ({...state, displayColorPicker: !this.state.displayColorPicker}));
    }

    private close(): void {
        this.setState(state => ({...state, displayColorPicker: false}));
    }

    render(): ReactNode {
        return <div>
            <div style={{
                padding: "5px",
                background: "#ffffff",
                borderRadius: "1px",
                boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
                display: "inline-block",
                cursor: "pointer",
            }} onClick={this.toggleOpen.bind(this)}>
                <div style={{
                    width: "36px",
                    height: "14px",
                    borderRadius: "2px",
                    background: this.props.color,
                }}/>
            </div>
            {this.state.displayColorPicker ? <div style={{
                position: "absolute",
                zIndex: 2,
            }}>
                <div style={{
                    position: "fixed",
                    top: "0px",
                    right: "0px",
                    bottom: "0px",
                    left: "0px",
                }} onClick={this.close.bind(this)}/>
                <SketchPicker
                    color={this.props.color}
                    onChange={color => this.props.onChange(color.hex)}
                />
            </div> : null}

        </div>;
    }
}
