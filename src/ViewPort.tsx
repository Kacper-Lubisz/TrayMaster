import React from "react";
import "./styles/ViewPort.scss";
import "./styles/shelfview.scss";
import {Column, Tray} from "./core/Warehouse";
import selectedIcon from "./icons/check_circle-24px.svg";
import notSelectedIcon from "./icons/check_circle_outline-24px.svg";

interface ViewPortProps {
    columns: Column[];
}

/**
 * This is the type for the field in the state of the viewport which controls the dragging behaviour
 */
interface LongPress {
    isHappening: boolean;
    timeout: number;
    dragFrom: Tray;
    selectedBefore: Map<Tray, boolean>;
}

/**
 * The state of the ViewPort
 * @property columns The columns that the viewport displays
 */
interface ViewPortState {
    selected: Map<Tray, boolean>;
    isMultipleSelect: boolean;
    mouseDown?: boolean;
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
            isMultipleSelect: false,
            selected: new Map(),
        };
    }

    /**
     * This method is called when a dragging event is started.  This event is started when the timeout which is started
     * inside onTrayMouseDown succeeds.  This timeout could fail iff the mouse leaves the tray or if the mouse is
     * released before the timeout finishes.
     */
    onDragSelectStart() {

        const selectedBefore = new Map();
        this.state.selected.forEach((selected, tray) => {
            selectedBefore.set(tray, selected);
        });

        this.setState({
            ...this.state,
            longPress: {
                isHappening: true,
                timeout: -1,
                dragFrom: this.state.longPress?.dragFrom!!,
                selectedBefore: selectedBefore,
            },
            isMultipleSelect: true
        }, () => {
            console.log(this.state);
            this.updateDragSelection(this.state.longPress?.dragFrom!!);
        });
    }

    /**
     * This method is called to update the state of the drag event.  It is called when the mouse enters a new tray while
     * the viewport is in dragging mode.  This method sets the selection state based on the selection state from when
     * the drag started (longPress.selectedBefore).
     * @param to The tray that the mouse just entered, which triggered this listener
     */
    updateDragSelection(to: Tray) {

        this.state.selected.forEach((_, tray) => { // reset selection
            this.state.selected.set(tray, this.state.longPress?.selectedBefore.get(tray) ?? false);
        });

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

        const trayOrdered = this.props.columns.flatMap((column, columnIndex) =>
            column.trays.map((tray: Tray, trayIndex) => {
                if (tray === from) {
                    boundIndices.from.column = columnIndex;
                    boundIndices.from.tray = trayIndex;
                }
                if (tray === to) {
                    boundIndices.to.column = columnIndex;
                    boundIndices.to.tray = trayIndex;
                }

                return {
                    columnIndex: columnIndex,
                    trayIndex: trayIndex,
                    tray: tray
                };
            })
        ).sort(((a, b) => {

            // this is a multi level sort

            if (a.columnIndex < b.columnIndex) return -1;
            if (a.columnIndex > b.columnIndex) return 1;

            const invertColumns = boundIndices.from.column < boundIndices.to.column ? 1
                                                                                    : -1;
            // this invert makes sure that trays above the start tray are always selected

            if (a.trayIndex < b.trayIndex) return 1 * invertColumns;
            if (a.trayIndex > b.trayIndex) return -1 * invertColumns;

            return 0;
        })).map(it => it.tray);

        trayOrdered.reduce((isSelecting, tray) => {

            const selectThis = isSelecting || tray === from || tray === to;

            if (selectThis) {
                this.state.selected.set(tray, true);
            }
            return xor(isSelecting, xor(tray === from, tray === to));

        }, false); // the accumulator of the fold is if the trays are still being selected

        this.forceUpdate(); // the state has been changed
    }

    /**
     * This method is called when a drag event is ended.  It is used to finalise the state.
     */
    onDragSelectEnd() {

        this.setState({ // if only one tray is selected, return to single select mode
            ...this.state,
            longPress: null,
        });

    }

    /**
     * This method is called when a tray is clicked, a click being a higher level combination of onMouseDown and
     * onMouseUp.  This method controls the selecting behaviour of a singular tray.  Notably, this method is also called
     * after a mouse drag event if the event ends on the same tray as it started.
     * @param tray The tray that is clicked
     * @param e The react event object which triggered this listener
     */
    onTrayClick(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {

        const newTraySelection = !this.state.selected.get(tray); // if the tray will become selected

        if (!this.state.isMultipleSelect && newTraySelection) { // deselect the currently selected
            this.state.selected.forEach((_, tray) =>
                this.state.selected.set(tray, false)
            );
            this.state.selected.set(tray, newTraySelection);
            this.forceUpdate();

        } else if (this.state.isMultipleSelect) {
            this.state.selected.set(tray, newTraySelection);

            const numSelected = Array.from(this.state.selected.entries())
                                     .filter(([_, value]) => value).length;

            if (numSelected === 1) {
                this.setState({ // if only one tray is selected, return to single select mode
                    ...this.state,
                    isMultipleSelect: false
                });
            } else {
                this.forceUpdate();
            }

        } // else !multipleSelect && !newSelected, can't deselect

    }

    /**
     * This method is called when the mouse is pressed over a tray, it begins the timeout which controls dragging
     * @param tray The tray on which the mouse is pressed
     * @param e The react mouse event that triggered this call
     */
    onTrayMouseDown(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {

        const timeout: number = window.setTimeout(() => { // await hold time
            if (this.state.longPress?.timeout !== undefined) { // not interrupted
                this.onDragSelectStart();
            }
        }, LONG_PRESS_TIMEOUT);

        this.setState(Object.assign(this.state, {
            longPress: {
                isHappening: false,
                timeout: timeout,
                dragFrom: tray
            }
        }));
    }

    /**
     * This method is called when the mouse button is released over a tray, this either cancels the new drag event
     * timeout, finalises a current dragging event or performs a mouse click.
     * @param tray The tray over which the even is triggered
     * @param e The react mouse event that triggered this call
     */
    onTrayMouseUp(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {

        if (this.state.longPress) {
            if (this.state.longPress.isHappening) {
                this.onDragSelectEnd(); // end of drag
            } else {
                window.clearTimeout(this.state.longPress.timeout);
                this.setState(Object.assign(this.state, {
                    longPress: null
                }));
                this.onTrayClick(tray, e);
            }
        } else {
            this.onTrayClick(tray, e);
        }
    }

    /**
     * This method is called when the mouse enters the DOM element which represents a any tray.  This method stops a
     * mouse down event from starting a drag event.
     * @param e The react mouse event that triggered this call
     */
    onTrayMouseLeave(e: React.MouseEvent<HTMLDivElement>) {

        if (this.state.longPress && !this.state.longPress.isHappening) {
            // is between mouse down and drag start
            window.clearTimeout(this.state.longPress?.timeout);

            this.setState(Object.assign(this.state, { // kills the long press
                longPress: null
            }));
        }
    }

    /**
     * This method is called when the mouse enters the DOM element which represents a particular tray
     * @param tray The tray over which the mouse entered
     */
    onTrayMouseEnter(tray: Tray) {

        if (this.state.longPress?.isHappening) {
            this.updateDragSelection(tray);
        }
    }

    /**
     * @inheritDoc
     */
    render() {

        return (
            <div id="viewPort">
                <div id="shelf">
                    {this.props.columns.map((column, columnIndex) =>

                        <div
                            style={{order: columnIndex}}
                            className="column"
                            key={columnIndex}
                        >
                            {column.trays.map((tray, trayIndex) =>

                                <div
                                    className={`tray${this.state.isMultipleSelect ? " multipleSelect" : ""}${
                                        this.state.selected.get(tray) ? " selected" : ""}`}

                                    // onClick={this.onTrayClick.bind(this, tray)}
                                    onMouseDown={this.onTrayMouseDown.bind(this, tray)}
                                    onMouseEnter={this.onTrayMouseEnter.bind(this, tray)}
                                    onMouseLeave={this.onTrayMouseLeave.bind(this)}
                                    onMouseUp={this.onTrayMouseUp.bind(this, tray)}
                                    key={trayIndex}
                                >
                                    <img src={this.state.selected.get(tray) ? selectedIcon : notSelectedIcon}
                                         alt="selected icon"/>
                                    <div className="trayCategory">{tray.category?.name ?? "Mixed"}</div>

                                    <div className="trayExpiry" style={{
                                        backgroundColor: tray.expiry?.color
                                    }}>{tray.expiry?.label ?? "?"}</div>

                                    <div className="trayWeight">{tray.weight ?? "?"}</div>

                                    <div className="trayCustomField">{tray.customField ?? ""}</div>
                                </div>)}
                        </div>)
                    }</div>
            </div>
        );
    }
}