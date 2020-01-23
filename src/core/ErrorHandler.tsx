import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";


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

    /**
     * This function is called when the button to reload the page is called
     */
    private static exitError(): void {
        window.location.reload();
    }

    render(): React.ReactNode {

        if (this.state.error) {
            return (
                <div>
                    <h2>Something went wrong.</h2>
                    <p>{`${this.state.error}`}</p>
                    <button className="key-btn"
                            onClick={ErrorHandler.exitError.bind(this)}><p>Refresh Page</p>
                    </button>
                </div>
            );
        } else {
            return this.props.children;
        }
    }
}

export default withRouter(ErrorHandler);