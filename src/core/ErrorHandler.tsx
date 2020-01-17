import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";


interface ErrorHandlerState {
    errorFound: boolean;
    error?: Error | null;
}


class ErrorHandler extends React.Component<RouteComponentProps, ErrorHandlerState> {

    constructor(props: any) {
        super(props);
        this.state = {
            errorFound: false,
            error: null,
        };
    }


    componentDidCatch(error: Error): void {

        this.setState({
            ...this.state,
            errorFound: true,
            error: error,
        });
    }

    exitError(): void {
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
        }
        return this.props.children;
    }
}

export default withRouter(ErrorHandler);