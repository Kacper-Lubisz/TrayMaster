import React from "react";
import "./styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {StandardDialog} from "./App";

interface LoginPageProps {
    openDialog: (dialog: ((close: () => void) => StandardDialog)) => void;
}

/**
 * RouteComponentProps enables the history.push to change paths
 * This class is the login page
 */
class LoginPage extends React.Component<RouteComponentProps & LoginPageProps> {

    render(): React.ReactNode {
        return <div>You are not logged in</div>;
    }

}

export default withRouter(LoginPage);