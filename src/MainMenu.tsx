import React from "react";
import {Link} from "react-router-dom";
import "./styles/mainmenu.scss";

interface MainMenuProps {
  //Number of items about to expire, needs to be fetched from database in this file
  expiryAmount: number
}

export class MainMenu extends React.Component<MainMenuProps, any> {


  render() {
    return (
      //Links are buttons
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
          <Link to="/" className="key-btn" style={{textDecoration:'none'}}><p>Back to Shelf View</p></Link>
          <Link to="/Settings" className="key-btn" style={{textDecoration:'none'}}><p>Search</p></Link>
          <Link to="/Settings" className="key-btn" style={{textDecoration:'none'}}><p>Report</p></Link>
          <Link to="/Settings" className="key-btn" style={{textDecoration:'none'}}><p>Settings</p></Link>
        </div>
      </div>
    );
  }

}
