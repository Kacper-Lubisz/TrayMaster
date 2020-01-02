import React from "react";
import "./styles/settings.scss";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";


export class SettingsPage extends React.Component<any, any> {


    render(): React.ReactNode {
        return (
            <div className="settings">
                <div className="settings-header">
                    <h1>Settings</h1>
                </div>
                <div className="settings-btns">
                    <Link to="/menu" className="key-btn" style={{textDecoration: "none"}}><p>Alerts</p></Link>
                    <Link to="/menu" className="key-btn" style={{textDecoration: "none"}}><p>Type Labels</p></Link>
                    <Link to="/menu" className="key-btn" style={{textDecoration: "none"}}><p>Time Labels</p></Link>
                    <Link to="/menu" className="key-btn" style={{textDecoration: "none"}}><p>General</p></Link>
                    <hr className="line"/>
                    <Link to="/menu" className="key-btn" style={{textDecoration: "none"}}>
                        <FontAwesomeIcon className="back-btn" icon={faArrowLeft}/>
                        <p>Back</p>
                    </Link>
                </div>
            </div>
        );
    }

}
