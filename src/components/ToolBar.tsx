import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {CustomButtonProps} from "./Keyboard";
import "./styles/_toolbar.scss";

/**
 * Props to be passed into SideBar
 * @see ToolBar
 */
interface ToolBarProps {
    disabled: boolean;

    /** List of toolbar buttons */
    toolbar: CustomButtonProps[];
}

/**
 * Main sidebar object
 */
export class ToolBar extends React.Component<ToolBarProps> {

    render(): React.ReactNode {
        return <div id="toolBar">{
            this.props.toolbar.map((tool, toolIndex) =>
                <button
                    className="tool btn-style-override"
                    key={toolIndex}
                    name={tool.name}
                    onClick={tool.onClick}
                    disabled={this.props.disabled || tool.disabled}
                    title={tool.name}
                >
                    {tool.icon ? <FontAwesomeIcon icon={tool.icon}/> : tool.name}
                </button>
            )
        }</div>;
    }

}