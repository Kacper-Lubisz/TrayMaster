import React from "react";
import "../styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import firebase from "../core/Firebase";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {TrayMasterLogo} from "../components/TrayMasterLogo";
import "../styles/signin.scss";

interface SignInPageState {
    emailField?: string;
    passwordField?: string;
    feedback?: string | undefined;

    loading: boolean;
}

/**
 * RouteComponentProps enables the history.push to change paths
 */
class SignInPage extends React.Component<RouteComponentProps, SignInPageState> {

    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            loading: false
        };
    }


    render(): React.ReactNode {
        return <>
            <TrayMasterLogo
                message={this.state.feedback ? <span style={{color: "red"}}>{this.state.feedback}</span> : undefined}/>
            <div id="signin-box">
                <h1>Sign in</h1>
                {this.state.loading ? <LoadingSpinner/> : <>
                    <form onSubmit={async (event) => {
                        event.preventDefault();
                        await this.signIn(this.state.emailField, this.state.passwordField);
                    }}>
                        <input
                            onChange={(event) => {
                                const newEmail = event.target.value;
                                this.setState(state => {
                                    return {
                                        ...state,
                                        emailField: newEmail
                                    };
                                });
                            }}
                            value={this.state?.emailField ?? ""}
                            type="text"
                            placeholder={"Email"}
                        />
                        <input
                            onChange={(event) => {
                                const newPassword = event.target.value;
                                this.setState(state => {
                                    return {
                                        ...state,
                                        passwordField: newPassword
                                    };
                                });
                            }}
                            value={this.state?.passwordField ?? ""}
                            type="password"
                            placeholder={"Password"}
                        />
                        <input type="submit" value="Submit"
                               onClick={this.signIn.bind(this, this.state.emailField, this.state.passwordField)}/>
                    </form>
                </>
                }
            </div>
        </>;
    }

    private async signIn(email: string | undefined, password: string | undefined): Promise<void> {
        if (email && password) {
            try {
                this.setState(state => {
                    return {
                        ...state,
                        loading: true,
                    };
                });
                await firebase.auth.signIn(email, password);
            } catch (e) {
                this.setState(state => {
                    return {
                        ...state,
                        feedback: e.toString(),
                        loading: false,
                    };
                });
            }
        } else {
            this.setState(state => {
                return {
                    ...state,
                    feedback: `${email ? "emailField is undefined " : ""}
                    ${password ? "passwordField is undefined " : ""}`
                };
            });
        }
    }


}


export default withRouter(SignInPage);