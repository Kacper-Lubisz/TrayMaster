import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanelComponent extends React.Component<any, any> {

  render() {
    let buttons: KeyboardButtonProps[] = [];
    for (let i = 0; i < 40; i++) {
      buttons.push({
        name: "Beans", onClick: () => {
          alert(i);
        }
      });
    }
    return (
        <div id="bottom">
          <Keyboard buttons={buttons} gridX={8}/>
        </div>
    );
  }
}
