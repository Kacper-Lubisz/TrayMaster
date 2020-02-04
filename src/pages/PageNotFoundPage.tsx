import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";


class PageNotFoundPage extends React.Component<RouteComponentProps> {

    render(): React.ReactNode {
        return (
            <div>
                <h1>Page not found</h1>
                <button onClick={() => this.props.history.replace("/menu")}>Go to Main Menu</button>
            </div>
        );
    }

}

export default withRouter(PageNotFoundPage);