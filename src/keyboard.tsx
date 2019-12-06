import React from "react";
import "./styles/shelfview.scss";

/**
 * The properties that get passed into KeyboardButton components
 * @see KeyboardButton
 */
interface KeyboardButtonProps {
  name: string,
  onClick: any // TODO: check that onClick should be any and not void or something
}

/**
 * KeyboardButton component: returns a button to go into a keyboard
 * @param {KeyboardButtonProps} props - the name and function of the button
 * @constructor TODO: what do I put here?
 */
function KeyboardButton(props: KeyboardButtonProps) {
  // TODO: stop WebStorm getting angry about me using capitalised names for this React function component -
  //  I think I'm in the right here
  return (
    <button className="key-btn" onClick={props.onClick}>{props.name}</button>
  );
}

/**
 * The properties that get passed into Keyboard components
 * @see Keyboard
 */
interface KeyboardProps {
  buttons: any[][], // TODO: check types here
  gridX: number,
  height: any
}

/**
 * Keyboard component: returns a full-width keyboard with the given buttons, grid width and height
 */
export class Keyboard extends React.Component<KeyboardProps> {
  /**
   * Handle a button press. Obviously this is not the final version of this function; it's just a placeholder for now
   * @param {number} i - The button's index
   */
  handleClick(i: number) {
    alert(i);
  }

  /**
   * Generate and return an object representing a full keyboard based on the given props
   */
  generateBoard() {
    const rowCount: number = Math.ceil(this.props.buttons.length / this.props.gridX);

    let rows: any[] = [];
    for (let i = 0; i < rowCount; i++) {
      let btns: any[] = [];
      for (let j = 0; j < this.props.gridX; j++) {
        let buttonInfo: any[] = this.props.buttons[i * this.props.gridX + j];
        btns.push(<KeyboardButton name={buttonInfo[0]} onClick={() => this.handleClick(buttonInfo[1])}/>);
      }
      rows.push(<div className="kb-row">{btns}</div>);
    }
    return rows;
  }

  render() {

    return (
      <div className="keyboard" style={{height: this.props.height}}>
        {this.generateBoard()}
      </div>
    );
  }
}