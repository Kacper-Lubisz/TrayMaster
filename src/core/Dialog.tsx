import React, {ReactNode} from "react";
import {FontAwesomeIcon, FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";

export type StoredDialog = {
    dialog: ReactNode;
    closeOnDocumentClick: boolean;
};

export type Dialog = {
    dialog: (close: () => void) => ReactNode;
    closeOnDocumentClick: boolean;
};

export type DialogTitleProps = { title: string; iconProps?: FontAwesomeIconProps };

/**
 * The standard dialog sub component which contains the title and icon
 */
export class DialogTitle extends React.Component<DialogTitleProps> {
    render(): React.ReactNode {
        return <h1 className={"dialogTitle"}> {this.props.iconProps ?
                                               <FontAwesomeIcon {...this.props.iconProps}/> : null}
            {this.props.title}
        </h1>;
    }
}

/**
 * This is the interface to represent the buttons of a dialog
 */
export interface DialogButton {
    name: string;
    buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}


export type DialogButtonsProps = { buttons: DialogButton[] };

/**
 * The standard dialog sub component which contains buttons
 */
export class DialogButtons extends React.Component<DialogButtonsProps> {
    render(): React.ReactNode {
        return <div className="dialogButtons">{this.props.buttons.map((button, index) =>
            <button key={index} {...button.buttonProps}>{button.name}</button>
        )}</div>;
    }
}

/**
 * This method builds a dialog function for a standard error message.
 * @param title THe title of the error dialog
 * @param message The body of the dialog
 * @param forceReload If the dialog forces the page to be reloaded
 */
export function buildErrorDialog(title: string, message: string, forceReload: boolean): Dialog {
    return {
        closeOnDocumentClick: !forceReload,
        dialog: (close: () => void) => <>
            <DialogTitle title={title} iconProps={{icon: warningIcon, color: "red"}}/>
            <p>{message}</p>
            <DialogButtons buttons={[
                {
                    name: "Reload", buttonProps: {
                        onClick: () => window.location.reload(),
                        style: {borderColor: "red"}
                    }
                }
            ].concat(forceReload ? [] : {
                name: "Ok", buttonProps: {
                    onClick: close,
                    style: {borderColor: "red"}
                }
            })}/>
        </>
    };
}