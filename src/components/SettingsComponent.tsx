import React from "react";
import {User} from "../core/Firebase/Authentication";


type SettingsComponentProps =
    | {
    type: "radioButton";
    label: string;
    user: User;
    get: () => boolean;
    set: (value: boolean) => void;
}
    | {
    type: "dropDown";
    label: string;
    user: User;
    get: () => string;
    set: (value: string) => void;
}


/**interface SettingsComponentProps<T> {
    get: () => T;
    set: (value: T) => void;
    label: string;
    user: User;
}*/

export class SettingsComponent extends React.Component<SettingsComponentProps> {

    showOption(): React.ReactNode{
        switch(this.props.type){
            case "radioButton":
                return <div className="settings-setting" key={this.props.label}
                                        onClick={() => {
                                            this.props.set(!this.props.get());
                                            this.forceUpdate();
                                        }}>

                    <input
                        type="checkbox"
                        checked={this.props.get()}
                        onChange={async e => {
                            this.props.set(e.target.checked);
                            await this.props.user.stage(true, true);
                            this.forceUpdate();
                        }}
                    />
                    <p>{this.props.label}</p>
                </div>;

            case "dropDown":
                return;
        }
    }

    render(): React.ReactNode {


        return (


        );
    }
}