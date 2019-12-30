import React from "react";
import {Redirect} from "react-router-dom";
import "./styles/mainmenu.scss";

/**
 * expiryAmount is the number of items expiring soon
 * TODO needs to be fetched from db
 */
interface MainMenuProps {
    expiryAmount: number
}

/**
 * This class creates the main menu, redirecting to other screens
 * by changing state values when buttons are pressed
 * TODO change which path it redirects to when those are finished
 * Only shows the alert when an item is withing chosen expiry range
 */
export class MainMenu extends React.Component<MainMenuProps, any> {
  state = {
    changeScreen:false,
    toScreen: '',
  }


    render() {
      if (this.state.changeScreen === true){
        return <Redirect to={this.state.toScreen}/>
      }
        return (



            <div className="main-menu">
                <div className="menu-header">
                    <h1>Shelfmaster</h1>
                </div>
                {this.props.expiryAmount === 0 ? undefined : <div className="alert">
                    <img alt="warning icon" className="warning-icon" src="warning-24px.svg"/>
                    <h2>Expiry Imminent</h2>
                    <p>There are {this.props.expiryAmount} items expiring soon! Click here to see them</p>
                </div>
                }

                <div className="menu-btns">
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/'})}><p>Back to Shelf View</p></button>
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Settings'})}><p>Search</p></button>
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Settings'})}><p>Report</p></button>
                    <button className="key-btn" onClick={() => this.setState({changeScreen: true, toScreen:'/Settings'})}><p>Settings</p></button>
                </div>

            </div>
        );
    }

}
