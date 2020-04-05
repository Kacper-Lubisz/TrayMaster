/**
 * Returns a confirmation dialog
 */
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../components/Dialog";

export const DANGER_COLOR = "#ff0000"; // todo extract this everywhere

export function createConfirmationDialog(
    title: string,
    iconProps: FontAwesomeIconProps,
    message: string,
    confirmButtonTitle: string,
    onConfirm: () => void,
): Dialog {
    return {
        closeOnDocumentClick: true,
        dialog: (close: () => void) => <>
            <DialogTitle title={title} iconProps={iconProps}/>
            <div className="dialogContent">
                <h2>{message}</h2>
                <DialogButtons buttons={[
                    {name: "Cancel", buttonProps: {onClick: close}},
                    {
                        name: confirmButtonTitle, buttonProps: {
                            onClick: () => {
                                close();
                                onConfirm();
                            },
                            style: {
                                borderColor: DANGER_COLOR
                            }
                        }
                    }
                ]}/>
            </div>
        </>
    };
}


/**
 * Returns the unsaved changes dialog
 */
export function createUnsavedDialog(): Dialog {
    return {
        closeOnDocumentClick: true,
        dialog: (close: () => void) => <>
            <DialogTitle title="Unsaved Changes" iconProps={{icon: faInfoCircle, color: "blue"}}/>
            <div className="dialogContent">
                <h2>Please save or cancel your current changes before proceeding</h2>
                <DialogButtons buttons={[
                    {name: "OK", buttonProps: {onClick: close}}
                ]}/>
            </div>
        </>
    };
}
