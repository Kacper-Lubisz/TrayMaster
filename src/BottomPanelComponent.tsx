import React from "react";
import {KeyboardButtonProps, Keyboard} from "./keyboard";

/**
 * This interface represents pages of the bottom panel.
 * @see BottomPanelComponent
 * @see BottomPanelSection
 */
export interface BottomPanelPage {
  name: string;
  sections: BottomPanelSection[];
}

/**
 * This interface represents one section of a page of a bottom panel.
 * @see BottomPanelComponent
 * @see BottomPanelPage
 */
export interface BottomPanelSection {
  title: string;
  buttons: string[];
  onClick: (button: string, index: number) => void;
}

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanelComponent extends React.Component<BottomPanelProps, any> {

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

export interface BottomPanelProps {
}
