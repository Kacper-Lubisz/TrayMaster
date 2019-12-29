import React from "react";
import {getTextColourForBackground} from "./utils/getTextColourForBackground";

interface TopBarProps {
    locationString: string;
    zoneColour?: string;
}

export class TopBar extends React.Component<TopBarProps> {
    render() {
        return (
            <div id="topBar" style={{
                backgroundColor: this.props.zoneColour,
                color: this.props.zoneColour ? getTextColourForBackground(this.props.zoneColour) : "#000000"
            }}>{this.props.locationString}</div>
        );
    }
}