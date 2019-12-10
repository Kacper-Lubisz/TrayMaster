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
    let categories: KeyboardButtonProps[] = [];
    for (let i = 0; i < 40; i++) {
      categories.push({
        name: "Beans", onClick: () => {
          alert(i);
        }
      });
    }

    let years: KeyboardButtonProps[] = [];
    for (let i = 2019; i < 2027; i++) {
      years.push({
        name: i.toString(), onClick: () => {
          alert(i);
        }
      });
    }

    let quarters: KeyboardButtonProps[] = [];
    const quartersTranslator: string[] = [
      "Jan-Mar",
      "Apr-Jun",
      "Jul-Sep",
      "Oct-Dec"
    ];
    for (let i = 1; i <= 4; i++) {
      quarters.push({
        name: quartersTranslator[i - 1], onClick: () => {
          alert(i);
        }
      });
    }

    let months: KeyboardButtonProps[] = [];
    const monthsTranslator: string[] = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    for (let i = 1; i <= 12; i++) {
      months.push({
        name: monthsTranslator[i - 1], onClick: () => {
          alert(i);
        }
      });
    }

    let numpad: KeyboardButtonProps[] = [];
    for (let i = 9; i >= 0; i--) {
      numpad.push({
        name: i.toString(), onClick: () => {
          alert(i);
        }
      });
    }
    numpad.push({
      name: ".", onClick: () => {
        alert("Max is our favourite scrum master");
      }
    });

    const numpadR: KeyboardButtonProps[] = [
      {
        name: "Back",
        onClick: () => {
          alert("Back");
        }
      },
      {
        name: "Clear",
        onClick: () => {
          alert("Clear");
        }
      },
      {
        name: "Enter",
        onClick: () => {
          alert("Enter");
        }
      }
    ];

    return (
      <div id="bottom">
        <Keyboard id="cat-keyboard" buttons={categories} gridX={8}/>
        <div id="exp-keyboard">
          <Keyboard id="exp-1" buttons={years} gridX={2}/>
          <div className="vl"/>
          <Keyboard id="exp-2" buttons={quarters} gridX={1}/>
          <Keyboard id="exp-3" buttons={months} gridX={3}/>
        </div>
        <div className="keyboard-container">
          <Keyboard id="weight-numpad" buttons={numpad} gridX={3}/>
          <Keyboard id="numpadR" buttons={numpadR} gridX={1}/>
        </div>
      </div>
    );
  }
}

export interface BottomPanelProps {
  pages: BottomPanelPage[]
}
