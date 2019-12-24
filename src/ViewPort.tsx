import React from "react";
import "pepjs";
import "./styles/shelfview.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle as tickSolid} from "@fortawesome/free-solid-svg-icons";
import {getExpiryColour, Shelf, Tray} from "./core/MockWarehouse";


interface ViewPortProps {
    shelf: Shelf;
    selected: Map<Tray, boolean>;
    setSelected: (newMap: Map<Tray, boolean>, callback?: ((() => void) | undefined)) => void;
    isTraySelected: ((tray: Tray) => boolean | undefined);
    areMultipleTraysSelected: () => boolean;
}

/**
 * This is the type for the field in the state of the viewport which controls the dragging behaviour
 */
interface LongPress {
    isHappening: boolean;
    timeout?: number;
    dragFrom: Tray;
    selectedBefore: Map<Tray, boolean>;
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
     */
    onDragSelectStart() {
        // Shallow clone the selected map from props, which we will save
        const selectedBefore = new Map(this.props.selected);

        this.setState({
            ...this.state,
            longPress: {
                isHappening: true,
                timeout: undefined,
                dragFrom: this.state.longPress?.dragFrom!!,
                selectedBefore: selectedBefore,
            },
        }, () => {
            this.updateDragSelectionTo(this.state.longPress?.dragFrom!!);
        });
    }

    /**
     * This method is called to update the state of the drag event.  It is called when the pointer enters a new tray
     * while the viewport is in dragging mode.  This method sets the selection state based on the selection state from
     * when the drag started (longPress.selectedBefore).
     * @param to The tray that the pointer just entered, which triggered this listener
     */
    updateDragSelectionTo(to: Tray) {

        // Shallow clone what was previously selected, which we will mutate
        let newSelectedMap = new Map(this.state.longPress?.selectedBefore ?? new Map<Tray, boolean>());

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
        const trayOrdered = this.props.shelf.columns.flatMap((column, columnIndex) =>
            column.trays.map((tray: Tray, trayIndex) => {
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

            if (a.columnIndex < b.columnIndex) return -1;
            if (a.columnIndex > b.columnIndex) return 1;

            if (a.trayIndex < b.trayIndex) return -1;
            if (a.trayIndex > b.trayIndex) return 1;

            return 0;
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
    onDragSelectEnd() {

        this.setState({
            ...this.state,
            longPress: null,
        });
    }

    /**
     * This method is called when a tray is clicked, a click being a higher level combination of onPointerDown and
     * onPointerUp.  This method controls the selecting behaviour of a singular tray.  Notably, this method is also
     * called after a pointer drag event if the event ends on the same tray as it started.
     * @param tray The tray that is clicked
     * @param e The react event object which triggered this listener
     */
    onTrayClick(tray: Tray, e: React.PointerEvent<HTMLDivElement>) {

        const currSelected = Array.from(this.props.selected.entries())
                                  .filter(([_, value]) => value);

        // Shallow clone the selected map from props, which we will mutate
        let newSelectedMap = new Map(this.props.selected);

        // If there's only one tray selected, and it's not the clicked-on tray
        // then deselect that previously selected tray first, before toggling this clicked-on tray as normal
        if (currSelected.length === 1 && currSelected[0][0] !== tray) {
            newSelectedMap.set(currSelected[0][0], false);
        }

        // Toggle the tray being clicked on
        newSelectedMap.set(tray, !this.props.isTraySelected(tray));

        this.props.setSelected(newSelectedMap);
    }

    /**
     * This method is called when the pointer is pressed over a tray, it begins the timeout which controls dragging
     * @param tray The tray on which the pointer is pressed
     * @param e The react pointer event that triggered this call
     */
    onTrayPointerDown(tray: Tray, e: React.PointerEvent<HTMLDivElement>) {
        e.currentTarget.releasePointerCapture(e.pointerId);
        const timeout: number = window.setTimeout(() => { // await hold time
            if (this.state.longPress) { // not interrupted
                this.onDragSelectStart();
            }
        }, LONG_PRESS_TIMEOUT);

        this.setState({
            ...this.state,
            longPress: {
                selectedBefore: new Map(),
                isHappening: false,
                timeout: timeout,
                dragFrom: tray
            }
        });
    }

    /**
     * This method is called when the pointer button is released over a tray, this either cancels the new drag event
     * timeout, finalises a current dragging event or performs a pointer click.
     * @param tray The tray over which the even is triggered
     * @param e The react pointer event that triggered this call
     */
    onTrayPointerUp(tray: Tray, e: React.PointerEvent<HTMLDivElement>) {

        if (this.state.longPress) {
            if (this.state.longPress.isHappening) {
                this.onDragSelectEnd(); // end of drag
            } else {
                window.clearTimeout(this.state.longPress?.timeout);
                this.setState({
                    ...this.state,
                    longPress: null
                });
                this.onTrayClick(tray, e);
            }
        }

    }

    /**
     * This method is called when the pointer leaves the DOM element which represents any tray.  This method stops a
     * pointer down event from starting a drag event if the pointer leaves that tray.
     * @param e The react pointer event that triggered this call
     */
    onTrayPointerLeave(e: React.PointerEvent<HTMLDivElement>) {

        if (this.state.longPress && !this.state.longPress.isHappening) {
            // is between pointer down and drag start
            window.clearTimeout(this.state.longPress?.timeout);

            this.setState({ // kills the long press
                ...this.state,
                longPress: null
            });
        }
    }

    /**
     * This method is called when the pointer enters the DOM element which represents a particular tray
     * @param tray The tray over which the pointer entered
     */
    onTrayPointerEnter(tray: Tray) {
        if (this.state.longPress?.isHappening) {
            this.updateDragSelectionTo(tray);
        }
    }

    /**
     * @inheritDoc
     */
    render() {

        return (
            <div id="viewPort" touch-action="none" onPointerLeave={this.onDragSelectEnd.bind(this)}>
                <div id="shelf">
                    {this.props.shelf.columns.map((column, columnIndex) =>
                        <div
                            style={{order: columnIndex}}
                            className="column"
                            key={columnIndex}
                        >
                            {column.trays.map((tray, trayIndex) =>

                                <div
                                    className={`tray${(this.props.areMultipleTraysSelected() || this.state.longPress?.isHappening)
                                                      ? " multipleSelect"
                                                      : ""}${
                                        this.props.isTraySelected(tray) ? " selected" : ""}`}

                                    // onClick={this.onTrayClick.bind(this, tray)}
                                    onPointerDown={this.onTrayPointerDown.bind(this, tray)}
                                    onPointerEnter={this.onTrayPointerEnter.bind(this, tray)}
                                    onPointerLeave={this.onTrayPointerLeave.bind(this)}
                                    onPointerUp={this.onTrayPointerUp.bind(this, tray)}
                                    key={trayIndex}
                                >
                                    <FontAwesomeIcon
                                        className={`tray-tickbox ${this.props.isTraySelected(tray)
                                                                   ? "tick-selected"
                                                                   : ""}`}
                                        icon={tickSolid}/>
                                    <div className="trayCategory">{tray.category?.name ?? "Mixed"}</div>

                                    <div className="trayExpiry" style={{
                                        backgroundColor: tray.expiry ? getExpiryColour(tray.expiry) : ""
                                    }}>{tray.expiry?.label ?? "?"}</div>

                                    <div className="trayWeight">{tray.weight ?? "?"}kg</div>

                                    <div className="trayCustomField">{tray.customField ?? ""}</div>
                                </div>)}
                        </div>)
                    }</div>
            </div>
        );
    }
}