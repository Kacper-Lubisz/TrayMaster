import React from "react";
import "./styles/shelfview.scss";
import "./styles/mainmenu.scss";

interface MainMenuProps {
  //Number of items about to expire, needs to be fetched from database
  expiryAmount: number
}

export class MainMenu extends React.Component<MainMenuProps, any> {


  render() {
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
          <button className='key-btn'>Back to Shelf View</button>
          <button className='key-btn'>Search</button>
          <button className='key-btn'>Report</button>
          <button className='key-btn'>Settings</button>
        </div>
      </div>
    );
  }

}
