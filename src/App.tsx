import React from 'react';
import {TopBar} from "./TopBar";
import {SideBar, KeyboardName} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanelComponent} from "./BottomPanelComponent";
import "./styles/shelfview.scss";

interface ShelfViewState {
  currentKeyboard: KeyboardName
}

class App extends React.Component<any, ShelfViewState> {

  constructor(props: any) {
    super(props);

    this.state = {
      currentKeyboard: "category"
    };
  }


  switchKeyboard(id: KeyboardName) {
    this.setState({
      ...this.state,
      currentKeyboard: id
    });
  }

  render() {
    return (
      <div id="app">
        <TopBar/>
        <ViewPort/>
        <SideBar keyboardSwitcher={this.switchKeyboard.bind(this)}/>
        <BottomPanelComponent keyboardState={this.state.currentKeyboard}/>
      </div>
    );
  }

}


export default App;
