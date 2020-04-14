import {
    faCheckCircle as tickSolid,
    faMinus as minus,
    faPlus as plus,
    faStickyNote,
    faTrashAlt as trash
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames/bind";
import {isEqual} from "lodash";
import "pepjs";
import React from "react";
import {
    Column,
    NULL_CATEGORY_STRING,
    Shelf,
    Tray,
    TrayCell,
    Warehouse,
    WarehouseModel,
    Zone
} from "../core/WarehouseModel";
import {traySizes} from "../core/WarehouseModel/Layers/Column";
import {KeyboardName, MAX_MAX_COLUMN_HEIGHT} from "../pages/ShelfViewPage";
import {getTextColorForBackground} from "../utils/colorUtils";
import {getExpiryColor} from "../utils/getExpiryColor";
import {trayComparisonFunction} from "../utils/sortCells";
import {LoadingSpinner} from "./LoadingSpinner";
import "./styles/_viewport.scss";


export type ViewPortLocation = Shelf | Zone | Warehouse;

interface ViewPortProps {
    selected: Map<TrayCell, boolean>;
    setSelected: (newMap: Map<TrayCell, boolean>, callback?: ((() => void) | undefined)) => void;
    isTraySelected: ((tray: TrayCell) => boolean | undefined);
    selectedTrayCells: TrayCell[];

    removeColumn: (column: Column) => void;

    availableLevel: WarehouseModel;
    current?: Shelf;
    isShelfEdit: boolean;

    draftWeight: string | undefined;

    currentKeyboard: KeyboardName;
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

    /**
     * Which columns are condensed
     * Eg [false, true, true, false] for 4 columns with the two middle ones being condensed
     */
    condensed: boolean[];
}

/**
 * The long press to drag timeout in milliseconds
 */
const LONG_PRESS_TIMEOUT = 300;

/**
 * This class crates and manages the behavior of the viewport
 */
export class ViewPort extends React.Component<ViewPortProps, ViewPortState> {

    /**
     * One tray from each column: used to check the height of the trays in each column
     */
    private trayRefs: React.RefObject<HTMLDivElement>[];
    private readonly condensedUpdater: () => void;

    constructor(props: ViewPortProps) {
        super(props);

        this.trayRefs = [];
        this.condensedUpdater = this.updateCondensed.bind(this);

        this.state = {
            longPress: null,
            condensed: this.props.current?.columns.map(_ => false) ?? []
        };


    }

    /**
     * This method is called when a dragging event is started.  This event is started when the timeout which is started
     * inside onTrayPointerDown succeeds.  This timeout could fail iff the pointer leaves the tray or if the pointer is
     * released before the timeout finishes.
     * @param shelf The current shelf that is being displayed
     */
    private onDragSelectStart(shelf: Shelf): void {
        // Shallow clone the selected map from props, which we will save
        const selectedBefore = new Map(this.props.selected);

        this.setState(state => ({
            ...state,
            longPress: this.state.longPress ? {
                isHappening: true,
                timeout: undefined,
                dragFrom: this.state.longPress.dragFrom,
                selectedBefore: selectedBefore,
            } : undefined,
        }), () => {
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
    private updateDragSelectionTo(shelf: Shelf, to: TrayCell): void {

        // Shallow clone what was previously selected, which we will mutate
        const newSelectedMap = new Map(this.state.longPress?.selectedBefore ?? new Map<Tray, boolean>());

        const xor: (a: boolean, b: boolean) => boolean = (a, b) => a ? !b : b;

        const from = this.state.longPress?.dragFrom;

        // This block takes all the trays in the current shelf and sorts them into the order that the drag select uses.
        // After they have been sorted into any order, anything between the from and to trays is then marked as selected
        const trayOrdered = shelf.columns
                                 .flatMap(column => column.getPaddedTrays())
                                 .sort(trayComparisonFunction);

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
    private onDragSelectEnd(): void {

        this.setState(state => ({
            ...state,
            longPress: null,
        }));
    }

    /**
     * This method is called when a TrayCell is clicked, a click being a higher level combination of onPointerDown and
     * onPointerUp.  This method controls the selecting behaviour of a singular TrayCell.  Notably, this method is also
     * called after a pointer drag event if the event ends on the same TrayCell as it started.
     * @param trayCell The TrayCell that is clicked
     */
    private onTrayClick(trayCell: TrayCell): void {

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
    private onTrayPointerDown(shelf: Shelf, tray: TrayCell, e: React.PointerEvent<HTMLDivElement>): void {
        e.currentTarget.releasePointerCapture(e.pointerId);
        const timeout: number = window.setTimeout(() => { // await hold time
            if (this.state.longPress) { // not interrupted
                this.onDragSelectStart(shelf);
            }
        }, LONG_PRESS_TIMEOUT);

        this.setState(state => ({
            ...state,
            longPress: {
                selectedBefore: new Map(),
                isHappening: false,
                timeout: timeout,
                dragFrom: tray
            }
        }));
    }

    /**
     * This method is called when the pointer button is released over a tray, this either cancels the new drag event
     * timeout, finalises a current dragging event or performs a pointer click.
     * @param tray The tray over which the even is triggered
     */
    private onTrayPointerUp(tray: TrayCell): void {

        if (this.state.longPress) {
            if (this.state.longPress.isHappening) {
                this.onDragSelectEnd(); // end of drag
            } else {
                window.clearTimeout(this.state.longPress.timeout);
                this.setState(state => ({
                    ...state,
                    longPress: null
                }));
                this.onTrayClick(tray);
            }
        }

    }

    /**
     * This method is called when the pointer leaves the DOM element which represents any tray.  This method stops a
     * pointer down event from starting a drag event if the pointer leaves that tray.
     */
    private onTrayPointerLeave(): void {

        if (this.state.longPress && !this.state.longPress.isHappening) {
            // is between pointer down and drag start
            window.clearTimeout(this.state.longPress?.timeout);

            this.setState(state => ({ // kills the long press
                ...state,
                longPress: null
            }));
        }
    }

    /**
     * This method is called when the pointer enters the DOM element which represents a particular tray
     * @param shelf The current shelf that is being displayed
     * @param tray The tray over which the pointer entered
     */
    private onTrayPointerEnter(shelf: Shelf, tray: TrayCell): void {
        if (this.state.longPress?.isHappening) {
            this.updateDragSelectionTo(shelf, tray);
        }
    }

    /**
     * @inheritDoc
     */
    render(): React.ReactNode {
        if (this.props.current) {
            const shelf: Shelf = this.props.current;// this variable exists only because of poor type inference

            if (!(shelf.loaded && shelf.childrenLoaded)) {
                return (
                    <div id="loading-box">
                        <LoadingSpinner/>
                        <h2>Loading...</h2>
                    </div>
                );
            }

            if (this.props.current.columns.length !== this.trayRefs.length) {
                this.trayRefs = this.props.current.columns.map(_ => React.createRef<HTMLDivElement>());
            }

            if (this.props.current.columns.length === 0 && !this.props.isShelfEdit) {
                return <div id="viewPort">
                    <div>
                        <h1>This shelf has no columns!</h1>
                        <p>Tap <b>Edit Shelf</b> to add columns to this shelf</p>
                    </div>
                </div>;
            } else {
                return <div id="viewPort" touch-action="none" onPointerUp={this.onDragSelectEnd.bind(this)}
                            onPointerLeave={this.onDragSelectEnd.bind(this)}>
                    {/* DO NOT attach any touch/onClick/pointer stuff to #shelf, it won't receive them */}
                    <div id="shelf">
                        {shelf.columns.map((column, columnIndex) =>
                            this.renderColumn(shelf, column, columnIndex)
                        )}
                    </div>
                </div>;
            }
        } else {
            if (this.props.availableLevel === WarehouseModel.warehouse) {
                return <div id="viewPort">
                    <div>
                        <h1>This warehouse has no zones!</h1>
                        <p>Go to <b>Settings > Zone Editor</b> to add zones to this warehouse</p>
                    </div>
                </div>;
            } else if (this.props.availableLevel === WarehouseModel.zone) {
                // This should not be possible, you should be unable to create a zone without any bays
                // todo Allow zone editor to resize zones (including add new bays)
                return <div id="viewPort">
                    <div>
                        <h1>This zone has no bays!</h1>
                        <p>Go to <b>Settings > Zone Editor</b> to edit zones</p>
                    </div>
                </div>;
            }
        }
    }

    /**
     * This is the listener for incrementing/decrementing the max height of a column
     * @param column The column to inc/dec
     * @param changeType Either increment or decrement
     */
    private changeColumnHeight(column: Column, changeType: "inc" | "dec"): void {
        const change = changeType === "inc" ? 1
                                            : -1;
        column.maxHeight = Math.min(Math.max(change + column.maxHeight, 1), MAX_MAX_COLUMN_HEIGHT);
        Column.purgePaddedSpaces(column);
        this.forceUpdate();
    }

    /**
     * This method returns the possible changes to the current column max height for a particular column
     * @param column The column in question
     * @return an object map of possible inputs to the boolean which determines if they are possible
     */
    private static getPossibleHeightChanges(column: Column): { inc: boolean; dec: boolean } {
        if (column.maxHeight) {
            return {inc: column.maxHeight !== MAX_MAX_COLUMN_HEIGHT, dec: column.maxHeight !== 1};
        } else {

            return {inc: true, dec: true};
        }
    }

    /**
     * This is the listener for increasing/decreasing the width of a column
     * @param column The column to inc/dec
     * @param changeType Either increase or decrease
     */
    private changeColumnSize(column: Column, changeType: "inc" | "dec"): void {
        const change = changeType === "inc" ? 1
                                            : -1;

        const newIndex = Math.min(Math.max(change + traySizes.indexOf(column.traySize), 0), traySizes.length - 1);
        column.traySize = traySizes[newIndex];

        this.forceUpdate();
    }

    /**
     * This method returns the possible changes to the current column size for a particular column
     * @param column The column in question
     * @return an object map of possible inputs to the boolean which determines if they are possible
     */
    private static getPossibleSizeChanges(column: Column): { inc: boolean; dec: boolean } {
        const currentIndex = traySizes.indexOf(column.traySize);
        return {inc: currentIndex < traySizes.length - 1, dec: currentIndex > 0};
    }

    /**
     * This method renters a column.  It can either render it in or out of shelf edit mode depending on the props.
     * @param shelf The current shelf that is being displayed
     * @param column The column to draw
     * @param order The index of the column
     */
    private renderColumn(shelf: Shelf, column: Column, order: number): React.ReactNode {
        const possibleColumnChanges = ViewPort.getPossibleSizeChanges(column);
        const possibleHeightChange = ViewPort.getPossibleHeightChanges(column);

        const expiryColorMode = shelf.parentWarehouse.expiryColorMode;

        /* DO NOT attach any touch/onClick/pointer stuff to .column, it won't receive them */
        return <div
            style={{
                order: order,
                flexGrow: column.traySize.sizeRatio,
                maxWidth: (column.traySize.sizeRatio / traySizes[1].sizeRatio) * 450 // normal = 450px
            }}
            className={classNames("column", {
                "column-condensed": this.state.condensed[order]
            })}
            key={order}
        >{
            column.getPaddedTrays().map((tray, index) => {
                const expiryStyle = (() => {
                    if (tray instanceof Tray && tray.expiry) {
                        const background = getExpiryColor(tray.expiry, expiryColorMode);
                        return {
                            backgroundColor: background,
                            color: getTextColorForBackground(background)
                        };
                    } else {
                        return {
                            backgroundColor: "#ffffff00",
                            color: "#000000"
                        };
                    }
                })();

                const isSelected = this.props.isTraySelected(tray);

                const weight: string | null = (() => {
                    if (!(tray instanceof Tray)) {
                        return null;
                    }

                    let weightVal: string | undefined;
                    if (this.props.draftWeight && isSelected) {
                        weightVal = this.props.draftWeight;
                    } else if (tray.weight) {
                        weightVal = tray.weight.toString();
                    } else {
                        return null;
                    }
                    return `${weightVal}kg`;
                })();

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
                    ref={index === 0 ? this.trayRefs[order] : undefined}
                >
                    <FontAwesomeIcon
                        className={classNames("tray-tickbox", {
                            "tick-selected": isSelected
                        })}
                        icon={tickSolid}/>
                    {tray instanceof Tray ? <>
                        <div className="trayCategory">{tray.category?.name ?? NULL_CATEGORY_STRING}</div>

                        {tray.expiry ? <div className="trayExpiry" style={expiryStyle}>
                            <div>{tray.expiry.label}</div>
                        </div> : null}

                        <div className={classNames("trayWeight", {
                            "trayWeightEditing": isSelected && this.props.currentKeyboard === "weight"
                        })}>
                            {weight}
                        </div>
                        {tray.comment ? <div className="trayComment">
                            <FontAwesomeIcon icon={faStickyNote}/>
                        </div> : null}
                    </> : null}
                </div>;
            })}
            {this.props.isShelfEdit ? <div className="editShelfColumn">
                <button className="colDeleteBtn"
                        onClick={() => this.props.removeColumn(column)}
                >
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
                        <span className="colWidthValue">{stringToTitleCase(column.traySize.label)}</span>
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

    componentDidMount(): void {
        this.updateCondensed();
        window.addEventListener("resize", this.condensedUpdater);
    }

    componentWillUnmount(): void {
        window.removeEventListener("resize", this.condensedUpdater);
    }

    /**
     * This method clears the tray spaces if the shelf that is being displayed is changed.
     * @inheritDoc
     */
    componentDidUpdate(prevProps: Readonly<ViewPortProps>): void {

        if (this.props.current !== prevProps.current) {
            Column.purgePaddedSpaces();
        }

        this.updateCondensed();
    }

    /**
     * Update this.state.condensed when necessary
     * Called after every render() call to ensure that columns become condensed when they get too full
     */
    updateCondensed(): void {

        // constant: decides the breakpoint in tray height at which to condense its parent column
        const condenseMaxHeight = 90;

        // check a tray from each column; generate a list indicating which columns should be condensed
        const newCondensed: boolean[] = this.trayRefs.map(trayRef => {
            const trayHeight = trayRef.current?.clientHeight;
            return !!(trayHeight && trayHeight < condenseMaxHeight);
        });

        // VERY IMPORTANT: avoids render loops
        // only update state if it's changed
        if (!isEqual(newCondensed, this.state.condensed)) {
            this.setState(state => ({
                ...state,
                condensed: newCondensed
            }));
        }
    }
}

function stringToTitleCase(string: string): string {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
}