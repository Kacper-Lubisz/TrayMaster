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

    changeShelf(direction: ShelfMoveDirection) {

        const warehouse: Warehouse | undefined = this.state.currentShelf.parentWarehouse;
        const currentZone: Zone | undefined = this.state.currentShelf.parentZone;
        const currentBay: Bay | undefined = this.state.currentShelf.parentBay;

        if (!currentBay || !currentZone || !warehouse) {
            throw Error("Failed to get parent (either bay, zone or warehouse) of current shelf");
            //todo ensure that this is not nullable
        }

        const zoneIndex = warehouse?.zones.indexOf(currentZone);
        const bayIndex = currentZone?.bays.indexOf(currentBay);
        const shelfIndex = currentBay?.shelves.indexOf(this.state.currentShelf);
        // this might need changing if these lists become unsorted

        if (direction === "up" || direction === "down") {
            const isUp = direction === "up";

            const newShelfIndex: number = shelfIndex + (isUp ? 1 : -1);
            if (newShelfIndex < 0 || newShelfIndex >= currentBay.shelves.length) {
                return;
            }

            this.setState({
                ...this.state,
                currentShelf: currentBay.shelves[newShelfIndex]
            });

        } else if (direction === "left" || direction === "right") {
            const isRight = direction === "right";

            const newBayIndex: number = bayIndex + (isRight ? 1 : -1);
            if (newBayIndex < 0 || newBayIndex >= currentZone.bays.length) {
                return;
            }

            const newShelfIndex: number = Math.max(Math.min(
                shelfIndex,
                currentZone.bays[newBayIndex].shelves.length - 1),
                0
            );
            this.setState({
                ...this.state,
                currentShelf: currentZone.bays[newBayIndex].shelves[newShelfIndex]
            });
        } else if (direction === "next") {
            if (shelfIndex + 1 !== currentBay.shelves.length) {// increment shelfIndex
                const newShelfIndex = shelfIndex + 1;
                this.setState({
                    ...this.state,
                    currentShelf: currentBay.shelves[newShelfIndex]
                });
            } else if (bayIndex + 1 !== currentZone.bays.length) { // increment bayIndex
                const newBayIndex = bayIndex + 1;
                this.setState({
                    ...this.state,
                    currentShelf: currentZone.bays[newBayIndex].shelves[0]
                    // fixme ensure that this bay has shelves
                });
            } else { // increment zone
                const newZoneIndex = (zoneIndex + 1) % warehouse.zones.length;
                this.setState({
                    ...this.state,
                    currentShelf: warehouse.zones[newZoneIndex].bays[0].shelves[0]
                    // fixme ensure that this zone has bays and this bay has shelves
                });
            }
        }
    }

    possibleMoveDirections(): ShelfMoveDirection[] {

        return ["next"];
    }

    switchKeyboard(id: KeyboardName) {
        this.setState({
            ...this.state,
            currentKeyboard: id
        });
    }

    render() {
        return (
            <div id="shelfView">
                <TopBar locationString={this.state.currentShelf.toString()}/>
                <ViewPort shelf={this.state.currentShelf}/>
                <SideBar buttons={[ // Generate sidebar buttons
                    {
                        name: "Settings", onClick: () => {
                            alert("Settings");
                        }
                    }, {
                        name: "Back", onClick: () => {
                            alert("Back");
                        }
                    }, {
                        name: "Edit Shelf", onClick: () => {
                            alert("Edit Shelf");
                        }
                    }, {
                        name: "Navigator", onClick: () => {
                            alert("Navigator");
                        }
                    },
                    {name: "Next", onClick: this.changeShelf.bind(this, "next")},
                ]} keyboardSwitcher={this.switchKeyboard.bind(this)}/>
                <BottomPanelComponent keyboardState={this.state.currentKeyboard}/>
            </div>
        );

    }

}
