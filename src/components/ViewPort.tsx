import React from "react";
import "pepjs";
import "../styles/shelfview.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCheckCircle as tickSolid,
    faMinus as minus,
    faPlus as plus,
    faTrashAlt as trash
} from "@fortawesome/free-solid-svg-icons";
import {Column, Shelf, Tray, TrayCell, Warehouse, Zone} from "../core/WarehouseModel";
import classNames from "classnames/bind";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import {getExpiryColor} from "../utils/getExpiryColor";


export type ViewPortLocation = Shelf | Zone | Warehouse;

interface ViewPortProps {
    selected: Map<TrayCell, boolean>;
    setSelected: (newMap: Map<TrayCell, boolean>, callback?: ((() => void) | undefined)) => void;
    isTraySelected: ((tray: TrayCell) => boolean | undefined);
    selectedTrayCells: TrayCell[];

    removeColumn: (column: Column) => void;

    current: ViewPortLocation;
    isShelfEdit: boolean;

}

/**
 * This is the type for the field in the state of the viewport which controls the dragging behaviour
 */
interface LongPress {
    isHappening: boolean;
    timeout?: number;
    dragFrom: TrayCell;
    selectedBefore: Map<TrayCell, boolean>;
}

/**
 * The state of the ViewPort
 */
interface ViewPortState {
    longPress?: LongPress | null;
}

/**
 * The long press to drag timeout in milliseconds
 */
const LONG_PRESS_TIMEOUT = 300;

/**
 * This class crates and manages the behavior of the viewport
 */
export class ViewPort extends React.Component<ViewPortProps, ViewPortState> {

    constructor(props: ViewPortProps) {
        super(props);
        this.state = {
            longPress: null,
        };
    }

    /**
     * This method is called when a dragging event is started.  This event is started when the timeout which is started
     * inside onTrayPointerDown succeeds.  This timeout could fail iff the pointer leaves the tray or if the pointer is
     * released before the timeout finishes.
     * @param shelf The current shelf that is being displayed
     */
    onDragSelectStart(shelf: Shelf): void {
        // Shallow clone the selected map from props, which we will save
        const selectedBefore = new Map(this.props.selected);

        this.setState(state => {
            return {
                ...state,
                longPress: this.state.longPress ? {
                    isHappening: true,
                    timeout: undefined,
                    dragFrom: this.state.longPress.dragFrom,
                    selectedBefore: selectedBefore,
                } : undefined,
            };
        }, () => {
            if (this.state.longPress) {
                this.updateDragSelectionTo(shelf, this.state.longPress.dragFrom);
            }
        });
    }

    /**
     * This method is called to update the state of the drag event.  It is called when the pointer enters a new tray
     * while the viewport is in dragging mode.  This method sets the selection state based on the selection state from
     * when the drag started (longPress.selectedBefore).
     * @param shelf The current shelf that is being displayed
     * @param to The tray that the pointer just entered, which triggered this listener
     */
    updateDragSelectionTo(shelf: Shelf, to: TrayCell): void {

        // Shallow clone what was previously selected, which we will mutate
        const newSelectedMap = new Map(this.state.longPress?.selectedBefore ?? new Map<Tray, boolean>());

        const xor: (a: boolean, b: boolean) => boolean = (a, b) => a ? !b : b;

        const from = this.state.longPress?.dragFrom;

        const boundIndices = {
            from: {
                column: -1,
                tray: -1
            },
            to: {
                column: -1,
                tray: -1
            }
        };

        // This block takes all the trays in the current shelf and sorts them into the order that the drag select uses.
        // After they have been sorted into any order, anything between the from and to trays is then marked as selected
        const trayOrdered = shelf.columns.flatMap((column, columnIndex) =>
            column.getPaddedTrays().map((tray: TrayCell, trayIndex) => {
                if (tray === from) {
                    boundIndices.from.column = columnIndex;
                    boundIndices.from.tray = trayIndex;
                }
                if (tray === to) {
                    boundIndices.to.column = columnIndex;
                    boundIndices.to.tray = trayIndex;
                }

                return { // this maps all trays to an object which contains the tray and relevant indices
                    columnIndex: columnIndex,
                    trayIndex: trayIndex,
                    tray: tray
                };
            })
        ).sort(((a, b) => {

            // this is a multi level sort

            if (a.columnIndex < b.columnIndex) {
                return -1;
            } else if (a.columnIndex > b.columnIndex) {
                return 1;
            } else if (a.trayIndex < b.trayIndex) {
                return 1;
            } else if (a.trayIndex > b.trayIndex) {
                return -1;
            } else {
                return 0;
            }

        })).map(it => it.tray);

        // now that the trays are ordered, this reduce (or fold) goes through in order and selects all trays between
        // the from and to trays
        trayOrdered.reduce((isSelecting, tray) => {

            const selectThis = isSelecting || tray === from || tray === to;

            if (selectThis) {
                newSelectedMap.set(tray, true);
            }
            return xor(isSelecting, xor(tray === from, tray === to));

        }, false); // the accumulator of the fold is if the trays are still being selected

        this.props.setSelected(newSelectedMap);
    }

    /**
     * This method is called when a drag event is ended by pointer up, or when the pointer leaves the viewport during a
     * drag. After drag finishes and the state is set, the callback is to fix the UI select display mode
     */
    onDragSelectEnd(): void {

        this.setState(state => {
            return {
                ...state,
                longPress: null,
            };
        });
    }

    /**
     * This method is called when a TrayCell is clicked, a click being a higher level combination of onPointerDown and
     * onPointerUp.  This method controls the selecting behaviour of a singular TrayCell.  Notably, this method is also
     * called after a pointer drag event if the event ends on the same TrayCell as it started.
     * @param trayCell The TrayCell that is clicked
     */
    onTrayClick(trayCell: TrayCell): void {

        // Shallow clone the selected map from props, which we will mutate
        const newSelectedMap = new Map(this.props.selected);

        // If there's only one trayCell selected, and it's not the clicked-on trayCell
        // then deselect that previously selected trayCell first, before toggling this clicked-on trayCell as normal
        if (this.props.selectedTrayCells.length === 1 && this.props.selectedTrayCells[0] !== trayCell) {
            newSelectedMap.set(this.props.selectedTrayCells[0], false);
        }

        // Toggle the trayCell being clicked on
        newSelectedMap.set(trayCell, !this.props.isTraySelected(trayCell));

        this.props.setSelected(newSelectedMap);
    }

    /**
     * This method is called when the pointer is pressed over a tray, it begins the timeout which controls dragging
     * @param shelf The current shelf that is being displayed
     * @param tray The tray on which the pointer is pressed
     * @param e The react pointer event that triggered this call
     */
    onTrayPointerDown(shelf: Shelf, tray: TrayCell, e: React.PointerEvent<HTMLDivElement>): void {
        e.currentTarget.releasePointerCapture(e.pointerId);
        const timeout: number = window.setTimeout(() => { // await hold time
            if (this.state.longPress) { // not interrupted
                this.onDragSelectStart(shelf);
            }
        }, LONG_PRESS_TIMEOUT);

        this.setState(state => {
            return {
                ...state,
                longPress: {
                    selectedBefore: new Map(),
                    isHappening: false,
                    timeout: timeout,
                    dragFrom: tray
                }
            };
        });
    }

    /**
     * This method is called when the pointer button is released over a tray, this either cancels the new drag event
     * timeout, finalises a current dragging event or performs a pointer click.
     * @param tray The tray over which the even is triggered
     */
    onTrayPointerUp(tray: TrayCell): void {

        if (this.state.longPress) {
            if (this.state.longPress.isHappening) {
                this.onDragSelectEnd(); // end of drag
            } else {
                window.clearTimeout(this.state.longPress?.timeout);
                this.setState(state => {
                    return {
                        ...state,
                        longPress: null
                    };
                });
                this.onTrayClick(tray);
            }
        }

    }

    /**
     * This method is called when the pointer leaves the DOM element which represents any tray.  This method stops a
     * pointer down event from starting a drag event if the pointer leaves that tray.
     */
    onTrayPointerLeave(): void {

        if (this.state.longPress && !this.state.longPress.isHappening) {
            // is between pointer down and drag start
            window.clearTimeout(this.state.longPress?.timeout);

            this.setState(state => {
                return { // kills the long press
                    ...state,
                    longPress: null
                };
            });
        }
    }

    /**
     * This method is called when the pointer enters the DOM element which represents a particular tray
     * @param shelf The current shelf that is being displayed
     * @param tray The tray over which the pointer entered
     */
    onTrayPointerEnter(shelf: Shelf, tray: TrayCell): void {
        if (this.state.longPress?.isHappening) {
            this.updateDragSelectionTo(shelf, tray);
        }
    }

    /**
     * @inheritDoc
     */
    render(): React.ReactNode {

        if (this.props.current instanceof Warehouse) {
            return <div id="viewPort">
                <h1>Current warehouse {this.props.current.toString()} has no zones!</h1>
                <p>todo add a button to go to settings or wherever this can be changed</p>
            </div>;
        } else if (this.props.current instanceof Zone) {
            return <div id="viewPort">
                <h1>Current zone {this.props.current.toString()} has no bays</h1>
                <p>todo add a button to go to settings or wherever this can be changed</p>
            </div>;
        } else {
            const shelf: Shelf = this.props.current;// this variable exists only because of poor type inference
            return (
                <div id="viewPort" touch-action="none" onPointerUp={this.onDragSelectEnd.bind(this)}
                     onPointerLeave={this.onDragSelectEnd.bind(this)}>
                    {/* DO NOT attach any touch/onClick/pointer stuff to #shelf, it won't receive them */}
                    <div id="shelf">
                        {shelf.columns.map((column, columnIndex) =>
                            this.renderColumn(shelf, column, columnIndex)
                        )}
                    </div>
                </div>
            );
        }
    }

    /**
     * This is the listener for incrementing/decrementing the max height of a column
     * @param column The column to inc/dec
     * @param changeType Either increment or decrement
     */
    changeColumnHeight(column: Column, changeType: "inc" | "dec"): void {
        const change = changeType === "inc" ? 1
                                            : -1;
        column.maxHeight = Math.max(change + column.maxHeight, 1);
        Column.purgePaddedSpaces(column);
        this.forceUpdate();
    }

    /**
     * This method returns the possible changes to the current column max height for a particular column
     * @param column The column in question
     * @return an object map of possible inputs to the boolean which determines if they are possible
     */
    getPossibleHeightChanges(column: Column): { inc: boolean; dec: boolean } {
        // todo decide if there ought to be max max height
        if (column.maxHeight) {
            return {inc: true, dec: column.maxHeight !== 1};
        } else {

            return {inc: true, dec: true};
        }
    }

    /**
     * This is the listener for increasing/decreasing the width of a column
     * @param column The column to inc/dec
     * @param changeType Either increase or decrease
     */
    changeColumnSize(column: Column, changeType: "inc" | "dec"): void {
        const change = changeType === "inc" ? 1
                                            : -1;

        const traySizes = column.parentWarehouse.traySizes;
        const medianIndex = Math.floor(traySizes.length / 2);

        const currentIndex = traySizes.indexOf(column.traySize ?? traySizes[medianIndex]);

        const newIndex = Math.min(Math.max(change + currentIndex, 0), traySizes.length - 1);
        column.traySize = traySizes[newIndex];

        this.forceUpdate();
    }

    /**
     * This method returns the possible changes to the current column size for a particular column
     * @param column The column in question
     * @return an object map of possible inputs to the boolean which determines if they are possible
     */
    getPossibleSizeChanges(column: Column): { inc: boolean; dec: boolean } {
        const traySizes = column.parentWarehouse.traySizes;

        if (column.traySize) {
            const currentIndex = traySizes.indexOf(column.traySize);
            return {inc: currentIndex !== traySizes.length - 1, dec: currentIndex !== 0};
        } else {
            return {inc: true, dec: true};
        }
    }

    /**
     * This method renters a column.  It can either render it in or out of shelf edit mode depending on the props.
     * @param shelf The current shelf that is being displayed
     * @param column The column to draw
     * @param order The index of the column
     */
    renderColumn(shelf: Shelf, column: Column, order: number): React.ReactNode {
        const possibleColumnChanges = this.getPossibleSizeChanges(column);
        const possibleHeightChange = this.getPossibleHeightChanges(column);

        /* DO NOT attach any touch/onClick/pointer stuff to .column, it won't receive them */
        return <div
            style={{
                order: order,
                flexGrow: column.traySize?.sizeRatio ?? 1
            }}
            className="column"
            key={order}
        >{
            column.getPaddedTrays().map((tray, index) => {
                let expiryStyle;
                if (tray instanceof Tray) {
                    const bg = tray.expiry ? getExpiryColor(tray.expiry) : "";
                    expiryStyle = {
                        backgroundColor: bg,
                        color: getTextColorForBackground(bg)
                    };
                }
                return <div
                    className={classNames("tray", {
                        "multipleSelect": this.props.selectedTrayCells.length > 1 || this.state.longPress?.isHappening,
                        "selected": this.props.isTraySelected(tray),
                        "firstTraySpace": index === column.trays.length,
                        "traySpace": !(tray instanceof Tray)
                    })}
                    onPointerDown={this.onTrayPointerDown.bind(this, shelf, tray)}
                    onPointerEnter={this.onTrayPointerEnter.bind(this, shelf, tray)}
                    onPointerLeave={this.onTrayPointerLeave.bind(this)}
                    onPointerUp={this.onTrayPointerUp.bind(this, tray)}
                    key={index}
                >
                    <FontAwesomeIcon
                        className={classNames("tray-tickbox", {
                            "tick-selected": this.props.isTraySelected(tray)
                        })}
                        icon={tickSolid}/>
                    {tray instanceof Tray ? <>
                        <div className="trayCategory">{tray.category?.name ?? "Mixed"}</div>

                        <div className="trayExpiry" style={expiryStyle}>{tray.expiry?.label ?? "?"}</div>

                        <div className="trayWeight">{tray.weight ?? "?"}kg</div>
                        <div className="trayCustomField">{tray.comment ?? ""}</div>
                    </> : null}
                    {!(tray instanceof Tray) && index === column.trays.length ? <>
                        <p>EMPTY TRAY {tray.index}</p>
                    </> : null}
                </div>;
            })}
            {this.props.isShelfEdit ? <div className="edit-shelf-column">
                <button className="colDeleteBtn"
                        onClick={() => this.props.removeColumn(column)}
                > {/*todo revise these icons*/}
                    <FontAwesomeIcon icon={trash}/>
                </button>

                <div className="colHeight">
                    <div className="colControlHeader">Height in Trays:</div>
                    <div className="colHeightControls">
                        <button
                            disabled={!possibleHeightChange.inc}
                            onClick={this.changeColumnHeight.bind(this, column, "inc")}
                        >
                            <FontAwesomeIcon icon={plus}/>
                        </button>
                        <div className="colHeightValue">{column.maxHeight}</div>
                        <button
                            disabled={!possibleHeightChange.dec}
                            onClick={this.changeColumnHeight.bind(this, column, "dec")}
                        >
                            <FontAwesomeIcon icon={minus}/>
                        </button>
                    </div>
                </div>

                <div className="colWidth">
                    <div className="colControlHeader">Tray Width:&nbsp;
                        <span className="colWidthValue">{stringToTitleCase(column.traySize?.label ?? "?")}</span>
                    </div>
                    <div className="colWidthControls">
                        <button
                            disabled={!possibleColumnChanges.dec}
                            onClick={this.changeColumnSize.bind(this, column, "dec")}
                        >
                            <FontAwesomeIcon icon={minus}/>
                        </button>
                        <button
                            disabled={!possibleColumnChanges.inc}
                            onClick={this.changeColumnSize.bind(this, column, "inc")}
                        >
                            <FontAwesomeIcon icon={plus}/>
                        </button>
                    </div>
                </div>
            </div> : ""}
        </div>;
    }


    /**
     * This method clears the tray spaces if the shelf that is being displayed is changed.
     * @inheritDoc
     */
    componentDidUpdate(prevProps: Readonly<ViewPortProps>): void {
        if (this.props.current !== prevProps.current) {
            Column.purgePaddedSpaces();
        }
    }


}

function stringToTitleCase(string: string): string {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}