import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";


interface ErrorHandlerState {
    errorFound: boolean;
    error?: Error | null;
}

/**
This class is wrapped around all app components in App.tsx to catch errors
 and provide a nice UI when it happens
 Can only catch errors in components below itself in the hierarchy

 In development the usual React error page will be showed on top of this,
 can easily just be dismissed
 */

class ErrorHandler extends React.Component<RouteComponentProps, ErrorHandlerState> {

    constructor(props: any) {
        super(props);
        this.state = {
            errorFound: false,
            error: null,
        };
    }

/**
This function catches the error and saves the information
 on what type of error in state
 */
    componentDidCatch(error: Error): void {

        this.setState({
            ...this.state,
            errorFound: true,
            error: error,
        });
    }

    /**
     * This function is called when the button to reload the page is called
     */
    private exitError(): void {
        window.location.reload();
    }

    render(): React.ReactNode {

        if (this.state.errorFound) {
            return (
                <div>
                    <h2>Something went wrong.</h2>
                    <p>{`${this.state.error === undefined ? "?" : this.state.error}`}</p>
                    <button className="key-btn"
                            onClick={this.exitError.bind(this)}><p>Refresh Page</p>
                    </button>
                </div>
            );
        } else {
            return this.props.children;
        }
    }
}

export default withRouter(ErrorHandler);