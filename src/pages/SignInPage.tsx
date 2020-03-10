import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {TrayMasterLogo} from "../components/TrayMasterLogo";
import firebase from "../core/Firebase";
import "../styles/settings.scss";
import "../styles/signin.scss";

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
                                this.setState(state => ({

                                    ...state,
                                    emailField: newEmail

                                }));
                            }}
                            value={this.state?.emailField ?? ""}
                            type="text"
                            placeholder={"Email"}
                        />
                        <input
                            onChange={(event) => {
                                const newPassword = event.target.value;
                                this.setState(state => ({
                                    ...state,
                                    passwordField: newPassword

                                }));
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
                this.setState(state => ({
                    ...state,
                    loading: true,
                }));
                await firebase.auth.signIn(email, password);
            } catch (e) {
                this.setState(state => ({
                    ...state,
                    feedback: "Error: ".concat(authErrorMessages.get(e.code) ?? "Authentication error occurred."),
                    loading: false,
                }));
            }
        } else {
            this.setState(state => ({
                ...state,
                feedback: `${email ? "" : "Please enter your email address!"}
                    ${password ? "" : "Please enter your password!"}`
            }));
        }
    }


}


export default withRouter(SignInPage);