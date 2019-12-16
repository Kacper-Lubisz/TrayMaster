import React from "react";
import {TopBar} from "./TopBar";
import {KeyboardName, SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanelComponent} from "./BottomPanelComponent";
import "./styles/shelfview.scss";
import {Column, Tray} from "./core/Warehouse";

interface ShelfViewState {
    currentKeyboard: KeyboardName
}

export class ShelfView extends React.Component<any, ShelfViewState> {

    constructor(props: any) {
        super(props);

        this.state = {
            currentKeyboard: "category"
        };
    }


    switchKeyboard(id: KeyboardName) {
        this.setState({
            ...this.state,
            currentKeyboard: id
        });
    }

    render() {

        let category = {name: "Beans"};
        let expiry = {
            from: new Date().getTime(),
            to: new Date().getTime(),
            label: "2020",
            color: "#ff0"
        };
        let weight: number = 10.1;

        let trayA = new Tray(category, expiry, weight, "CUSTOM FIELD");
        let trayB = new Tray(category, expiry, weight);

        let bigBoyTray = new Tray({
            name: "BeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeans"
        }, expiry, weight);

        const columns = [
            new Column([
                new Tray(category, expiry, weight),
                trayA,
                new Tray(category, expiry, weight),
                new Tray(category, expiry, weight)
            ]),
            new Column([
                new Tray(category, expiry, weight),
                new Tray(category, expiry, weight),
                new Tray(category, expiry, weight)
            ]),
            new Column(Array(4).fill(0).map(() => { // todo test this on large numbers of trays
                return new Tray(category, expiry, weight);
            })),
            new Column([
                new Tray(category, expiry, weight),
                new Tray(category, expiry, weight),
                trayB,
                bigBoyTray
                // fixme This doesn't work, the style needs fixing for big trays 😉
            ]),
        ];
        // todo derive the columns to feed to the viewport from the shelf view state

        return (
            <div id="shelfView">
                <TopBar/>
                <ViewPort columns={columns}/>
                <SideBar keyboardSwitcher={this.switchKeyboard.bind(this)}/>
                <BottomPanelComponent keyboardState={this.state.currentKeyboard}/>
            </div>
        );
    }

}


export default ShelfView;