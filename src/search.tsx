import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import "./styles/search.scss";

export interface SearchPanelProps {
    keyboardState: string
    // I don't know what other information the SearchPanel needs
}

export interface SearchPageProps {
    // I don't know what information the SearchPage needs - this is probably a priority to do soon
}

export class SearchPanel extends React.Component<SearchPanelProps> {

    render() {
        // return DOM elements using button structures
        return (
            <div id="searchPanel">
                This is the side panel fellas. keyboardState is "{this.props.keyboardState}"
            </div>
        );
    }
}

export class SearchPage extends React.Component<SearchPageProps> {

    render() {
        return (
            <div id="searchPage">
                <div id="leftPanel">
                    <div id="searchSentence">
                        Beans and stuff expiring soon
                    </div>
                    <div id="searchResults">
                        idk man
                    </div>
                </div>
                <SearchPanel keyboardState={"yeet"}/>
            </div>
        );
    }
}