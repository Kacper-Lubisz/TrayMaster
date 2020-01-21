import React from "react";
import {SearchQuery} from "../pages/SearchPage";

export type PanelState = "category" | "weight" | "expiry";

interface SearchPanelProps {
    panelState: PanelState;
    setPanelState: (state: PanelState) => void;
    setQuery: (query: SearchQuery) => void;
}

export class SearchPanel extends React.Component<SearchPanelProps> {

    render(): React.ReactNode {
        // return DOM elements using button structures
        return (
            <div id="searchPanel">
                This is the side panel fellas. keyboardState is "{this.props.panelState}"
                <br/>
                <button onClick={() => this.props.setPanelState("category")}>Category</button>
                <button onClick={() => this.props.setPanelState("weight")}>Weight</button>
            </div>
        );
    }
}