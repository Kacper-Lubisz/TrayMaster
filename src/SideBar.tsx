import React from "react";

export class SideBar extends React.Component {
  render() {
    return (
      <div id="right">
        <button>Settings</button>
        <button>Back</button>
        <button>Edit Shelf</button>
        <button>Navigator</button>
        <button>Next</button>
      </div>
    );
  }
}