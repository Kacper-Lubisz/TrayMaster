import React from "react";

interface TopBarProps {
    locationString: string
}

export class TopBar extends React.Component<TopBarProps> {
    render() {
        return (
            <div id="topBar">{this.props.locationString}</div>
        );
    }
}