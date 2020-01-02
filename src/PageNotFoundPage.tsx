import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";


class PageNotFoundPage extends React.Component<RouteComponentProps, any> {

    render() {
        return (
            <div>
                <h1>Page not found</h1>
                <button className="key-btn"
                        onClick={() => this.props.history.push("/menu")}><p>Go to Main Menu</p>
                </button>
            </div>
        );
    }

}

export default withRouter(PageNotFoundPage);