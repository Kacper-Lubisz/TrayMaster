import React from "react";
import {TopBar} from "./TopBar";
import {KeyboardName, SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanelComponent} from "./BottomPanelComponent";
import "./styles/shelfview.scss";
import {Bay, Shelf, Warehouse, Zone} from "./core/MockWarehouse";
import {Settings} from "./core/MockSettings";


interface ShelfViewProps {
    warehouse: Warehouse
    settings: Settings
}

interface ShelfViewState {
    currentKeyboard: KeyboardName
    currentShelf: Shelf; // todo allow this to be nullable, if you load a warehouse with no shelves in it
}

type ShelfMoveDirection = "left" | "right" | "up" | "down" | "next"

export class ShelfView extends React.Component<ShelfViewProps, ShelfViewState> {

    constructor(props: any) {
        super(props);

        this.state = {
            currentKeyboard: "category",
            currentShelf: this.props.warehouse.shelves[0],
        };
    }

    changeShelf(direction: ShelfMoveDirection): ShelfMoveDirection[] | null {

        const currentWarehouse: Warehouse | undefined = this.state.currentShelf.parentWarehouse;
        const currentZone: Zone | undefined = this.state.currentShelf.parentZone;
        const currentBay: Bay | undefined = this.state.currentShelf.parentBay;

        if (!currentBay || !currentZone || !currentWarehouse) {
            throw Error("Failed to get parent (either bay, zone or warehouse) of current shelf");
            //todo ensure that this is not nullable
        }

        const zoneIndex = currentWarehouse?.zones.indexOf(currentZone);
        const bayIndex = currentZone?.bays.indexOf(currentBay);
        const shelfIndex = currentBay?.shelves.indexOf(this.state.currentShelf);

        if (direction === "up" || direction === "down") {
            const isUp = direction === "up";
            const newShelfIndex: number = shelfIndex + (isUp ? 1 : -1);

            if (newShelfIndex < 0 || newShelfIndex >= currentBay.shelves.length) {
                return null;
            }
            this.setState({
                ...this.state,
                currentShelf: currentBay.shelves[newShelfIndex]
            });

        } else if (direction === "left" || direction === "right") {
            const isRight = direction === "right";
            const newBayIndex: number = bayIndex + (isRight ? 1 : -1);
            const newShelfIndex: number = shelfIndex;

            if (newBayIndex < 0 || newBayIndex >= currentZone.bays.length) {
                return null;
            }
            this.setState({
                ...this.state,
                currentShelf: currentBay.shelves[newShelfIndex]
            });
        } else if (direction === "next") {

        }

        return [];
    }


    switchKeyboard(id: KeyboardName) {
        this.setState({
            ...this.state,
            currentKeyboard: id
        });
    }

    render() {
        return (
            <div id="app">
                <TopBar locationString={this.state.currentShelf.toString()}/>
                <ViewPort shelf={this.state.currentShelf}/>
                <SideBar keyboardSwitcher={this.switchKeyboard.bind(this)}/>
                <BottomPanelComponent keyboardState={this.state.currentKeyboard}/>
                {/*todo connect up the categories in warehouse */}
            </div>
        );

    }

}
