import React from "react";
import "./styles/shelfview.scss";


interface KeyboardButtonProps {
  name: string,
  onClick: any // TODO: check that onClick should be any and not void or something
}

interface KeyboardProps {
  buttons: any[][], // TODO: check type
  width: number
}

function KeyboardButton(props: KeyboardButtonProps) {
  return (
    <button className="key-btn" onClick={props.onClick}>{props.name}</button>
  );
}

// TODO: stop WebStorm getting angry about me using capitalised names for React function components -
//  I think I'm in the right here
class Keyboard extends React.Component<KeyboardProps> {
  handleClick(i: number) {
    alert(i);
  }

  generateBoard() {
    const rowCount: number = Math.ceil(this.props.buttons.length / this.props.width);

    let rows: any[] = [];
    for (let i = 0; i < rowCount; i++) {
      let btns: any[] = [];
      for (let j = 0; j < this.props.width; j++) {
        let buttonInfo: any[] = this.props.buttons[i * this.props.width + j];
        btns.push(<KeyboardButton name={buttonInfo[0]} onClick={() => this.handleClick(buttonInfo[1])}/>);
      }
      rows.push(<div className="kb-row">{btns}</div>);
    }
    return rows;
  }

  render() {

    return (
      <div className="keyboard">
        {this.generateBoard()}
      </div>
    );
  }
}

export default Keyboard;