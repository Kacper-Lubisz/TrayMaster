import React from "react";
import {TopBar} from "./TopBar";
import {SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanel} from "./BottomPanel";
import "./styles/shelfview.scss";
import {faClock, faHome, faWeightHanging} from "@fortawesome/free-solid-svg-icons";
import {Bay, Shelf, Tray, Warehouse, Zone} from "./core/WarehouseModel/MockWarehouseModel";
import {Settings} from "./core/Settings/Settings";
import {Category} from "./core/WarehouseModel/Category";

/**
 * Proper modulo function (gives a non-negative remainder as per mathematical definition)
 * @param dividend - the number that is being divided
 * @param divisor - the number to divide by
 * @returns the non-negative remainder
 */
function properMod(dividend: number, divisor: number): number {
    return ((dividend % divisor) + divisor) % divisor;
}

/**
 * Defines possible keyboard names
 */
export type KeyboardName = "category" | "expiry" | "weight";

/**
 * The directions in which you can navigate
 */
type ShelfMoveDirection = "left" | "right" | "up" | "down" | "next" | "previous"


interface ShelfViewProps {
    warehouse: Warehouse
    settings: Settings
}

interface ShelfViewState {
    currentKeyboard: KeyboardName
    currentShelf: Shelf; // todo allow this to be nullable, if you load a warehouse with no shelves in it
    selected: Map<Tray, boolean>;
}

export class ShelfView extends React.Component<ShelfViewProps, ShelfViewState> {

    constructor(props: any) {
        super(props);

        this.state = {
            selected: new Map(),
            currentKeyboard: "category",
            currentShelf: this.props.warehouse.shelves[0],
        };
    }

    public setSelected(newMap: Map<Tray, boolean>, callback?: ((() => void) | undefined)) {
        this.setState({
            ...this.state,
            selected: newMap
        }, callback);
    }

    public isTraySelected(tray: Tray) {
        return this.state.selected.get(tray);
    }

    public areMultipleTraysSelected() {
        const currSelected = Array.from(this.state.selected.entries())
                                  .filter(([_, value]) => value);
        return currSelected.length > 1;
    }

    /**
     * This method returns all the parents of a shelf and the indices of all of them within each other
     * @param shelf The shelf in question
     */
    private static currentShelfParentsAndIndices(shelf: Shelf) { // return type implied
        const warehouse: Warehouse | undefined = shelf.parentWarehouse;
        const zone: Zone | undefined = shelf.parentZone;
        const bay: Bay | undefined = shelf.parentBay;

        if (!bay || !zone || !warehouse) {
            throw Error("Failed to get parent (either bay, zone or warehouse) of current shelf");
            //todo ensure that this is not nullable
        }

        const zoneIndex = warehouse?.zones.indexOf(zone); // this is never null, it returns -1 if it can't be found
        const bayIndex = zone?.bays.indexOf(bay);
        const shelfIndex = bay?.shelves.indexOf(shelf);
        // this might need changing if these lists become unsorted

        if (zoneIndex === undefined || bayIndex === undefined || shelfIndex === undefined) {

            throw Error("Failed to get the indices of children from warehouse to current shelf (zone, bay or, shelf)");
            //todo ensure that this is not nullable
        }

        return {
            warehouse: warehouse,
            zone: zone,
            bay: bay,
            zoneIndex: zoneIndex,
            bayIndex: bayIndex,
            shelfIndex: shelfIndex
        };

    }

    /**
     * This method changes the current shelf that is displayed in shelf view.  The shelf can be changed to a specific
     * shelf or can derive a new shelf from the current shelf and a direction.  The method does nothing if the direction
     * can't be moved in.
     * @param shelf The shelf to move to or otherwise the direction in which to move.
     */
    changeShelf(shelf: ShelfMoveDirection | Shelf) {

        if (shelf instanceof Shelf) {
            this.setState({
                ...this.state,
                selected: new Map(),
                currentShelf: shelf
            });
            return;
        }

        const {
            warehouse, zone: currentZone, bay: currentBay,
            zoneIndex, bayIndex, shelfIndex,
        } = ShelfView.currentShelfParentsAndIndices(this.state.currentShelf);

        if (shelf === "up" || shelf === "down") { // vertical
            const isUp = shelf === "up";

            const newShelfIndex: number = shelfIndex + (isUp ? 1 : -1);
            if (newShelfIndex < 0 || newShelfIndex >= currentBay.shelves.length) {
                return;
            }

            this.setState({
                ...this.state,
                selected: new Map(),
                currentShelf: currentBay.shelves[newShelfIndex]
            });

        } else if (shelf === "left" || shelf === "right") { // horizontal
            const isRight = shelf === "right";

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
                selected: new Map(),
                currentShelf: currentZone.bays[newBayIndex].shelves[newShelfIndex]
            });

        } else if (shelf === "next") {

            if (shelfIndex + 1 !== currentBay.shelves.length) {// increment shelfIndex

                const newShelfIndex = shelfIndex + 1;
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: currentBay.shelves[newShelfIndex]
                });
            } else if (bayIndex + 1 !== currentZone.bays.length) { // increment bayIndex

                const newBayIndex = bayIndex + 1;
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: currentZone.bays[newBayIndex].shelves[0]
                    // fixme ensure that this bay has shelves
                    // the best solution would be to store the bay and have the shelf view display a message saying:
                    // "this bay doesn't have any shelves yet"
                });
            } else { // increment zone

                const newZoneIndex = (zoneIndex + 1) % warehouse.zones.length;
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: warehouse.zones[newZoneIndex].bays[0].shelves[0]
                    // fixme ensure that this zone has bays and this bay has shelves
                });
            }
        } else if (shelf === "previous") {

            if (shelfIndex - 1 >= 0) {// decrement shelfIndex

                const newShelfIndex = shelfIndex - 1;
                const newShelf = currentBay.shelves[newShelfIndex];
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: newShelf
                });
            } else if (bayIndex - 1 >= 0) { // decrement bayIndex

                const newBayIndex = bayIndex - 1;
                const newBay = currentZone.bays[newBayIndex];
                // Go to last shelf in that bay
                const newShelf = newBay.shelves[newBay.shelves.length - 1];
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: newShelf
                    // fixme ensure that this bay has shelves
                    // the best solution would be to store the bay and have the shelf view display a message saying:
                    // "this bay doesn't have any shelves yet"
                });
            } else { // decrement zone, looping back around if necessary
                const newZoneIndex = properMod(zoneIndex - 1, warehouse.zones.length);
                const newZone = warehouse.zones[newZoneIndex];
                // Go to last bay in that zone
                const newBay = newZone.bays[newZone.bays.length - 1];
                // Go to last shelf in that bay
                const newShelf = newBay.shelves[newBay.shelves.length - 1];
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: newShelf
                    // fixme ensure that this zone has bays and this bay has shelves
                });
            }
        }
    }

    /**
     * This returns the possible directions in which changeShelf can move from the specified shelf
     * @param shelf The shelf to consider movement directions from
     */
    possibleMoveDirections(shelf: Shelf): ShelfMoveDirection[] {
        const {
            warehouse, zone, bay, bayIndex, shelfIndex,
        } = ShelfView.currentShelfParentsAndIndices(shelf);

        const possibleDirections: ShelfMoveDirection[] = [];

        // this could potentially be slow
        if (warehouse.shelves.length > 1) possibleDirections.push("next", "previous");
        if (shelfIndex + 1 !== bay.shelves.length) possibleDirections.push("up");
        if (shelfIndex - 1 !== -1) possibleDirections.push("down");
        if (bayIndex + 1 !== zone.bays.length) possibleDirections.push("right");
        if (bayIndex - 1 !== -1) possibleDirections.push("left");

        return possibleDirections;

    }

    /**
     * This method is called when a category is selected on the category keyboard
     * @param category The category that is selected
     */
    categorySelected(category: Category) {
        this.state.selected.forEach((selected, tray) => {
            if (selected) {
                tray.category = category;
            }
        });
        this.forceUpdate();
    }

    /**
     * This method changes the current BottomPanel keyboard
     * @see BottomPanel
     * @param newKeyboard The new keyboard
     */
    switchKeyboard(newKeyboard: KeyboardName) {
        this.setState({
            ...this.state,
            currentKeyboard: newKeyboard
        });
    }

    /**
     * This method enters edit shelf mode
     */
    enterEditShelf() {
        throw Error("Unimplemented method stub");
    }

    /**
     * This method opens the navigation popover which allows for navigating between shelves
     */
    openNavigator() {
        throw Error("Unimplemented method stub");
    }

    render() {
        return (
            <div id="shelfView">
                <TopBar zoneColour={this.state.currentShelf.parentZone?.color}
                        locationString={this.state.currentShelf.toString()}/>
                <ViewPort selected={this.state.selected} setSelected={this.setSelected.bind(this)}
                          isTraySelected={this.isTraySelected.bind(this)}
                          areMultipleTraysSelected={this.areMultipleTraysSelected.bind(this)}
                          shelf={this.state.currentShelf}/>
                <SideBar
                    buttons={[ // Generate sidebar buttons
                        {name: "Settings", onClick: () => alert("Settings")},
                        {name: "Back", onClick: () => alert("Back")},
                        {name: "Edit Shelf", onClick: this.enterEditShelf.bind(this)},
                        {name: "Navigator", onClick: this.openNavigator.bind(this)},
                        {name: "Previous", onClick: this.changeShelf.bind(this, "previous")},
                        {name: "Next", onClick: this.changeShelf.bind(this, "next")},
                    ]}
                    keyboards={[
                        {name: "category", icon: faHome},
                        {name: "expiry", icon: faClock},
                        {name: "weight", icon: faWeightHanging}
                    ]}
                    keyboardSwitcher={this.switchKeyboard.bind(this)}
                    currentKeyboard={this.state.currentKeyboard}
                />

                <BottomPanel
                    categories={this.props.warehouse.categories.map((category) => {
                        return {
                            name: category.shortName ?? category.name,
                            onClick: this.categorySelected.bind(this, category)
                        };
                    })}
                    keyboardState={this.state.currentKeyboard}
                />
            </div>
        );

    }

}
