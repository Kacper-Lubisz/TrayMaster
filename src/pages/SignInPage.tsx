import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import storageAvailable from "storage-available";
import {Dialog, DialogButtons, DialogTitle} from "../components/Dialog";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {TrayMasterLogo} from "../components/TrayMasterLogo";
import firebase from "../core/Firebase";
import {compareVersions} from "../utils/compareVersions";
import "./styles/settings.scss";
import "./styles/signin.scss";

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

export interface SignInPageProps {
    openDialog: (dialog: Dialog) => void;
}

/**
 * RouteComponentProps enables the history.push to change paths
 */
class SignInPage extends React.Component<RouteComponentProps & SignInPageProps, SignInPageState> {

    constructor(props: RouteComponentProps & SignInPageProps) {
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
                {this.state.loading ? <div id="spinnerDiv"><LoadingSpinner/></div> : <>
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
                            type="email"
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
            <div id="disclaimer">
                This app (and its service providers including Firebase) may use cookies and similar technologies to
                download data for storage onto your device, which improves the app's functionality and speed. You can
                disable cookies and other data storage using your browser settings.
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


                if (storageAvailable("localStorage")) {
                    const oldVersion = localStorage.getItem("VERSION_NUMBER");
                    if (process.env.REACT_APP_VERSION !== oldVersion && process.env.NODE_ENV === "production") {
                        localStorage.setItem("VERSION_NUMBER", process.env.REACT_APP_VERSION ?? "");
                        const verDiff: 1 | 0 | -1 = ((old, current) => {
                            if (old === null) {
                                return 1;
                            } else if (current === undefined) {
                                return 0;
                            }
                            return compareVersions(old, current);
                        })(oldVersion, process.env.REACT_APP_VERSION);

                        const message: string = (() => {
                            if (verDiff === 1) {
                                return `You've been updated from ${oldVersion ?? "a previous version"} to ${process.env.REACT_APP_VERSION ?? "the latest version"}!`;
                            } else if (verDiff === -1) {
                                return `We've rolled you back from ${oldVersion ?? "a newer version"} to ${process.env.REACT_APP_VERSION ?? "a previous version"}. This has probably been done so that we can work to iron out some bugs that you might have encountered!`;
                            }
                            return "Your version number has changed, but something seems to have gone wrong. Sorry!";
                        })();

                        this.props.openDialog({
                            closeOnDocumentClick: true,
                            dialog: (close: () => void) => {
                                return <>
                                    <DialogTitle title="TrayMaster Update"/>
                                    <div className="dialogContent">
                                        <p>{message}</p>
                                        <DialogButtons buttons={[{name: "Thanks!", buttonProps: {onClick: close,}}]}/>
                                    </div>
                                </>;
                            }
                        });
                    }
                }


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