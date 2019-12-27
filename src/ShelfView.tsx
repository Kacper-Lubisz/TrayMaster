import React from "react";
import {SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanel} from "./BottomPanel";
import "./styles/shelfview.scss";
import {Bay, Category, Shelf, Tray, Warehouse, Zone} from "./core/MockWarehouse";
import {Settings} from "./core/MockSettings";
import {
    faArrowDown as downArrow,
    faArrowLeft as leftArrow,
    faArrowRight as rightArrow,
    faArrowUp as upArrow,
    faClock,
    faHome,
    faTimes as cross,
    faWeightHanging
} from "@fortawesome/free-solid-svg-icons";
import Popup from "reactjs-popup";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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
type ShelfMoveDirection = "left" | "right" | "up" | "down" | "nextTray" | "previousTray" | "nextZone" | "previousZone"


interface ShelfViewProps {
    warehouse: Warehouse
    settings: Settings
}

interface ShelfViewState {
    currentKeyboard: KeyboardName
    currentShelf: Shelf; // todo allow this to be nullable, if you load a warehouse with no shelves in it
    selected: Map<Tray, boolean>;
    isNavModalOpen: boolean;
}

export class ShelfView extends React.Component<ShelfViewProps, ShelfViewState> {

    constructor(props: any) {
        super(props);

        this.state = {
            selected: new Map(),
            currentKeyboard: "category",
            currentShelf: this.props.warehouse.shelves[0],
            isNavModalOpen: true
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

        } else if (shelf === "nextTray" || shelf === "nextZone") {

            if (shelfIndex + 1 !== currentBay.shelves.length && shelf !== "nextZone") {// increment shelfIndex

                const newShelfIndex = shelfIndex + 1;
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: currentBay.shelves[newShelfIndex]
                });
            } else if (bayIndex + 1 !== currentZone.bays.length && shelf !== "nextZone") { // increment bayIndex

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
        } else if (shelf === "previousTray" || shelf === "previousZone") {

            if (shelfIndex - 1 >= 0 && shelf !== "previousZone") {// decrement shelfIndex

                const newShelfIndex = shelfIndex - 1;
                const newShelf = currentBay.shelves[newShelfIndex];
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: newShelf
                });
            } else if (bayIndex - 1 >= 0 && shelf !== "previousZone") { // decrement bayIndex

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
        } else {
            throw Error(`Unimplemented move direction ${shelf}`);
        }

    }

    /**
     * This returns the possible directions in which changeShelf can move from the specified shelf
     * @param shelf The shelf to consider movement directions from
     */
    possibleMoveDirections(shelf: Shelf): Map<ShelfMoveDirection, boolean> {
        const {
            warehouse, zone, bay, bayIndex, shelfIndex,
        } = ShelfView.currentShelfParentsAndIndices(shelf);

        return new Map([
            ["left", bayIndex - 1 !== -1],
            ["right", bayIndex + 1 !== zone.bays.length],
            ["up", shelfIndex + 1 !== bay.shelves.length],
            ["down", shelfIndex - 1 !== -1],
            ["nextTray", warehouse.shelves.length > 1],
            ["previousTray", warehouse.shelves.length > 1],
            ["nextZone", warehouse.zones.length > 1],
            ["previousZone", warehouse.zones.length > 1],
        ]);
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
        this.setState({
            ...this.state,
            isNavModalOpen: true
        });
    }

    /**
     * This method closes the navigation popover which allows for navigating between shelves
     */
    closeNavigator() {
        this.setState({
            ...this.state,
            isNavModalOpen: false
        });
    }

    render() {
        const possibleMoveDirections = this.possibleMoveDirections(this.state.currentShelf);
        return (
            <div id="shelfView">
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
                        {name: "Previous", onClick: this.changeShelf.bind(this, "previousTray")},
                        // enabled = possibleMoveDirections.previousTray
                        {name: "Next", onClick: this.changeShelf.bind(this, "nextTray")},
                        // enabled = possibleMoveDirections.nextTray
                    ]}
                    keyboards={[
                        {name: "category", icon: faHome},
                        {name: "expiry", icon: faClock},
                        {name: "weight", icon: faWeightHanging}
                    ]}
                    keyboardSwitcher={this.switchKeyboard.bind(this)}
                    currentKeyboard={this.state.currentKeyboard}
                />
                {this.renderNavigationPopup(possibleMoveDirections)}
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

    private renderNavigationPopup(possibleMoveDirections: Map<ShelfMoveDirection, boolean>) {

        // todo fixme this whooole thing needs a restyle 😉
        // the popup needs to be moved to over the navigator button

        const maxBaySize: number = this.state.currentShelf.parentWarehouse?.bays.reduce((max, current) => {
            return Math.max(max, current.shelves.length);
        }, 0) ?? 0;

        return <Popup
            open={this.state.isNavModalOpen}
            closeOnDocumentClick
            onClose={this.closeNavigator.bind(this)}
        >
            <div className="modal">
                <FontAwesomeIcon onClick={this.closeNavigator.bind(this)} icon={cross}/>

                <div id="zoneSelector" style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr"}}
                >
                    <button
                        id="previousZone"
                        onClick={this.changeShelf.bind(this, "previousZone")}
                        disabled={!possibleMoveDirections.get("previousZone")}
                    ><FontAwesomeIcon icon={leftArrow}/> Previous
                    </button>
                    <p>{this.state.currentShelf.parentZone?.name ?? "?"}</p>
                    <button
                        id="nextZone"
                        onClick={this.changeShelf.bind(this, "nextZone")}
                        disabled={!possibleMoveDirections.get("nextZone")}
                    >Next <FontAwesomeIcon icon={rightArrow}/>
                    </button>
                </div>

                <div style={{ //todo fixme this needs a complete redesign
                    display: "grid",
                    gridGap: 5,
                    marginLeft: "250px",
                    marginRight: "250px"
                }}>
                    {
                        this.state.currentShelf.parentZone?.bays.flatMap((bay, bayIndex) =>
                            bay.shelves.map((shelf, shelfIndex) =>
                                <div
                                    key={bayIndex.toString() + shelfIndex}
                                    style={{
                                        gridColumn: bayIndex + 1,
                                        gridRow: maxBaySize - shelfIndex + 1,
                                    }}
                                >
                                    <div
                                        style={{
                                            backgroundColor: this.state.currentShelf.parentZone?.color,
                                            color: getTextColourForBackground(
                                                this.state.currentShelf.parentZone?.color ?? "#ffffff"
                                            )
                                        }}
                                        className={`shelf ${this.state.currentShelf === shelf ? "currentShelf" : ""}`}
                                        onClick={this.changeShelf.bind(this, shelf)}
                                    >

                                        {bay.name} {shelf.name}
                                    </div>
                                </div>
                            )
                        )
                    }
                </div>

                <div
                    id="arrowArea"
                    style={{
                        display: "grid",
                    }}>
                    <p
                        id="arrowAreaLabel"
                        style={{
                            backgroundColor: this.state.currentShelf.parentZone?.color,
                            gridRow: 2,
                            gridColumn: 2,
                            margin: 0,
                            color: getTextColourForBackground(
                                this.state.currentShelf.parentZone?.color ?? "#ffffff"
                            )
                        }}
                    >{this.state.currentShelf.toString()}</p>

                    <button
                        id="trayUp"
                        disabled={!possibleMoveDirections.get("up")}
                        onClick={this.changeShelf.bind(this, "up")}
                        style={{
                            gridRow: 1,
                            gridColumn: 2,
                        }}
                    ><FontAwesomeIcon icon={upArrow}/></button>
                    <button
                        id="trayDown"
                        onClick={this.changeShelf.bind(this, "down")}
                        style={{
                            gridRow: 3,
                            gridColumn: 2,
                        }}
                        disabled={!possibleMoveDirections.get("down")}
                    ><FontAwesomeIcon icon={downArrow}/></button>
                    <button
                        id="trayleft"
                        onClick={this.changeShelf.bind(this, "left")}
                        style={{
                            gridRow: 2,
                            gridColumn: 1,
                        }}
                        disabled={!possibleMoveDirections.get("left")}
                    ><FontAwesomeIcon icon={leftArrow}/></button>
                    <button
                        id="trayRight"
                        onClick={this.changeShelf.bind(this, "right")}
                        style={{
                            gridRow: 2,
                            gridColumn: 3,
                        }}
                        disabled={!possibleMoveDirections.get("right")}
                    ><FontAwesomeIcon icon={rightArrow}/></button>
                </div>
                <div id="nextPrevious" style={{display: "grid"}}>
                    <button
                        id="previous"
                        onClick={this.changeShelf.bind(this, "previousTray")}
                        style={{
                            gridRow: 4,
                            gridColumn: 1,
                        }}
                        disabled={!possibleMoveDirections.get("previousTray")}
                    ><FontAwesomeIcon icon={leftArrow}/> Previous
                    </button>
                    <button
                        id="next"
                        onClick={this.changeShelf.bind(this, "nextTray")}
                        style={{
                            gridRow: 4,
                            gridColumn: 2,
                        }}
                        disabled={!possibleMoveDirections.get("nextTray")}
                    >Next <FontAwesomeIcon icon={rightArrow}/>
                    </button>
                </div>
            </div>
        </Popup>;
    }

}

/**
 * Returns whether white or black text is best given a background colour
 * Sources: https://stackoverflow.com/a/5624139 - hex to RGB
 *          https://stackoverflow.com/a/3943023 - decide what colour to use
 * @param hex - the background colour, in shorthand or full hex
 */
export function getTextColourForBackground(hex: string) {
    // This expands shorthand hex colours to full hex e.g. #DEF to #DDEEFF
    const fullHex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);

    // This implements the W3C accessibility guidelines for maintaining text contrast
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)?.slice(1, 4).map((x) => {
        let normalised = parseInt(x, 16) / 255;
        return (normalised <= 0.03928) ? (normalised / 12.92) : (((normalised + 0.055) / 1.055) ** 2.4);
    }) ?? [1, 1, 1];
    const luminance = 0.2126 * result[0] + 0.7152 * result[1] + 0.0722 * result[2];

    return (luminance > 0.1791) ? "#000000" : "#ffffff";
}
