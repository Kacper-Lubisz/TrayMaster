import React from "react";
import {SearchQuery} from "../pages/SearchPage";


interface SearchPanelProps {
    keyboardState: string;
    setQuery: (query: SearchQuery) => void;
}

export class SearchPanel extends React.Component<SearchPanelProps> {

    render(): React.ReactNode {
        // return DOM elements using button structures
        return (
            <div id="searchPanel">
                This is the side panel fellas. keyboardState is "{this.props.keyboardState}"
            </div>
        );
    }
}