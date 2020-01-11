import React from "react";
import "./styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {LoginState, StandardDialog, WarehouseNotChosen} from "./App";

interface LoginPageProps {
    openDialog: (dialog: ((close: () => void) => StandardDialog)) => void;
    loginState: null | WarehouseNotChosen;
    setLoginState: (state: LoginState) => void;
}

/**
 * RouteComponentProps enables the history.push to change paths
 * This class is the login page
 */
class LoginPage extends React.Component<RouteComponentProps & LoginPageProps> {

    render(): React.ReactNode {

        if (this.props.loginState === null) {
            return <div>
                <h1>Login</h1>
                Email: <br/>
                <input type="text" placeholder={"email"}/> <br/>
                Password: <br/>
                <input type="password" placeholder={"email"}/> <br/>

                <button>Login</button>
                <button>Reset Password</button>
                <br/>

                <button onClick={() => {
                    localStorage.setItem("userData", JSON.stringify({
                        userID: "a",
                        name: "bobman",
                        authToken: "a",
                        lastWarehouseID: "MOCK 0"
                    }));
                    window.location.reload();
                }}>
                    Set userData to
                    "{"{\"userID\":\"a\",\"name\":\"bobman\",\"authToken\":\"a\",\"lastWarehouseID\":\"MOCK 0\"}"}"
                </button>
            </div>;

        } else {
            return <div>

                <h1>Login Page</h1>

                <p>
                    localStorage.getItem("userData") : {localStorage.getItem("userData")}
                </p>

                <button onClick={() => {
                    localStorage.removeItem("userData");
                    window.location.reload();
                }}>Logout
                </button>

            </div>;
        }
    }

}

export default withRouter(LoginPage);