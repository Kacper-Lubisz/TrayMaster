import React from "react";
import "./styles/settings.scss";
import {Redirect} from "react-router-dom";


export class Settings extends React.Component<any, any> {

    state = {
        changeScreen:false,
        toScreen: '',
    }

    render() {
        if (this.state.changeScreen === true){
            return <Redirect to={this.state.toScreen}/>
        }
        return (
            <div className="settings">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>
                <div className="settings-btns">
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Menu'})}><p>Alerts</p></button>
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Menu'})}><p>Type Labels</p></button>
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Menu'})}><p>Time Labels</p></button>
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Menu'})}><p>General</p></button>

                    <hr className="line"/>

                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Menu'})}><img alt="back-arrow"
                                                                                                                           className="back-btn"
                                                                                                                           src="keyboard_backspace-24px.svg"/>
                        <p>Back</p></button>

                </div>
            </div>
        );
    }

}
