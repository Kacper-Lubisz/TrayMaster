import React from "react";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel";

type CustomKeyboardEditorProps = {
    user: User;
    warehouse: Warehouse;
};

export class CustomKeyboardEditor extends React.Component<CustomKeyboardEditorProps> {
    render(): React.ReactNode {

        // const keyboard = this.props.user.customKeyboard;
        // if (keyboard) {
        //
        //     return <div>
        //         <h2>Keyboard Builder</h2>
        //         TODO build a keyboard builder
        //
        //         <h2>Preview</h2>
        //         {this.renderKeyboard(keyboard)}
        //     </div>;
        //
        // } else {
        return <div>No unified keyboard is specified, enable this feature in the settings</div>;
        // }

    }

    // private renderKeyboard(keyboard: CustomKeyboard): React.ReactNode {
    //     return <div style={{
    //         display: "grid",
    //     }}>{
    //         keyboard.buttons.length === 0 ? <div>
    //             The keyboard has no buttons
    //         </div> : keyboard.buttons.map((button, index) => <button
    //             key={index}
    //             style={{
    //                 fontSize: 10,
    //                 gridColumnStart: button.columnStart ?? undefined,
    //                 gridColumnEnd: button.columnEnd ?? undefined,
    //                 gridRowStart: button.rowStart ?? undefined,
    //                 gridRowEnd: button.rowEnd ?? undefined,
    //                 background: button.background ?? undefined,
    //             }}
    //             disabled={true}
    //         >
    //             {button.label}
    //         </button>)
    //     }</div>;
    // }
}
