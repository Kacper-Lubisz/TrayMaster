import React from "react";
import "./styles/shelfview.scss";

/**
 * The properties that get passed into KeyboardButton components
 * @see KeyboardButton
 */
export interface KeyboardButtonProps {
  name: string,
  onClick?: (e: React.MouseEvent) => void
}

/**
 * KeyboardButton component: returns a button to go into a keyboard
 * @see KeyboardButtonProps
 */
class KeyboardButton extends React.Component<KeyboardButtonProps> {
  render() {
    return (
      <button className="key-btn" onClick={(e) => {
        if (this.props.onClick) {
          this.props.onClick(e);
        }
      }}>{this.props.name}</button>
    );
  }
}

/**
 * The properties that get passed into Keyboard components
 * @see Keyboard
 */
interface KeyboardProps {
  buttons: KeyboardButtonProps[],
  gridX: number,
  height: string
}

/**
 * Keyboard component: returns a full-width keyboard with the given buttons, grid width and height
 * @see KeyboardProps
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

    return Array(rowCount).fill(0).map((_, r) =>
      <div className="kb-row" style={{
        height: `${100 / rowCount}%`
      }}>
        {
          Array(this.props.gridX).fill(0).map((_, c) => {
              let buttonInfo: KeyboardButtonProps = this.props.buttons[r * this.props.gridX + c];
              return <KeyboardButton name={buttonInfo.name} onClick={buttonInfo.onClick}/>;
            }
          )
        }
      </div>
    );
  }

  render() {

    return (
      <div className="keyboard" style={{
        height: this.props.height
      }}>
        {this.generateBoard()}
      </div>
    );
  }
}