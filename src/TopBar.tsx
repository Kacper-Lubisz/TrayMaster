import React from "react";

interface TopBarProps {
    locationString: string,
    zoneColour?: string
}

/**
 * Returns what font colour is best given a background colour
 * Sources: https://stackoverflow.com/a/5624139 - hex to RGB
 *          https://stackoverflow.com/a/3943023 - decide what colour to use
 * @param hex - the background colour provided by the zone
 */
function getFontColour(hex?: string) {
    if (hex) {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        if (result) {
            let r = parseInt(result[1], 16), g = parseInt(result[2], 16), b = parseInt(result[3], 16);
            if (r * 0.299 + g * 0.587 + b * 0.114 < 186) return "#ffffff";
        }
    }

    return "#000000";
}

export class TopBar extends React.Component<TopBarProps> {
    render() {
        return (
            <div id="topBar" style={{
                backgroundColor: this.props.zoneColour,
                color: getFontColour(this.props.zoneColour)
            }}>{this.props.locationString}</div>
        );
    }
}