import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import "./styles/_errorhandler.scss";
import {TrayMasterLogo} from "./TrayMasterLogo";


interface ErrorHandlerState {
    error?: Error;
}

/**
 This class is wrapped around all app components in App.tsx to catch errors
 and provide a nice UI when it happens
 Can only catch errors in components below itself in the hierarchy

 In development the usual React error page will be showed on top of this,
 can easily just be dismissed

 NOTE: Does not catch errors in event handlers like onClick or our custom methods,
 only errors thrown in lifecycle methods like "render"
 */

class ErrorHandler extends React.Component<RouteComponentProps, ErrorHandlerState> {

    constructor(props: any) {
        super(props);
        this.state = {
            error: undefined,
        };
    }

    /**
     This function catches the error and saves the information
     on what type of error in state
     */

    static getDerivedStateFromError(error: Error): ErrorHandlerState {
        return {
            error: error
        };
    }

    render(): React.ReactNode {
        if (this.state.error) {
            const errorStack = this.state.error.stack?.split("\n") ?? "unknown";

            return (
                <div>
                    <TrayMasterLogo/>
                    <div id="error-container">
                        <h1>Something went wrong.</h1>
                        <p>Sorry about that. Here's some more information:</p>
                        <div id="error-content">
                            <h2>{this.state.error.name}</h2>
                            <table>
                                <tbody>
                                <tr>
                                    <td className="error-title">
                                        Thrown at:
                                    </td>
                                    <td className="error-info">
                                        {errorStack[errorStack.length - 2]}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="error-title">
                                        Description:
                                    </td>
                                    <td className="error-info">
                                        {this.state.error.message}
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <button id="error-exit" onClick={window.location.reload.bind(window.location)}>Refresh</button>
                    </div>
                </div>
            );
        } else {
            return this.props.children;
        }
    }
}

export default withRouter(ErrorHandler);