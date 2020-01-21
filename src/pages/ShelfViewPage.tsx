import React from "react";
import {SideBar} from "../components/SideBar";
import {ViewPort, ViewPortLocation} from "../components/ViewPort";
import {BottomPanel} from "../components/BottomPanel";
import "../styles/shelfview.scss";
import {
    Bay,
    Category,
    Column,
    ExpiryRange,
    Shelf,
    Tray,
    TrayCell,
    TraySpace,
    Warehouse,
    Zone
} from "../core/WarehouseModel";
import {Settings} from "../core/Settings";
import {
    faArrowDown as downArrow,
    faArrowLeft as leftArrow,
    faArrowRight as rightArrow,
    faArrowUp as upArrow,
    faCheckCircle as tickSolid,
    faClock,
    faCommentAlt,
    faEraser,
    faHome,
    faTimes as cross,
    faWeightHanging
} from "@fortawesome/free-solid-svg-icons";

import {faCheckCircle as tickRegular} from "@fortawesome/free-regular-svg-icons";
// todo fixme decide if to replace this icon, if this icon is removed then remove this package too
import Popup from "reactjs-popup";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

import {RouteComponentProps, withRouter} from "react-router-dom";
import {properMod} from "../utils/properMod";
import App, {Dialog, DialogButtons, DialogTitle} from "../core/App";
import {ToolBar} from "../components/ToolBar";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";


/**
 * Defines possible keyboard names
 */
export type KeyboardName = "category" | "expiry" | "weight" | "edit-shelf";

/**
 * The directions in which you can navigate
 */
type ShelfMoveDirection =
    "left"
    | "right"
    | "up"
    | "down"
    | "next"
    | "nextShelf"
    | "previousShelf"
    | "nextZone"
    | "previousZone";

interface ShelfViewProps {
    /**
     * This function allows for opening new dialogs.
     * @param dialog A dialog builder function which takes the function that closes the dialog.
     */
    openDialog: (dialog: Dialog) => void;
    warehouse: Warehouse;
    settings: Settings;
}

interface ShelfViewState {
    currentKeyboard: KeyboardName;
    currentView: ViewPortLocation;
    selected: Map<TrayCell, boolean>;
    draftWeight?: string;
    isEditShelf: boolean;
    isNavModalOpen: boolean;
}

class ShelfViewPage extends React.Component<RouteComponentProps & ShelfViewProps, ShelfViewState> {

    constructor(props: any) {
        super(props);

        this.state = {
            selected: new Map(),
            currentKeyboard: "category",
            currentView: (() => {
                if (this.props.warehouse.zones.length === 0) {
                    return this.props.warehouse;
                } else if (this.props.warehouse.shelves.length === 0) {
                    return this.props.warehouse.zones[0];
                } else {
                    return this.props.warehouse.shelves[0];
                }
            })(),
            draftWeight: undefined,
            isEditShelf: false,
            isNavModalOpen: false // change this to true when editing NavModal
        };
    }

    /**
     * This is a callback which is callable by child components and sets the current selection
     * @param newMap The map of trays to their selection
     * @param callback A callback to call after setting the selection
     */
    private setSelected(newMap: Map<TrayCell, boolean>, callback?: ((() => void) | undefined)): void {
        this.setState({
            ...this.state,
            selected: newMap
        }, callback);
    }

    /**
     * Returns if a tray is selected
     * @param tray A tray or tray space to be tested
     */
    private isTrayCellSelected(tray: TrayCell): boolean {
        return this.state.selected.get(tray) ?? false;
    }

    /**
     * This method changes the current shelf that is displayed in shelf view.  The shelf can be changed to a specific
     * shelf or can derive a new shelf from the current shelf and a direction.  The method throws an error if the
     * direction can't be moved in.  If moving to another zone the method will choose the first shelf or otherwise
     * set the view to the zone itself (if no shelves available)
     * @param direction The shelf to move to or otherwise the direction in which to move.
     */
    private changeView(direction: ShelfMoveDirection | Shelf): void {

        if (direction instanceof Shelf) { // to specific shelf
            this.setState({
                ...this.state,
                selected: new Map(),
                currentView: direction
            });
            return;
        } else if (direction === "next") { // decide if next zone or shelf

            if (this.state.currentView instanceof Zone) {
                this.changeView("nextZone");
            } else if (this.state.currentView instanceof Shelf) {
                this.changeView("nextShelf");
            } else {
                throw Error("Can't change view in direction 'next' when looking at a warehouse");
            }

        } else if (this.state.currentView instanceof Warehouse) {
            throw Error("Trying to navigate an empty warehouse");
            // this can't be navigated and ought not to happen

        } else if (this.state.currentView instanceof Zone && (
            direction === "left" || direction === "right" ||
            direction === "up" || direction === "down" ||
            direction === "nextShelf" || direction === "previousShelf"
        )) {
            throw Error("These move directions are not possible when the current view is a Zone");

        } else if (this.state.currentView instanceof Zone) { // if we're moving from a zone
            const increment = direction === "nextZone" ? 1 : -1; // only nextZone or previousZone possible

            const zoneIndex = this.props.warehouse.zones.indexOf(this.state.currentView);
            const newZoneIndex = properMod(zoneIndex + increment, this.props.warehouse.zones.length);
            const newZone = this.props.warehouse.zones[newZoneIndex];

            if (newZone.bays.length === 0) {
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentView: newZone
                });
            } else {
                const newBay = newZone.bays[0];
                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentView: newBay.shelves.length === 0 ? newZone
                                                             : newBay.shelves[0]

                });
            }
        } else { // moving from a shelf
            const
                currentShelf = this.state.currentView,
                currentBay: Bay = currentShelf.parent,
                currentZone: Zone = currentBay.parent,
                shelfIndex: number = currentShelf.index,
                bayIndex: number = currentBay.index,
                zoneIndex: number = currentZone.indexInParent;

            if (direction === "up" || direction === "down") { // vertical

                const increment = direction === "up" ? 1 : -1;
                const newShelfIndex: number = shelfIndex + increment;

                if (newShelfIndex < 0 || newShelfIndex >= currentBay.shelves.length) {
                    return;
                }

                this.setState({
                    ...this.state,
                    selected: new Map(),
                    currentView: currentBay.shelves[newShelfIndex]
                });

            } else if (direction === "left" || direction === "right") { // horizontal

                const increment = direction === "right" ? 1 : -1;
                const newBayIndex: number = bayIndex + increment;

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
                    currentView: currentZone.bays[newBayIndex].shelves[newShelfIndex]
                });

            } else {
                // "nextShelf", "previousShelf", "nextZone", "previousZone"
                // cyclic, inc/dec shelf -> bay -> zone
                const increment = direction === "nextShelf" || direction === "nextZone" ? 1 : -1;
                const isZone = direction === "nextZone" || direction === "previousZone";

                if (shelfIndex + increment !== currentBay.shelves.length &&
                    shelfIndex + increment !== -1 && !isZone) {// increment shelfIndex

                    const newShelfIndex = shelfIndex + increment;
                    this.setState({
                        ...this.state,
                        selected: new Map(),
                        currentView: currentBay.shelves[newShelfIndex]
                    });
                } else if (bayIndex + increment !== currentZone.bays.length
                    && bayIndex + increment !== -1 && !isZone) { // increment bayIndex

                    const newBay = currentZone.bays[bayIndex + increment];
                    const newShelfIndex = direction === "nextShelf" ? 0
                                                                    : newBay.shelves.length - 1;

                    this.setState({
                        ...this.state,
                        selected: new Map(),
                        currentView: newBay.shelves.length === 0 ? currentZone
                                                                 : newBay.shelves[newShelfIndex]
                    });
                } else { // increment zone

                    const newZone = currentZone.parent.zones[properMod(zoneIndex + increment,
                        currentZone.parent.zones.length)];

                    if (newZone.bays.length === 0) {
                        this.setState({
                            ...this.state,
                            selected: new Map(),
                            currentView: newZone
                        });
                    } else {
                        const bayIndex = increment === 1 ? 0
                                                         : newZone.bays.length - 1;
                        const newBay = newZone.bays[bayIndex];

                        const newShelfIndex = increment === 1 ? 0
                                                              : newBay.shelves.length - 1;

                        this.setState({
                            ...this.state,
                            selected: new Map(),
                            currentView: newBay.shelves.length === 0 ? newZone
                                                                     : newBay.shelves[newShelfIndex]
                        });
                    }
                }
            }
        }
    }

    /**
     * This returns the possible directions in which changeShelf can move from the specified shelf
     * @param location The location to consider movement directions from
     */
    private possibleMoveDirections(location: ViewPortLocation): Map<ShelfMoveDirection, boolean> {

        if (location instanceof Warehouse) {
            return new Map();
        } else if (location instanceof Zone) {
            const numberOfZones = this.props.warehouse.zones.length;
            return new Map<ShelfMoveDirection, boolean>([
                ["nextZone", numberOfZones > 1],
                ["previousZone", numberOfZones > 1]
            ]);
        }

        return new Map([
            ["left", location.parentBay.index - 1 !== -1],
            ["right", location.parentBay.index + 1 !== location.parentZone.bays.length],
            ["up", location.index + 1 !== location.parentBay.shelves.length],
            ["down", location.index - 1 !== -1],
            ["nextShelf", location.parentWarehouse.shelves.length > 1],
            ["previousShelf", location.parentWarehouse.shelves.length > 1],
            ["nextZone", location.parentWarehouse.zones.length > 1],
            ["previousZone", location.parentWarehouse.zones.length > 1],
        ]);
    }

    /**
     * Returns all cells in the current view
     */
    private getTrayCells(): TrayCell[] {
        return this.state.currentView instanceof Shelf ? this.state.currentView.cells : [];
    }

    /**
     * This provisionally gets all selected TrayCells _before they're converted to Trays_ and
     * without any side effects or manipulating state. This is important for BottomPanel's keyboards to know the number
     * of TrayCells selected, and for expiry keyboard to highlight active year, and for ViewPort to know whether still
     * in multiselect. It simply returns all selected TrayCells, including air spaces.
     */
    private getSelectedTrayCells(): TrayCell[] {
        return this.getTrayCells().filter(cell => this.state.selected.get(cell));
    }

    /**
     * This method returns a list of selected trays.  The method has the option to fill selected tray spaces with new
     * empty trays.  The method has an option to ignore selected spaces which are in the air.  The method ensures that
     * replaced spaces are deselected and new trays are selected, this causes setState to be called and thus causes a
     * repaint to follow after the triggering handler is finished.
     * @param fillSpaces If spaces are to be filled
     * @param ignoreAirSpaces If air trays are to be ignored
     */
    private getSelectedTrays(
        fillSpaces: boolean,
        ignoreAirSpaces: boolean
    ): Tray[] {

        const selectedCells = this.state.currentView.columns
                                  .flatMap(column => column.getPaddedTrays())
                                  .filter(cell => this.state.selected.get(cell));

        const {
            trays, spaces
        } = this.splitCells(selectedCells);

        if (fillSpaces) {
            const newSelection = new Map(this.state.selected);
            const newTrays = spaces.map(space => {
                if (!ignoreAirSpaces || space.index === space.column.trays.length) {
                    const newTray = Tray.create(
                        space.column,
                        space.index,
                        undefined,
                        undefined,
                        undefined);
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
    private splitCells(selectedCells: TrayCell[]): { trays: Tray[]; spaces: TraySpace[] } {
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
    private onCategorySelected(category: Category): void {

        this.getSelectedTrays(true, true).forEach((tray) => {
            tray.category = category;
        });
        this.forceUpdate();

    }

    /**
     * This method is called when an expiry is selected on the expiry keyboard
     * @param expiry The expiry that is selected
     */
    private onExpirySelected(expiry: ExpiryRange): void {

        this.getSelectedTrays(true, true).forEach((tray) => {
            tray.expiry = expiry;
        });
        this.forceUpdate();

    }

    /**
     * Updates state's draftWeight. Called by typing on the weight keyboard
     * @param newDraftWeight
     */
    private setDraftWeight(newDraftWeight?: string): void {
        this.setState({
            ...this.state,
            draftWeight: newDraftWeight
        });
    }

    /**
     * Applies the draftWeight to the selected trays. Called when Enter is clicked on the weight keyboard
     */
    private applyDraftWeight(): void {

        this.getSelectedTrays(true, true).forEach((tray) => {
            tray.weight = isNaN(Number(this.state.draftWeight)) ? undefined : Number(this.state.draftWeight);
        });
        this.forceUpdate();

    }

    /**
     * This method changes the current BottomPanel keyboard
     * @see BottomPanel
     * @param newKeyboard The new keyboard
     */
    private switchKeyboard(newKeyboard: KeyboardName): void {
        this.setState({
            ...this.state,
            currentKeyboard: newKeyboard,
            draftWeight: "0"
        });
    }

    /**
     * This method enters edit shelf mode
     */
    private enterEditShelf(): void {
        this.setState({
            ...this.state,
            isEditShelf: !this.state.isEditShelf
        });
        // todo
        // throw Error("Unimplemented method stub");
    }

    /**
     * This method adds a new column to the current shelf and is called when the add column button is pressed.
     * @param shelf The shelf in question
     */
    private addColumn(shelf: Shelf): void {
        shelf.columns.push(Column.create(
            shelf.columns.length,
            this.props.warehouse.traySizes[1], //fixme set a default
            3,
            shelf
        ));
        this.forceUpdate();
    }

    /**
     * This method is called when edit shelf mode is exited and the changes are not rolled back
     * @param shelf The shelf in question
     */
    private finaliseEditShelf(shelf: Shelf): void {
        shelf.columns.forEach(column => { // remove trays over max height
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
     * @param shelf The shelf in question
     */
    private discardEditShelf(shelf: Shelf): void {

        //todo unimplemented
        this.finaliseEditShelf(shelf);
    }


    /**
     * This method opens the navigation popover which allows for navigating between shelves
     */
    private openNavigator(): void {
        this.setState({
            ...this.state,
            isNavModalOpen: true
        });
    }

    /**
     * This method closes the navigation popover which allows for navigating between shelves
     */
    private closeNavigator(): void {
        this.setState({
            ...this.state,
            isNavModalOpen: false
        });
    }

    /**
     * This method removes all the trays that are currently selected
     */
    private clearTrays(): void {
        const newSelectedMap = new Map(this.state.selected);

        const reindexColumns = new Set<Column>();
        this.state.selected.forEach((selected, tray) => {
            if (selected) {
                newSelectedMap.set(tray, false);
                if (tray instanceof Tray) {
                    const trayIndex = tray.parentColumn.trays.indexOf(tray);
                    tray.parentColumn.trays.splice(trayIndex, 1);
                    reindexColumns.add(tray.parentColumn);
                }
            }
        });
        reindexColumns.forEach((column) => {
            column.trays.forEach((tray, index) => tray.index = index);
        });

        this.setSelected(newSelectedMap);
    }

    /**
     * Sets the selection of all trays and tray spaces in the shelf.  If
     * @param select if all should be  selected or deslected
     */
    private selectAll(select: "none" | "trays" | "all"): void {
        if (this.state.currentView instanceof Shelf) {
            if (select === "none") {
                this.setSelected(new Map());
            } else if (select === "trays") {
                this.setSelected(new Map(this.getTrayCells()
                                             .filter(cell => cell instanceof Tray)
                                             .map(tray => [tray, true])));
            } else { // all
                this.setSelected(new Map(this.getTrayCells()
                                             .map(tray => [tray, true])));
            }
        } else {
            throw Error("Select/Deselect all can't be performed while not looking at a shelf");
        }
    }

    /**
     * Opens a popup which allows for editing the custom field
     */
    private editTrayComment(): void {

        if (this.getSelectedTrayCells().length === 1) {

            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => <EditCommentContent
                    onDiscard={close}
                    draft={this.getSelectedTrays(false, false)[0].comment ?? null}
                    onSubmit={(comment) => {
                        this.getSelectedTrays(false, false)[0].comment = comment ?? undefined;
                        close();
                    }}
                />
            });
        } else {
            throw Error("Multiple comments can't be set at the same time, maybe they should be");
        }

    }

    render(): React.ReactNode {
        const possibleMoveDirections = this.possibleMoveDirections(this.state.currentView);

        const zoneColor: string = (() => {
            if (this.state.currentView instanceof Zone) {
                return this.state.currentView.color;
            } else if (this.state.currentView instanceof Shelf) {
                return this.state.currentView.parentZone.color;
            } else {
                return "#ffffff";
            }
        })();

        const locationString = this.state.currentView.toString();

        return <>
            <div id="shelfView" className={this.state.isEditShelf ? "isEditShelf" : ""}>
                <ViewPort
                    selected={this.state.selected}
                    setSelected={this.setSelected.bind(this)}
                    isTraySelected={this.isTrayCellSelected.bind(this)}
                    selectedTrayCells={this.getSelectedTrayCells()}

                    current={this.state.currentView}
                    isShelfEdit={this.state.isEditShelf}
                />
                <ToolBar
                    disabled={this.state.isEditShelf}
                    toolbar={[
                        (() => {
                            const selected = this.getSelectedTrayCells();

                            if (selected.length === 0 || (selected.every(cell => cell instanceof Tray)
                                && this.getTrayCells().filter(cell => cell instanceof Tray).length !== selected.length)) {
                                return {
                                    name: "Select Trays",
                                    icon: tickRegular,
                                    onClick: this.selectAll.bind(this, "trays")
                                };
                            } else if (selected.length === this.getTrayCells().length) {
                                return {
                                    name: "Deselect All",
                                    icon: tickSolid,
                                    onClick: this.selectAll.bind(this, "none")
                                };
                            } else {
                                return {
                                    name: "Select All",
                                    icon: tickSolid,
                                    onClick: this.selectAll.bind(this, "all")
                                };
                            }
                        })(),
                        {
                            name: "Edit Custom",
                            icon: faCommentAlt,
                            onClick: this.editTrayComment.bind(this),
                            disabled: this.getSelectedTrays(false, false).length !== 1
                        },
                        {
                            name: "Clear Trays",
                            icon: faEraser,
                            onClick: this.clearTrays.bind(this),
                            disabled: this.getSelectedTrayCells().length === 0
                        },
                        { /*This code adds a button which opens a test dialog*/
                            name: "Test Error", onClick: this.props.openDialog.bind(undefined,
                                App.buildErrorDialog("this is a big test", true)
                            )
                        }

                    ]}/>
                <SideBar
                    zoneColor={zoneColor}
                    locationString={locationString}
                    buttons={this.state.isEditShelf && this.state.currentView instanceof Shelf ? [
                        {name: "Add Column", onClick: this.addColumn.bind(this, this.state.currentView)},
                        {name: "Cancel", onClick: this.discardEditShelf.bind(this, this.state.currentView)},
                        {name: "Save", onClick: this.finaliseEditShelf.bind(this, this.state.currentView)},
                    ] : [ // Generate sidebar buttons
                        {name: "Settings", onClick: () => this.props.history.push("/settings")},
                        {name: "Home", onClick: () => this.props.history.push("/menu")},
                        {name: "Edit Shelf", onClick: this.enterEditShelf.bind(this)},
                        {name: "Navigator", onClick: this.openNavigator.bind(this)}, // disable if view is a
                                                                                     // warehouse
                        // enabled = possibleMoveDirections.previousTray
                        {name: "Next", onClick: this.changeView.bind(this, "next")},
                        // enabled = possibleMoveDirections.nextTray
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
                    categories={this.props.warehouse.categories}
                    categorySelected={this.onCategorySelected.bind(this)}
                    expirySelected={this.onExpirySelected.bind(this)}
                    draftWeight={this.state.draftWeight}
                    setDraftWeight={this.setDraftWeight.bind(this)}
                    applyDraftWeight={this.applyDraftWeight.bind(this)}
                    keyboardState={this.state.isEditShelf ? "edit-shelf" : this.state.currentKeyboard}
                    selectedTrayCells={this.getSelectedTrayCells()}
                />

            </div>
            {!(this.state.currentView instanceof Warehouse) &&
            this.renderNavigationPopup(this.state.currentView, possibleMoveDirections)
            }
        </>;

    }

    /**
     * This method draws creates the elements of the navigation popup
     * @param currentView The current vie wof the shelf view, limited to Zone or Shelf
     * @param possibleMoveDirections The possible directions in which the current view can be moved.
     */
    private renderNavigationPopup(
        currentView: Zone | Shelf,
        possibleMoveDirections: Map<ShelfMoveDirection, boolean>
    ): React.ReactNode {
        // the popup needs to be moved to over the navigator button

        const zone = currentView instanceof Zone ? currentView
                                                 : currentView.parentZone;

        return <Popup
            open={this.state.isNavModalOpen}
            position='right center'
            closeOnDocumentClick
            onClose={this.closeNavigator.bind(this)}
        >
            <div className="nav-modal">
                <button id="nav-close-btn" onClick={this.closeNavigator.bind(this)}>
                    <FontAwesomeIcon icon={cross}/>
                </button>

                {/* Top zone selector */}
                <div id="nav-zone-select">
                    <button
                        id="previousZone"
                        onClick={this.changeView.bind(this, "previousZone")}
                        disabled={!possibleMoveDirections.get("previousZone")}
                    >
                        <FontAwesomeIcon icon={leftArrow}/> &nbsp; Previous
                    </button>
                    <p className="centerText">{`${zone.name} Zone`}</p>
                    <button
                        id="nextZone"
                        onClick={this.changeView.bind(this, "nextZone")}
                        disabled={!possibleMoveDirections.get("nextZone")}
                    >
                        Next &nbsp; <FontAwesomeIcon icon={rightArrow}/>
                    </button>
                </div>

                {/* Grid of shelves in zone */}
                <div id="nav-zone">{
                    zone.bays.length ? (() => {
                        const textColor = getTextColorForBackground(zone.color);
                        return zone.bays.flatMap((bay, bayIndex) =>
                            <div className="nav-bay" key={bayIndex}>
                                {bay.shelves.map((shelf, shelfIndex) =>
                                    <div key={`${bayIndex.toString()}_${shelfIndex.toString()}`}
                                         className={classNames("nav-shelf", {
                                             "currentShelf": this.state.currentView === shelf
                                         })} style={{
                                        backgroundColor: zone.color,
                                        color: textColor,
                                        border: `1px solid ${textColor}`
                                    }}
                                         onClick={this.changeView.bind(this, shelf)}
                                    >
                                        <p className="shelfLabel">{bay.name}{shelf.name}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })() : <h3>This zone has no bays</h3>
                }</div>

                {/* Arrow grid */}
                <div id="nav-arrow-area">
                    {this.state.currentView instanceof Shelf ?
                     <p
                         id="arrow-area-label"
                         style={{
                             backgroundColor: zone.color,
                             color: getTextColorForBackground(zone.color)
                         }}
                     >{`Current Shelf: ${this.state.currentView.toString()}`}</p> : undefined
                    }

                    <button id="shelf-up"
                            className="nav-arrow-btn"
                            disabled={!possibleMoveDirections.get("up")}
                            onClick={this.changeView.bind(this, "up")}
                    >
                        <FontAwesomeIcon icon={upArrow}/>
                    </button>
                    <button id="shelf-down"
                            className="nav-arrow-btn"
                            onClick={this.changeView.bind(this, "down")}
                            disabled={!possibleMoveDirections.get("down")}
                    >
                        <FontAwesomeIcon icon={downArrow}/>
                    </button>
                    <button id="shelf-left"
                            className="nav-arrow-btn"
                            onClick={this.changeView.bind(this, "left")}
                            disabled={!possibleMoveDirections.get("left")}
                    >
                        <FontAwesomeIcon icon={leftArrow}/>
                    </button>
                    <button id="shelf-right"
                            className="nav-arrow-btn"
                            onClick={this.changeView.bind(this, "right")}
                            disabled={!possibleMoveDirections.get("right")}
                    >
                        <FontAwesomeIcon icon={rightArrow}/>
                    </button>

                    {/* Next and previous shelf buttons */}
                    <button id="nav-previous"
                            className="nav-prev-next-btn"
                            onClick={this.changeView.bind(this, "previousShelf")}
                            disabled={!possibleMoveDirections.get("previousShelf")}
                    >
                        Previous Shelf
                    </button>
                    <button id="nav-next"
                            className="nav-prev-next-btn"
                            onClick={this.changeView.bind(this, "nextShelf")}
                            disabled={!possibleMoveDirections.get("nextShelf")}
                    >
                        Next Shelf
                    </button>
                </div>
            </div>
        </Popup>;
    }

}

type EditCommentDialogState = { draft: string | null };
type EditCommentDialogProps = {
    onDiscard: () => void;
    onSubmit: (draft: string | null) => void;
} & EditCommentDialogState;

/**
 * This is the the content of the dialog which is shown when the comment on a tray is being edited
 */
class EditCommentContent extends React.Component<EditCommentDialogProps, EditCommentDialogState> {
    constructor(props: EditCommentDialogProps) {
        super(props);
        this.state = {draft: this.props.draft};
    }

    render(): React.ReactElement {
        return <>
            <DialogTitle title="Edit Comment"/>
            <form onSubmit={() => this.props.onSubmit(this.state.draft)}>
                <input
                    type="text"
                    onChange={(event) => {
                        this.setState({
                            draft: event.target.value.length === 0 ? null : event.target.value
                        });
                    }}
                    value={this.state.draft ?? ""}
                /></form>
            <DialogButtons buttons={[
                {
                    name: "Discard", buttonProps: {
                        onClick: this.props.onDiscard,
                        style: {borderColor: "red"}
                    }
                }, {
                    name: "Done", buttonProps: {
                        onClick: () => this.props.onSubmit(this.state.draft),
                        style: {borderColor: "red"}
                    }
                }
            ]}/>
        </>;
    }
}


export default withRouter(ShelfViewPage);