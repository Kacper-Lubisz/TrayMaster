import React from "react";
import {TopBar} from "./TopBar";
import {SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanel} from "./BottomPanel";
import "./styles/shelfview.scss";
import {Bay, Category, Column, Shelf, Tray, TrayCell, TraySpace, Warehouse, Zone} from "./core/MockWarehouse";
import {Settings} from "./core/MockSettings";
import {faClock, faHome, faWeightHanging} from "@fortawesome/free-solid-svg-icons";

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
export type KeyboardName = "category" | "expiry" | "weight" | "edit-shelf";

/**
 * The directions in which you can navigate
 */
type ShelfMoveDirection = "left" | "right" | "up" | "down" | "next" | "previous"

interface ShelfViewProps {
    warehouse: Warehouse;
    settings: Settings;
}

interface ShelfViewState {
    currentKeyboard: KeyboardName;
    currentShelf: Shelf; // todo allow this to be nullable, if you load a warehouse with no shelves in it
    selected: Map<TrayCell, boolean>;
    isEditShelf: boolean;
}

export class ShelfView extends React.Component<ShelfViewProps, ShelfViewState> {

    constructor(props: any) {
        super(props);

        this.state = {
            selected: new Map(),
            currentKeyboard: "category",
            currentShelf: this.props.warehouse.shelves[0],
            isEditShelf: false
        };
    }

    /**
     * This is a callback which is callable by child components and sets the current selection
     * @param newMap The map of trays to their selection
     * @param callback A callback to call after setting the selection
     */
    public setSelected(newMap: Map<TrayCell, boolean>, callback?: ((() => void) | undefined)) {
        this.setState({
            ...this.state,
            selected: newMap
        }, callback);
    }

    /**
     * Returns if a tray is selected
     * @param tray A tray or tray space to be tested
     */
    public isTrayCellSelected(tray: TrayCell) {
        return this.state.selected.get(tray);
    }

    /**
     * Returns whether the there are multiple selected trays
     */
    public areMultipleTraysSelected() {
        const currSelected = Array.from(this.state.selected.entries())
                                  .filter(([_, selected]) => selected);
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

        } else if (shelf === "next" || shelf === "previous") { // cyclic, inc/dec shelf -> bay -> zone
            const increment = shelf === "next" ? 1
                                               : -1;

            if (shelfIndex + increment !== currentBay.shelves.length &&
                shelfIndex + increment !== -1) {// increment shelfIndex

                const newShelfIndex = shelfIndex + increment;
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: currentBay.shelves[newShelfIndex]
                });
            } else if (bayIndex + increment !== currentZone.bays.length
                && bayIndex + increment !== -1) { // increment bayIndex

                const newBay = currentZone.bays[bayIndex + increment];
                const newShelfIndex = shelf === "next" ? 0
                                                       : newBay.shelves.length - 1;

                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentShelf: newBay.shelves[newShelfIndex]
                    // fixme ensure that this bay has shelves
                    // the best solution would be to store the bay and have the shelf view display a message saying:
                    // "this bay doesn't have any shelves yet"
                });
            } else { // increment zone

                const newZone = warehouse.zones[properMod(zoneIndex + increment, warehouse.zones.length)];
                const newBay = newZone.bays[shelf === "next" ? 0
                                                             : newZone.bays.length - 1];
                const newShelf = newBay.shelves[shelf === "next" ? 0
                                                                 : newBay.shelves.length - 1];

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

    // getSelectedAirSpaces(): TraySpace[] {
    //
    //     const selectedCells = this.state.currentShelf.columns
    //                               .flatMap(column => column.getPaddedTrays())
    //                               .filter(cell => this.state.selected.get(cell));
    //
    //     const {
    //         trays, spaces
    //     } = this.splitCells(selectedCells);
    //
    //
    //     return spaces.reduce((acc, space) => { // should already be sorted
    //         // this reduce filters away any floating trays
    //         if (space.index === acc[0] + space.column.trays.length) {
    //             acc[1].push(space);
    //         }
    //         return acc;
    //     }, [0, []] as [number, TraySpace[]])[1];
    //
    // }

    /**
     * This method returns a list of selected trays.  The method has the option to fill selected tray spaces with new
     * empty trays.  The method has an option to ignore selected spaces which are in the air.  The method ensures that
     * replaced spaces are deselected and new trays are selected, this causes setState to be called and thus causes a
     * repaint to follow after the triggering handler is finished.
     * @param fillSpaces If spaces are to be filled
     * @param ignoreAirSpaces If air trays are to be ignored
     */
    getSelectedTrays(
        fillSpaces: boolean,
        ignoreAirSpaces: boolean
    ): Tray[] {

        const selectedCells = this.state.currentShelf.columns
                                  .flatMap(column => column.getPaddedTrays())
                                  .filter(cell => this.state.selected.get(cell));

        const {
            trays, spaces
        } = this.splitCells(selectedCells);

        if (fillSpaces) {
            const newSelection = new Map(this.state.selected);
            const newTrays = spaces.map(space => {
                if (!ignoreAirSpaces || space.index === space.column.trays.length) {
                    let newTray = Tray.create(
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        space.index,
                        space.column);
                    space.column.trays.push(newTray);
                    newSelection.set(newTray, true);
                    newSelection.delete(space);
                    return newTray;
                } else {
                    return undefined;
                }
            }).filter(tray => tray) as Tray[];

            this.setSelected(newSelection);
            return trays.concat(newTrays);
        } else {
            return trays;
        }
    }

    /**
     * This splits a list of TrayCells into a list of trays and spaces
     * @param selectedCells The list to split
     */
    private splitCells(selectedCells: TrayCell[]): { trays: Tray[], spaces: TraySpace[] } {
        return selectedCells.reduce((acc, cell) => {
            if (cell instanceof Tray) {
                acc.trays.push(cell);
            } else {
                acc.spaces.push(cell);
            }
            return acc;
        }, {trays: [] as Tray[], spaces: [] as TraySpace[]});
    }

    /**
     * This method is called when a category is selected on the category keyboard
     * @param category The category that is selected
     */
    categorySelected(category: Category) {

        this.getSelectedTrays(true, true).forEach((tray) => {
            tray.category = category;
        });
        this.forceUpdate();
        // this updates because get selected Trays causes an update after the click event is handled

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
        this.setState({
            ...this.state,
            isEditShelf: !this.state.isEditShelf
        });
        // todo
        // throw Error("Unimplemented method stub");
    }

    /**
     * This method adds a new column to the current shelf and is called when the add column button is pressed.
     */
    addColumn() {
        this.state.currentShelf.columns.push(Column.create(
            [],
            this.state.currentShelf.columns.length,
            this.state.currentShelf,
            this.props.warehouse.columnSizes[1], //fixme set a default
            3
        ));
        this.forceUpdate();
    }

    /**
     * This method is called when edit shelf mode is exited and the changes are not rolled back
     */
    finaliseEditShelf() {

        this.state.currentShelf.columns.forEach(column => { // remove trays over max height
            if (column.maxHeight) {
                const traysToPop = Math.max(column.trays.length - column.maxHeight, 0);
                column.trays.splice(column.trays.length - traysToPop - 1, traysToPop).forEach(removed =>
                    this.state.selected.delete(removed)
                );

            }
        });

        this.setState({
            ...this.state,
            isEditShelf: !this.state.isEditShelf
        });
    }

    /**
     * This method is called when edit shelf mode is exited and the changes **are** rolled back
     */
    discardEditShelf() {

        //todo unimplemented
        this.finaliseEditShelf();
    }


    /**
     * This method opens the navigation popover which allows for navigating between shelves
     */
    openNavigator() {
        throw Error("Unimplemented method stub");
    }

    /**
     * This method removes all the trays that are currently selected
     */
    clearTrays() {
        const newSelectedMap = new Map(this.state.selected ?? new Map<Tray, boolean>());

        const reindexColumns = new Set<Column>();
        this.state.selected.forEach((selected, tray) => {
            if (selected) {
                newSelectedMap.set(tray, false);
                if (tray instanceof Tray) {
                    const column = tray.parentColumn;
                    if (!column) throw Error("Tray has no parent column");

                    const trayIndex = column.trays.indexOf(tray);
                    column.trays.splice(trayIndex, 1);

                    reindexColumns.add(column);

                }
            }
        });
        reindexColumns.forEach((column) => {
            column.trays.forEach((tray, index) => tray.index = index);
        });

        this.setSelected(newSelectedMap);
    }

    render() {
        return (
            <div id="shelfView">
                <TopBar zoneColour={this.state.currentShelf.parentZone?.color}
                        locationString={this.state.currentShelf.toString()}/>
                <ViewPort
                    selected={this.state.selected}
                    setSelected={this.setSelected.bind(this)}
                    isTraySelected={this.isTrayCellSelected.bind(this)}
                    areMultipleTraysSelected={this.areMultipleTraysSelected.bind(this)}

                    shelf={this.state.currentShelf}
                    isShelfEdit={this.state.isEditShelf}
                />
                <SideBar
                    buttons={this.state.isEditShelf ? [
                        {name: "Add Column", onClick: this.addColumn.bind(this)},
                        {name: "Cancel", onClick: this.discardEditShelf.bind(this)},
                        {name: "Save", onClick: this.finaliseEditShelf.bind(this)},
                    ] : [ // Generate sidebar buttons
                        {name: "Settings", onClick: () => alert("Settings")},
                        {name: "Back", onClick: () => alert("Back")},
                        {name: "Clear Trays", onClick: this.clearTrays.bind(this)},
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
                    showKeyboardSwitcher={!this.state.isEditShelf}
                    currentKeyboard={this.state.currentKeyboard}
                />

                <BottomPanel
                    categories={this.props.warehouse.categories.map((category) => {
                        return {
                            name: category.shortName ?? category.name,
                            onClick: this.categorySelected.bind(this, category)
                        };
                    })}
                    keyboardState={this.state.isEditShelf ? "edit-shelf" : this.state.currentKeyboard}
                    //fixme move this edit state to change current keyboard
                />
            </div>
        );

    }

}
