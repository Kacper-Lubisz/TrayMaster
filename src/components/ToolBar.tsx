import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {KeyboardButtonProps} from "./Keyboard";


/**
 * Props to be passed into SideBar
 * @see ToolBar
 */
interface ToolBarProps {
    disabled: boolean;

    /** List of toolbar buttons */
    toolbar: KeyboardButtonProps[];
}

/**
 * Main sidebar object
 */
export class ToolBar extends React.Component<ToolBarProps> {

    render(): React.ReactNode {
        return <div id="toolBar">{
            this.props.toolbar.map((tool, toolIndex) =>
                <button
                    className="tool"
                    key={toolIndex}
                    name={tool.name}
                    onClick={tool.onClick}
                    disabled={this.props.disabled || tool.disabled}
                    title={tool.name}
                >
                    <div>{// extra div needed to keep button square}{
                        tool.icon ? <FontAwesomeIcon icon={tool.icon}/> : tool.name
                    }</div>
                </button>
            )
        }</div>;
    }

}