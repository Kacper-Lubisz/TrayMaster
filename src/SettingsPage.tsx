import React from "react";
import "./styles/settings.scss";
import {Link} from "react-router-dom";


export class SettingsPage extends React.Component<any, any> {


    render() {
        return (
            <div className="settings">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>
                <div className="settings-btns">
                    <Link to="/Menu" className="key-btn" style={{textDecoration: "none"}}><p>Alerts</p></Link>
                    <Link to="/Menu" className="key-btn" style={{textDecoration: "none"}}><p>Type Labels</p></Link>
                    <Link to="/Menu" className="key-btn" style={{textDecoration: "none"}}><p>Time Labels</p></Link>
                    <Link to="/Menu" className="key-btn" style={{textDecoration: "none"}}><p>General</p></Link>
                    <hr className="line"/>
                    <Link to="/Menu" className="key-btn" style={{textDecoration: "none"}}><img alt="back-arrow"
                                                                                               className="back-btn"
                                                                                               src="keyboard_backspace-24px.svg"/>
                        <p>Back</p></Link>
                </div>
            </div>
        );
    }

}
