import React from "react";
import "./styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {LoginState, StandardDialog} from "./App";

interface LoginPageProps {
    openDialog: (dialog: ((close: () => void) => StandardDialog)) => void;
    loginState: LoginState;
    setLoginState: (state: LoginState) => void;
}

/**
 * RouteComponentProps enables the history.push to change paths
 * This class is the login page
 */
class LoginPage extends React.Component<RouteComponentProps & LoginPageProps> {

    render(): React.ReactNode {
        return <div>

            <h1>Login Page</h1>

            <p>
                localStorage.getItem("userData") : {localStorage.getItem("userData")}
            </p>

            <button onClick={() => {
                localStorage.setItem("userData", JSON.stringify({
                    userID: "a",
                    name: "bobman",
                    authToken: "a",
                    lastWarehouseID: "MOCK 2"
                }));
            }}>
                Set userData to
                "{"{\"userID\":\"a\",\"name\":\"bobman\",\"authToken\":\"a\",\"lastWarehouseID\":\"MOCK 2\"}"}"
            </button>

        </div>;
    }

}

export default withRouter(LoginPage);