import {faCheckCircle as tickEmpty} from "@fortawesome/free-regular-svg-icons";
import {
    faArrowLeft as leftArrow,
    faArrowRight as rightArrow,
    faCalculator as weightIcon,
    faCheckCircle as tickSolid,
    faClock as expiryIcon,
    faCog as settingsIcon,
    faCube as categoryIcon,
    faHome as menuIcon,
    faInfo,
    faTimes as cross
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {reduce} from "lodash";
import React from "react";

import {RouteComponentProps, withRouter} from "react-router-dom";
import Popup from "reactjs-popup";
import {BottomPanel} from "../components/BottomPanel";
import {buildErrorDialog, Dialog, DialogButtons, DialogTitle} from "../components/Dialog";
import {SideBar, SideBarButtonProps} from "../components/SideBar";
import {ViewPort, ViewPortLocation} from "../components/ViewPort";
import {ZoneDisplayComponent} from "../components/ZoneDisplayComponent";
import firebase, {User} from "../core/Firebase";
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
    WarehouseModel,
    Zone
} from "../core/WarehouseModel";
import Utils from "../core/WarehouseModel/Utils";
import {CancellablePromise, makeCancellable} from "../utils/cancellablePromise";
import {getTextColorForBackground} from "../utils/colorUtils";
import {
    CategoryAlteration,
    CommentAlteration,
    ExpiryAlteration,
    WeightAlteration
} from "../utils/generateKeyboardButtons";
import {toExpiryRange} from "../utils/getExpiryColor";
import {properMod} from "../utils/properMod";
import {byNullSafe, composeSorts} from "../utils/sortsUtils";
import {FindQuery, SortBy} from "./FindPage";
import "./styles/shelfview.scss";

/**
 * Defines possible keyboard names
 */
export type KeyboardName = "category" | "expiry" | "weight" | "custom" | "edit-shelf";

export const MAX_MAX_COLUMN_HEIGHT = 20;
export const MAX_MAX_SHELF_WIDTH = 8;

/**
 * The directions in which you can navigate
 */
type ShelfMoveDirection =
    "nextShelf"
    | "previousShelf"
    | "nextZone"
    | "previousZone";

export type SimpleExpiryRange = { year: number } & ({ quarter: number } | { month: number } | {});

export interface ShelfViewProps {
    /**
     * This function allows for opening new dialogs.
     * @param dialog A dialog builder function which takes the function that closes the dialog.
     */
    openDialog: (dialog: Dialog) => void;
    setFind: (query: FindQuery) => void;
    warehouse: Warehouse;
    user: User;
    currentView: ViewPortLocation;
    setCurrentView: (newView: ViewPortLocation) => void;
}

interface ShelfViewState {
    currentKeyboard: KeyboardName;
    selected: Map<TrayCell, boolean>;
    weight?: string;
    isEditShelf: boolean;
    isNavModalOpen: boolean;
}

class ShelfViewPage extends React.Component<RouteComponentProps & ShelfViewProps, ShelfViewState> {

    static cancellablePromises: Set<CancellablePromise<any>> = new Set();

    static registerCancellable(cancellable: CancellablePromise<any>): void {

        ShelfViewPage.cancellablePromises.add(cancellable);

        cancellable.promise.then(() => {
            ShelfViewPage.cancellablePromises.delete(cancellable);
        }).catch();
    }

    static cancelAllPendingPromises(): void {
        ShelfViewPage.cancellablePromises.forEach((cancellable) => {
            cancellable.cancel();
        });
        ShelfViewPage.cancellablePromises.clear();
    }

    componentWillUnmount(): void {
        super.componentWillUnmount?.();
        ShelfViewPage.cancelAllPendingPromises();
    }

    constructor(props: any) {
        super(props);

        this.state = {
            selected: new Map(),
            currentKeyboard: this.props.user.useCustomKeyboard ? "custom" : "category",
            weight: undefined,
            isEditShelf: false,
            isNavModalOpen: false, // change this to true when editing NavModal
        };
    }

    /**
     * This is a callback which is callable by child components and sets the current selection
     * @param newMap The map of trays to their selection
     * @param callback A callback to call after setting the selection
     */
    private setSelected(newMap: Map<TrayCell, boolean>, callback?: ((() => void) | undefined)): void {
        this.setState(state => {

            const selectedCells = Array.from(newMap)
                                       .filter(([cell, selected]) => selected && cell instanceof Tray)
                                       .map(([cell, _]) => cell);

            const newWeight: string | undefined = (() => {
                if (selectedCells.length === 1) {
                    const selected: TrayCell = selectedCells[0];
                    if (selected instanceof Tray && selected.weight) {
                        return String(selected.weight);
                    }
                }
                return undefined;
            })();

            return {
                ...state,
                selected: newMap,
                weight: newWeight
            };
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
     * shelf or can derive a new shelf from the current shelf and a direction.  The method opens an error dialog if the
     * direction can't be moved in.  If moving to another zone the method will choose the first shelf or otherwise
     * set the view to the zone itself (if no shelves available)
     * @param direction The shelf to move to or otherwise the direction in which to move.
     */
    private changeView(direction: ShelfMoveDirection | Shelf): void {
        if (direction instanceof Shelf) { // to specific shelf
            const cancellable = makeCancellable(direction.load(true, WarehouseModel.tray));
            cancellable.promise.then(() => {
                this.forceUpdate();
            }).catch(reason => {
                if (reason === "cancelled") {
                    console.warn("Loading promise cancelled");
                } else {
                    this.props.openDialog(buildErrorDialog("Failed to load shelf", reason.toString(), true));
                }
            });
            ShelfViewPage.cancelAllPendingPromises();
            ShelfViewPage.registerCancellable(cancellable);

            this.setState(state => {
                this.props.setCurrentView(direction);
                return {
                    ...state,
                    selected: new Map(),
                };
            });
            return;
        } else if (this.props.currentView instanceof Warehouse) {
            return;
            // this can't be navigated and ought not to happen

        } else if (this.props.currentView instanceof Zone && (
            direction === "nextShelf" || direction === "previousShelf"
        )) {
            return;

        } else if (this.props.currentView instanceof Zone) { // if we're moving from a zone
            const increment = direction === "nextZone" ? 1 : -1; // only nextZone or previousZone possible

            const zoneIndex = this.props.currentView.index;
            const newZoneIndex = properMod(zoneIndex + increment, this.props.warehouse.zones.length);
            const newZone = this.props.warehouse.zones[newZoneIndex];

            if (newZone.bays.length === 0) {
                this.setState(state => {
                    this.props.setCurrentView(newZone);
                    return {
                        ...state,
                        selected: new Map()
                    };
                });
            } else {
                const newBay = newZone.bays[0];
                this.setState(state => {
                    this.props.setCurrentView(newBay.shelves.length === 0 ? newZone
                                                                          : newBay.shelves[0]);
                    return {
                        ...state,
                        selected: new Map(),
                    };
                });

                if (!newBay.shelves.length) {
                    const cancellable = makeCancellable(newBay.shelves[0].load(true, WarehouseModel.tray));
                    cancellable.promise.then(() => {
                        this.forceUpdate();
                    }).catch(reason => {
                        if (reason === "cancelled") {
                            console.warn("Loading promise cancelled");
                        } else {
                            this.props.openDialog(buildErrorDialog("Failed to load shelf", reason.toString(), true));
                        }
                    });
                    ShelfViewPage.cancelAllPendingPromises();
                    ShelfViewPage.registerCancellable(cancellable);
                }
            }
        } else { // moving from a shelf
            const
                currentShelf = this.props.currentView,
                currentBay: Bay = currentShelf.parent,
                currentZone: Zone = currentBay.parent,
                shelfIndex: number = currentShelf.index,
                bayIndex: number = currentBay.index,
                zoneIndex: number = currentZone.index;

            // "nextShelf", "previousShelf", "nextZone", "previousZone"
            // cyclic, inc/dec shelf -> bay -> zone
            const increment = direction === "nextShelf" || direction === "nextZone" ? 1 : -1;
            const isZone = direction === "nextZone" || direction === "previousZone";

            if (shelfIndex + increment !== currentBay.shelves.length &&
                shelfIndex + increment !== -1 && !isZone) {// increment shelfIndex

                const newShelfIndex = shelfIndex + increment;

                this.setState(state => {
                    this.props.setCurrentView(currentBay.shelves[newShelfIndex]);
                    return {
                        ...state,
                        selected: new Map(),
                    };
                });

                const cancellable = makeCancellable(currentBay.shelves[newShelfIndex].load(true, WarehouseModel.tray));
                cancellable.promise.then(() => {
                    this.forceUpdate();
                }).catch(reason => {
                    if (reason === "cancelled") {
                        console.warn("Loading promise cancelled");
                    } else {
                        this.props.openDialog(buildErrorDialog("Failed to load shelf", reason.toString(), true));
                    }
                });
                ShelfViewPage.cancelAllPendingPromises();
                ShelfViewPage.registerCancellable(cancellable);

            } else if (bayIndex + increment !== currentZone.bays.length
                && bayIndex + increment !== -1 && !isZone) { // increment bayIndex

                const newBay = currentZone.bays[bayIndex + increment];
                const newShelfIndex = direction === "nextShelf" ? 0
                                                                : newBay.shelves.length - 1;

                this.setState(state => {
                    this.props.setCurrentView(
                        newBay.shelves.length === 0 ? currentZone : newBay.shelves[newShelfIndex]
                    );
                    return {
                        ...state,
                        selected: new Map()
                    };
                });

                if (newBay.shelves.length) {
                    const cancellable = makeCancellable(newBay.shelves[newShelfIndex].load(true, WarehouseModel.tray));
                    cancellable.promise.then(() => {
                        this.forceUpdate();
                    }).catch(reason => {
                        if (reason === "cancelled") {
                            console.warn("Loading promise cancelled");
                        } else {
                            this.props.openDialog(buildErrorDialog("Failed to load shelf", reason.toString(), true));
                        }
                    });
                    ShelfViewPage.cancelAllPendingPromises();
                    ShelfViewPage.registerCancellable(cancellable);
                }
            } else { // increment zone

                const newZone = currentZone.parent.zones[properMod(zoneIndex + increment,
                    currentZone.parent.zones.length)];

                if (newZone.bays.length === 0) {
                    this.setState(state => {
                        this.props.setCurrentView(newZone);
                        return {
                            ...state,
                            selected: new Map(),
                        };
                    });
                } else {
                    const bayIndex = increment === 1 ? 0 : newZone.bays.length - 1;
                    const newBay = newZone.bays[bayIndex];

                    const newShelfIndex = increment === 1 ? 0 : newBay.shelves.length - 1;

                    this.setState(state => {
                        this.props.setCurrentView(
                            newBay.shelves.length === 0 ? newZone : newBay.shelves[newShelfIndex]
                        );
                        return {
                            ...state,
                            selected: new Map()
                        };
                    });

                    if (newBay.shelves.length) {
                        const cancellable = makeCancellable(newBay.shelves[newShelfIndex].load(true, WarehouseModel.tray));
                        cancellable.promise.then(() => {
                            this.forceUpdate();
                        }).catch(reason => {
                            if (reason === "cancelled") {
                                console.warn("Loading promise cancelled");
                            } else {
                                this.props.openDialog(buildErrorDialog("Failed to load shelf", reason.toString(), true));
                            }
                        });
                        ShelfViewPage.cancelAllPendingPromises();
                        ShelfViewPage.registerCancellable(cancellable);
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
        return this.props.currentView instanceof Shelf ? this.props.currentView.cells : [];
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
     * @param callback This callback is invoked after the new selection is set
     */
    private getSelectedTrays(
        fillSpaces: boolean,
        ignoreAirSpaces: boolean,
        callback?: () => void
    ): Tray[] {

        const selectedCells = this.props.currentView.columns
                                  .flatMap(column => column.getPaddedTrays())
                                  .filter(cell => this.state.selected.get(cell));

        const {
            trays, spaces
        } = this.splitCells(selectedCells);

        if (fillSpaces) {
            const newSelection = new Map(this.state.selected);
            const newTrays = spaces.map(space => {
                if (!ignoreAirSpaces || space.index === space.parentColumn.trays.length) {
                    const newTray = Tray.create(
                        space.parentColumn,
                        undefined,
                        undefined,
                        undefined);
                    newSelection.set(newTray, true);
                    newSelection.delete(space);
                    return newTray;
                } else {
                    return undefined;
                }
            }).filter(tray => tray) as Tray[];

            this.setSelected(newSelection, callback);
            return trays.concat(newTrays);
        } else {
            return trays;
        }
    }

    private applyAndAdvance(
        fillSpaces: boolean,
        ignoreAirSpaces: boolean,
        modify: (tray: Tray) => void,
    ): void {

        const trays = this.getSelectedTrays(fillSpaces, ignoreAirSpaces, () => {

            trays.forEach(tray => modify(tray));
            this.setSelected(this.advanceSelection(this.state.selected));

            this.props.currentView.stage(false, true, WarehouseModel.tray).then(_ => _);

        });

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
     * This method selects the next cell or tray after the current selection
     * @param selection The selection to be mutated
     * @return The mutated selection
     */
    private advanceSelection(selection: Map<TrayCell, boolean>): Map<TrayCell, boolean> {

        const mode = this.props.user.autoAdvanceMode;

        if (mode === null) {
            return selection;
        }

        const comparison = composeSorts<TrayCell>([
            byNullSafe<TrayCell>(cell => cell.parentColumn.index, false, false),
            byNullSafe<TrayCell>(cell => cell.index, false, false)
        ]);

        const selected: TrayCell[] = Array.from(selection.entries())
                                          .filter(([_, selected]) => selected)
                                          .map(([cell, _]) => cell);

        if (selected.length !== 1 && this.props.user.onlySingleAutoAdvance) {
            return selection;
        }

        const keyboardsNeeded: KeyboardName[] = (() => {

            const first = selected[0];
            if (first instanceof Tray) {

                const possible: (KeyboardName | null)[] = this.props.user.useCustomKeyboard ? [
                    (((mode.category && first.category === undefined) || (mode.expiry && first.expiry === undefined)))
                    ? "custom" : null,
                    (mode.weight && first.weight === undefined && this.state.currentKeyboard !== "weight") ? "weight"
                                                                                                           : null
                ] : [
                    (mode.category && first.category === undefined && this.state.currentKeyboard !== "category")
                    ? "category" : null,
                    (mode.expiry && first.expiry === undefined && this.state.currentKeyboard !== "expiry")
                    ? "expiry" : null,
                    (mode.weight && first.weight === undefined && this.state.currentKeyboard !== "weight")
                    ? "weight" : null
                ];
                return possible.filter((kb: KeyboardName | null): kb is KeyboardName => kb !== null);

            } else {
                return (this.props.user.useCustomKeyboard ? [
                    "custom", "weight"
                ] : [
                    "category", "expiry", "weight"
                ]) as KeyboardName[];
            }
        })();

        if (keyboardsNeeded.length === 0) {

            const possible: (KeyboardName | null)[] = this.props.user.useCustomKeyboard ? [
                (mode.category || mode.expiry) ? "custom" : null,
                mode.weight ? "weight" : null
            ] : [
                mode.category ? "category" : null,
                mode.expiry ? "expiry" : null,
                mode.weight ? "weight" : null
            ];
            this.switchKeyboard(possible.filter((kb: KeyboardName | null): kb is KeyboardName => kb !== null)[0]);
        } else {
            this.switchKeyboard(keyboardsNeeded[0]);
            return selection;
        }

        const furthestSelected = selected.reduce((max, cur) => {
            if (max && comparison(max, cur) !== 1) {
                return max;
            } else {
                return cur;
            }
        }, undefined as (TrayCell | undefined));

        if (furthestSelected) {

            const columnIndex = furthestSelected.parentColumn.index;

            const trayIndex = furthestSelected.index;

            const shelf = furthestSelected instanceof Tray ? furthestSelected.parentShelf
                                                           : furthestSelected.parentColumn.parentShelf;

            const currentCellsLength = shelf.columns[columnIndex].getPaddedTrays().length;

            if (currentCellsLength !== trayIndex + 1) {
                return new Map<TrayCell, boolean>([
                    [shelf.columns[columnIndex].getPaddedTrays()[trayIndex + 1], true]
                ]);

            } else if (shelf.columns.length !== columnIndex + 1) {
                const nextColumn = reduce(shelf.columns, (acc, cur) => {

                    const cellLength = cur.getPaddedTrays().length;

                    if (!acc && cellLength !== 0 && cur.index > columnIndex) {
                        return cur;
                    } else {
                        return acc;
                    }
                }, null as (null | Column));

                if (nextColumn) {
                    return new Map<TrayCell, boolean>([
                        [nextColumn.getPaddedTrays()[0], true]
                    ]);
                } else { // this is an erroneous state
                    return selection;
                }
            } else {
                const cells = shelf.cells;
                if (cells.length === 0) {
                    return selection;
                } else {
                    return new Map<TrayCell, boolean>([
                        [cells[0], true]
                    ]);
                }

            }

        } else {
            return selection;
        }

    }

    /**
     * This method changes the current BottomPanel keyboard
     * @see BottomPanel
     * @param newKeyboard The new keyboard
     */
    private switchKeyboard(newKeyboard: KeyboardName): void {
        this.setState(state => ({
            ...state,
            currentKeyboard: newKeyboard
        }));
    }

    /**
     * This method enters edit shelf mode
     */
    private enterEditShelf(): void {
        this.setState(state => ({
            ...state,
            isEditShelf: !this.state.isEditShelf
        }));
    }

    /**
     * This method adds a new column to the current shelf and is called when the add column button is pressed.
     * @param shelf The shelf in question
     */
    private addColumn(shelf: Shelf): void {
        if (shelf.columns.length < MAX_MAX_SHELF_WIDTH) {
            Column.create(3, shelf);
            this.forceUpdate();
        }
    }

    /**
     * This method is called when a column is to be removed
     * @param column The column to remove
     */
    private async removeColumn(column: Column): Promise<void> {
        try {

            await column.delete(true);
            this.forceUpdate();

        } catch (e) {
            this.props.openDialog(buildErrorDialog("Failed to remove columns", e.toString(), true));
        }
    }

    /**
     * This method is called when edit shelf mode is exited and the changes are not rolled back
     * @param shelf The shelf in question
     */
    private async finaliseEditShelf(shelf: Shelf): Promise<void> {
        try {

            shelf.columns.forEach(column => { // remove trays over max height
                if (column.maxHeight) {
                    const traysToPop = Math.max(column.trays.length - column.maxHeight, 0);
                    column.trays.slice(column.trays.length - 1 - traysToPop, column.trays.length - 1).forEach(removed => {
                        this.state.selected.delete(removed);
                        removed.delete(true);
                    });
                }
            });

            this.setState(state => ({
                ...state,
                isEditShelf: !this.state.isEditShelf
            }));

            await shelf.stage(false, true, WarehouseModel.column);

        } catch (e) {
            this.props.openDialog(buildErrorDialog("Failed to save changes", e.toString(), true));
        }
    }

    /**
     * This method is called when edit shelf mode is exited and the changes **are** rolled back
     * @param shelf The shelf in question
     */
    // private async discardEditShelf(shelf: Shelf): Promise<void> {
    //
    // }


    /**
     * This method opens the navigation popover which allows for navigating between shelves
     */
    private openNavigator(): void {
        this.setState(state => ({
            ...state,
            isNavModalOpen: true
        }));
    }

    /**
     * This method closes the navigation popover which allows for navigating between shelves
     */
    private closeNavigator(): void {
        this.setState(state => ({
            ...state,
            isNavModalOpen: false
        }));
    }

    /**
     * This method removes all the trays that are currently selected
     */

    private async clearTrays(): Promise<void> {
        try {

            const columnMap: Map<Column, TrayCell[]> = new Map();
            this.getSelectedTrayCells().forEach(cell => {
                if (columnMap.has(cell.parentColumn)) {
                    columnMap.get(cell.parentColumn)?.push(cell);
                } else {
                    columnMap.set(cell.parentColumn, [cell]);
                }
            });

            const newSelectedMap = new Map(this.state.selected);
            Array.from(columnMap.entries()).forEach(([column, cells]) => {

                if (this.props.user.clearAboveSelection) {
                    const bottomCellIndex = cells.reduce((prev, current) => {
                        if (prev === null) {
                            return current;
                        } else if (prev.index > current.index) {
                            return current;
                        } else {
                            return prev;
                        }
                    }, cells[0]).index;

                    for (let i = column.trays.length - 1; i >= 0; i--) {
                        const tray = column.trays[i];
                        if (tray.index >= bottomCellIndex) {
                            newSelectedMap.set(tray, false);
                            tray.delete(true);
                        }
                    }
                } else {
                    cells.forEach(cell => {
                        if (cell instanceof Tray) {
                            newSelectedMap.set(cell, false);
                            cell.delete(true);
                        }
                    });
                }

            });

            this.setSelected(newSelectedMap);

            await this.props.currentView.stage(false, true, WarehouseModel.tray);

        } catch (e) {
            this.props.openDialog(buildErrorDialog("Failed to save changes", e.toString(), true));
        }
    }

    /**
     * Sets the selection of all trays and tray spaces in the shelf.  If
     * @param select if all should be  selected or deselected
     */
    private selectAll(select: "none" | "trays" | "all"): void {
        if (this.props.currentView instanceof Shelf) {
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
     * Opens a popup of tray information
     */
    private trayInfo(): void {

        this.props.openDialog({
            closeOnDocumentClick: true,
            dialog: (close: () => void) => {
                const trays = this.getSelectedTrayCells();
                return <TrayInfoContent
                    onDiscard={close}
                    draft={trays.length === 1 && trays[0] instanceof Tray ? trays[0].comment ?? null : null}
                    numberOfTrays={trays.length}
                    blame={trays.length === 1 && trays[0] instanceof Tray ? trays[0].blame : undefined}
                    lastModified={trays.length === 1 && trays[0] instanceof Tray ? trays[0].lastModified : undefined}
                    onSubmit={(comment) => {
                        this.getSelectedTrays(true, false).forEach(tray => {
                                tray.comment = comment ?? undefined;
                            }
                        );
                        this.props.currentView.stage(false, true, WarehouseModel.tray).then();
                        close();
                    }}
                />;
            }
        });

    }

    /**
     * This method performs a find for the categories of the currently selected trays
     */
    private makeFind(): void {

        const catSet = new Set(this.getSelectedTrays(false, false)
                                   .map(tray => tray.category ?? null)
                                   .filter((cat): cat is Category => cat !== null));
        this.props.setFind({
            categories: catSet.size ? catSet : null,
            weight: null,
            commentSubstring: null,
            excludePickingArea: false,
            sort: {orderAscending: true, type: SortBy.expiry}

        });

        this.props.history.push("/find");
    }

    /**
     * This method finds the expiry range start year which all selected trays have in common, if no year is in common
     * then undefined.
     */
    private getCommonRange(): ExpiryRange | undefined {
        const traysOnly = this.splitCells(this.getSelectedTrayCells()).trays;
        const firstExp = traysOnly.find(i => i.expiry !== undefined)?.expiry;

        return firstExp !== undefined && traysOnly.every(item =>
            item.expiry && item.expiry === firstExp
        ) ? firstExp : undefined;
    }

    // /**
    //  * This method toggles if a shelf is in the picking area and stages the change.
    //  * @param shelf The shelf to be toggled
    //  */
    // private async togglePickingArea(shelf: Shelf): Promise<void> {
    //     shelf.isPickingArea = !shelf.isPickingArea;
    //     await shelf.stage(false, true);
    //     this.forceUpdate();
    // }

    private async updateTrayProperties(
        category: CategoryAlteration,
        expiry: ExpiryAlteration,
        weight: WeightAlteration,
        comment: CommentAlteration,
        couldAdvance: boolean,
    ): Promise<void> {
        try {

            const modify = (tray: Tray): void => {
                if (category.type !== "nothing") {
                    tray.category = category.type === "set"
                                    ? this.props.warehouse.getCategoryByID(category.categoryID) ?? undefined
                                    : undefined;
                }
                if (expiry.type !== "nothing") {
                    tray.expiry = expiry.type === "set" ? toExpiryRange(expiry.expiry) : undefined;
                }
                if (weight.type !== "nothing") {
                    if (weight.type === "clear") {
                        tray.weight = undefined;
                    } else {
                        tray.weight = isNaN(Number(weight.weight)) ? tray.weight : Number(weight.weight);
                    }
                }
                if (comment.type !== "nothing") {
                    tray.comment = comment.type === "set" ? comment.comment : undefined;
                }
            };

            if (couldAdvance) {
                this.applyAndAdvance(
                    true,
                    true,
                    modify);
            } else {
                this.getSelectedTrays(
                    true,
                    true
                ).forEach(modify);
            }

            await this.props.currentView.stage(false, true, WarehouseModel.tray);

            if (!couldAdvance && weight !== undefined && weight.type === "set") {
                this.setState(state => ({
                    ...state,
                    weight: weight.weight
                }));
            }

        } catch (e) {
            this.props.openDialog(buildErrorDialog("Failed to save changes", e.toString(), true));
        }

    }

    render(): React.ReactNode {

        const possibleMoveDirections = this.possibleMoveDirections(this.props.currentView);

        const zoneColor: string = (() => {
            if (this.props.currentView instanceof Zone) {
                return this.props.currentView.color;
            } else if (this.props.currentView instanceof Shelf) {
                return this.props.currentView.parentZone.color;
            } else {
                return "#ffffff";
            }
        })();

        const sideBarButtons = this.state.isEditShelf && this.props.currentView instanceof Shelf ? [
            /*{
                name: this.state.currentView.isPickingArea ? "Unmark as Picking Area"
                                                           : "Mark as Picking Area",
                onClick: this.togglePickingArea.bind(this, this.state.currentView),
                halfWidth: false
            },*/
            {
                name: "Add Column",
                onClick: this.addColumn.bind(this, this.props.currentView),
                halfWidth: false,
                disabled: this.props.currentView.columns.length >= MAX_MAX_SHELF_WIDTH
            },
            // {name: "Cancel", onClick: this.discardEditShelf.bind(this, this.state.currentView)},
            {
                name: "Done",
                onClick: this.finaliseEditShelf.bind(this, this.props.currentView),
                halfWidth: false
            },
        ] : [ // Generate sidebar buttons
            {
                name: this.getSelectedTrayCells().length === 0 ? "Select All" : "Deselect All",
                icon: this.getSelectedTrayCells().length === 0 ? tickSolid : tickEmpty,
                onClick: this.selectAll.bind(
                    this,
                    this.getSelectedTrayCells().length === 0 ? "all" : "none"
                ),
                halfWidth: true,
                trayMod: true,
                disabled: !(this.props.currentView instanceof Shelf)
            },
            {
                name: "Tray Info",
                icon: faInfo,
                onClick: this.trayInfo.bind(this),
                disabled: this.getSelectedTrays(false, false).length === 0,
                halfWidth: true,
                trayMod: true
            },
            {
                name: "Main Menu",
                icon: menuIcon,
                onClick: () => this.props.history.push("/menu"),
                halfWidth: true
            },
            {
                name: "Settings",
                icon: settingsIcon,
                onClick: () => this.props.history.push("/settings"),
                halfWidth: true
            },
            {
                name: "Edit Shelf",
                onClick: this.enterEditShelf.bind(this),
                halfWidth: false,
                disabled: !(this.props.currentView instanceof Shelf)
            },
            {
                name: "Find",
                onClick: this.makeFind.bind(this),
                halfWidth: false
            },
            this.props.user.showPreviousShelfButton ? {
                name: "Previous Shelf",
                onClick: this.changeView.bind(this, "previousShelf"),
                disabled: !possibleMoveDirections.get("previousShelf"),
                halfWidth: true
            } : null,
            {
                name: "Next Shelf",
                onClick: this.changeView.bind(this, "nextShelf"),
                disabled: !possibleMoveDirections.get("nextShelf"),
                halfWidth: this.props.user.showPreviousShelfButton
            } as SideBarButtonProps
        ];

        return <>
            <div id="shelfView" className={this.state.isEditShelf ? "isEditShelf" : ""}>
                <ViewPort
                    selected={this.state.selected}
                    setSelected={this.setSelected.bind(this)}
                    isTraySelected={this.isTrayCellSelected.bind(this)}
                    selectedTrayCells={this.getSelectedTrayCells()}

                    removeColumn={this.removeColumn.bind(this)}

                    current={this.props.currentView instanceof Shelf ? this.props.currentView : undefined}
                    availableLevel={(() => {
                        if (this.props.currentView instanceof Warehouse) {
                            return WarehouseModel.warehouse;
                        } else if (this.props.currentView instanceof Zone) {
                            return WarehouseModel.zone;
                        } else {
                            return WarehouseModel.shelf;
                        }
                    })()}
                    isShelfEdit={this.state.isEditShelf}

                    draftWeight={this.state.weight}

                    currentKeyboard={this.state.currentKeyboard}
                />
                <SideBar
                    zoneColor={zoneColor}
                    locationString={this.props.currentView.toString()}
                    openNavigator={this.openNavigator.bind(this)}
                    openNavigatorDisabled={this.state.isEditShelf}

                    buttons={sideBarButtons}
                    keyboards={this.props.user.useCustomKeyboard ? [
                        {name: "custom", icon: categoryIcon},
                        {name: "weight", icon: weightIcon}
                    ] : [
                        {name: "category", icon: categoryIcon},
                        {name: "expiry", icon: expiryIcon},
                        {name: "weight", icon: weightIcon}
                    ]}
                    keyboardSwitcher={this.switchKeyboard.bind(this)}
                    showKeyboardSwitcher={!this.state.isEditShelf}
                    currentKeyboard={this.state.currentKeyboard}
                />
                <BottomPanel
                    openDialog={this.props.openDialog}
                    warehouse={this.props.warehouse}

                    updateTrayProperties={this.updateTrayProperties.bind(this)}
                    removeSelection={this.clearTrays.bind(this)}

                    commonRange={this.state.currentKeyboard === "expiry" ? this.getCommonRange() : undefined}
                    weight={this.state.weight}
                    keyboardState={this.state.isEditShelf ? "edit-shelf" : this.state.currentKeyboard}
                    selectedTrayCells={this.getSelectedTrayCells()}
                    user={this.props.user}
                />

            </div>
            {!(this.props.currentView instanceof Warehouse) &&
            this.renderNavigationPopup(this.props.currentView, possibleMoveDirections)
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
                <div id="nav-top">
                    <button id="nav-close-btn" onClick={this.closeNavigator.bind(this)}>
                        <FontAwesomeIcon icon={cross}/>
                    </button>
                </div>

                {/* Top zone selector */}
                <div id="nav-zone-select">
                    <button
                        id="previousZone"
                        onClick={this.changeView.bind(this, "previousZone")}
                        disabled={!possibleMoveDirections.get("previousZone")}
                    >
                        <FontAwesomeIcon icon={leftArrow}/> &nbsp; Previous Zone
                    </button>
                    <p className="centerText">{zone.name}</p>
                    <button
                        id="nextZone"
                        onClick={this.changeView.bind(this, "nextZone")}
                        disabled={!possibleMoveDirections.get("nextZone")}
                    >
                        Next Zone &nbsp; <FontAwesomeIcon icon={rightArrow}/>
                    </button>
                </div>

                {/* Grid of shelves in zone */}
                <ZoneDisplayComponent
                    zone={zone}
                    selected={this.props.currentView instanceof Shelf ? this.props.currentView : null}
                    onSelected={(shelf: Shelf) => this.changeView(shelf)}
                />

                <div id="nav-bottom">
                    {this.props.currentView instanceof Shelf ?
                     <p
                         id="nav-bottom-label"
                         style={{
                             backgroundColor: zone.color,
                             color: getTextColorForBackground(zone.color)
                         }}
                     >{`Current Shelf: ${this.props.currentView.toString()}`}</p> : undefined
                    }
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

type TrayInfoDialogState = { draft: string | null; blameName?: string };
type TrayInfoDialogProps = {
    onDiscard: () => void;
    onSubmit: (draft: string | null) => void;
    numberOfTrays: number;
    blame?: string;
    lastModified?: number;
} & TrayInfoDialogState;

/**
 * This is the the content of the dialog which is shown when the comment on a tray is being edited
 */
class TrayInfoContent extends React.Component<TrayInfoDialogProps, TrayInfoDialogState> {
    constructor(props: TrayInfoDialogProps) {
        super(props);
        this.state = {draft: this.props.draft, blameName: undefined};

        if (this.props.blame) {
            firebase.database.db.doc(Utils.joinPaths("users", this.props.blame)).get().then(doc =>
                this.setState(state => ({
                    ...state,
                    blameName: (doc.data()?.name ?? "") as string
                }))
            );
        }
    }

    render(): React.ReactElement {
        const blameText = (() => {
            if (this.props.numberOfTrays > 1) {
                return <div>
                    Multiple trays selected. Saving will overwrite any existing comments!<br/>
                    Select a single tray to edit an existing comment or view Last Modified data.
                </div>;
            } else {
                const blameName = this.state.blameName ? this.state.blameName : "Unknown";
                const blameTimeString = this.props.lastModified
                                        ? new Date(this.props.lastModified).toLocaleString("en-GB")
                                        : "Unknown";
                return <div>
                    This tray was last modified by {blameName} at {blameTimeString}
                </div>;
            }

        })();
        return <>
            <DialogTitle title="Tray Information"/>
            <div className="dialogContent">
                <form className="editCommentForm" onSubmit={(e) => {
                    e.preventDefault();
                    this.props.onSubmit(this.state.draft);
                }}>
                    <label>Comment:</label>
                    <input
                        autoFocus={true}
                        type="text"
                        id="editCommentInput"
                        onChange={(event) => {
                            const newValue = event.target.value;
                            this.setState(state => ({
                                ...state,
                                draft: newValue.length === 0 ? null : newValue
                            }));
                        }}
                        value={this.state.draft ?? ""}
                    />
                </form>
                <div className="infoBottom">
                    {blameText}
                    <DialogButtons buttons={[
                        {
                            name: "Cancel", buttonProps: {
                                onClick: this.props.onDiscard,
                            }
                        }, {
                            name: "Save", buttonProps: {
                                onClick: () => this.props.onSubmit(this.state.draft),
                            }
                        }
                    ]}/>
                </div>
            </div>
        </>;
    }
}


export default withRouter(ShelfViewPage);