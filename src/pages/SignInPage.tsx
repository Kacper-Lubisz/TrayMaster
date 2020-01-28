import React from "react";
import "../styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import firebase from "../core/Firebase";
import {LoadingSpinner} from "../components/LoadingSpinner";

const authErrorMessages: Map<string, string> = new Map<string, string>([
    ["auth/invalid-email", "Invalid email address."],
    ["auth/user-disabled", "User account disabled."],
    ["auth/user-not-found", "Invalid email address or password."],
    ["auth/wrong-password", "Invalid email address or password."],
    ["auth/too-many-requests", "Too many requests."],
    ["auth/insecure", "Password length must be five characters or more."],
    ["auth/password-too-short", "Password length must be eight characters or more."],
    ["auth/password-single-case", "Password must contain at least one lower and upper case character."],
    ["auth/email-already-in-use", "Email is already in use."],
    ["auth/weak-password", "Password is too weak."]
]);

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
        return <div>
            <h1>Sign In</h1>

            {this.state.loading ? <LoadingSpinner/> : <>
                <form onSubmit={async (event) => {
                    event.preventDefault();
                    await this.signIn(this.state.emailField, this.state.passwordField);
                }}>
                    Email:
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
                    /> <br/>
                    Password:
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
                    /> <br/>
                </form>

                {this.state.feedback ? <h1 style={{color: "red"}}>{this.state.feedback}</h1> : undefined}

                <button onClick={this.signIn.bind(this, this.state.emailField, this.state.passwordField)}>Sign In
                </button>

                <br/>
            </>
            }
        </div>;
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
                        feedback: authErrorMessages.get(e.code) ?? "Authentication error occurred.",
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