import React from "react";
import {TopBar} from "./TopBar";
import {SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanelComponent, BottomPanelPage} from "./BottomPanelComponent";
import "./styles/shelfview.scss";
import {SettingsManager} from "./core/MockSettings";
import {generateRandomId} from "./core/MockWarehouse";

class App extends React.Component<any, any> {
    constructor(props: any) {
        super(props);

        // SettingsManager.loadSettings()
        //     .then(settings => {
        //         console.log(`Settings Loaded:\n    sampleSetting: ${settings.sampleSetting}`);
        //
        //         settings.sampleSetting = "Different value";
        //         SettingsManager.saveSettings();
        //     });
    }

    render() {
        return (
            <div id="app">
                <TopBar/>
                <ViewPort/>
                <SideBar/>
                <BottomPanelComponent/>
            </div>
        );
    }

}


export default App;
