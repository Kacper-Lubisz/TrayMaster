import React from "react";
import "./styles/shelfview.scss";
import "./styles/settings.scss";


export class Settings extends React.Component<any, any> {


  render() {
    return (
  <div className="settings">
    <div className="settings-header">
      <h1>Settings</h1>
    </div>
    <div className="settings-btns">
      <button className='key-btn'>Alerts</button>
      <button className='key-btn'>Type Labels</button>
      <button className='key-btn'>Time Labels</button>
      <button className='key-btn'>General</button>
      <hr className="line"/>
      <button className='key-btn'><img className="back-btn" src="keyboard_backspace-24px.svg"/>Back</button>
    </div>
  </div>
    );
  }

}
