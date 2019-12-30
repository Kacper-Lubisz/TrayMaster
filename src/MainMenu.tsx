import React from "react";
import {Redirect} from "react-router-dom";
import "./styles/mainmenu.scss";


interface MainMenuProps {
    //Number of items about to expire, needs to be fetched from database in this file
    expiryAmount: number
}


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

            //When all are implemented they should not all say "/Settings"

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
