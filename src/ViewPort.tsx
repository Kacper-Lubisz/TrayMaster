import React from "react";
import "pepjs";
import "./styles/shelfview.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle as tickSolid} from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle as tickLine} from "@fortawesome/free-regular-svg-icons";
import {Column, Shelf, Tray} from "./core/MockWarehouse";
import classNames from "classnames/bind";

export interface TraySpace {
    column: Column;
    index: number;
}

interface ViewPortProps {
    isShelfEdit: boolean;
    shelf: Shelf;
    selected: Map<Tray | TraySpace, boolean>;
    setSelected: (newMap: Map<Tray | TraySpace, boolean>, callback?: ((() => void) | undefined)) => void;
    isTraySelected: ((tray: Tray | TraySpace) => boolean | undefined);
    areMultipleTraysSelected: () => boolean;
}

/**
 * This is the type for the field in the state of the viewport which controls the dragging behaviour
 */
interface LongPress {
    isHappening: boolean;
    timeout?: number;
    dragFrom: Tray | TraySpace;
    selectedBefore: Map<Tray | TraySpace, boolean>;
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

    private traySpaces: Map<Column, TraySpace[]> = new Map();

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
    updateDragSelectionTo(to: Tray | TraySpace) {

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
            this.padWithTraySpaces(column).map((tray: Tray | TraySpace, trayIndex) => {
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
    onTrayClick(tray: Tray | TraySpace, e: React.PointerEvent<HTMLDivElement>) {

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
    onTrayPointerDown(tray: Tray | TraySpace, e: React.PointerEvent<HTMLDivElement>) {
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
    onTrayPointerUp(tray: Tray | TraySpace, e: React.PointerEvent<HTMLDivElement>) {

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
    onTrayPointerEnter(tray: Tray | TraySpace) {
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
                        this.renderColumn(column, columnIndex)
                    )}
                </div>
            </div>
        );
    }

    renderColumn(column: Column, order: number) {
        return this.props.isShelfEdit ? <div
            style={{
                order: order,
                flexGrow: column.size === "small" ? 2 :
                          column.size === "normal" ? 3
                                                   : 4
            }}
            className="column"
            key={order}
        >
            <button onClick={() => {
                const shelf: Shelf | undefined = column.parentShelf;
                if (shelf) {
                    const index = shelf.columns.indexOf(column);
                    shelf.columns.splice(index, 1);
                } else {
                    throw Error("Shelf undefined");
                }
                this.forceUpdate();
            }}>Remove
            </button>

            <div>
                <button onClick={() => {
                    if (column.size === "small") {
                        column.size = "normal";
                    } else if (column.size === "normal") {
                        column.size = "big";
                    }
                    this.forceUpdate();
                }}>{"←→"}</button>

                <div id="columnSize">{column.size ?? "?"}</div>
                <button onClick={() => {
                    if (column.size === "big") {
                        column.size = "normal";
                    } else if (column.size === "normal") {
                        column.size = "small";
                    }
                    this.forceUpdate();
                }}>{"→←"}</button>
            </div>

            <button onClick={() => {
                column.maxHeight = 1 + (column.maxHeight ?? 3);
                this.traySpaces.delete(column);
                this.forceUpdate();
            }}>{"↑"}</button>
            <div id="columnHeight">{column.maxHeight ?? "?"}</div>
            <button onClick={() => {
                column.maxHeight = -1 + (column.maxHeight ?? 3);
                this.traySpaces.delete(column);
                this.forceUpdate();
            }}>{"↓"}</button>

        </div> : <div
                   style={{
                       order: order,
                       flexGrow: column.size === "small" ? 2 :
                                 column.size === "normal" ? 3
                                                          : 4
                   }}
                   className="column"
                   key={order}
               >{
            this.padWithTraySpaces(column).map(((tray, index) =>
                    <div
                        className={classNames("tray", {
                            "multipleSelect": this.props.areMultipleTraysSelected() || this.state.longPress?.isHappening,
                            "selected": this.props.isTraySelected(tray),
                            "firstTraySpace": index === column.trays.length,
                            "traySpace": !(tray instanceof Tray)
                        })}
                        onPointerDown={this.onTrayPointerDown.bind(this, tray)}
                        onPointerEnter={this.onTrayPointerEnter.bind(this, tray)}
                        onPointerLeave={this.onTrayPointerLeave.bind(this)}
                        onPointerUp={this.onTrayPointerUp.bind(this, tray)}
                        key={index}
                    >
                        <FontAwesomeIcon
                            className={classNames("tray-tickbox", {
                                "tick-selected": this.props.isTraySelected(tray)
                            })}
                            style={this.props.selected.get(tray) ? {"color": "#3347ff"} : {}}
                            icon={this.props.selected.get(tray) ? tickSolid : tickLine}/>

                        {tray instanceof Tray && [
                            <div className="trayCategory" key={1}>{tray.category?.name ?? "Mixed"}</div>,

                            <div className="trayExpiry" key={2} style={{
                                backgroundColor: tray.expiry?.color
                            }}>{tray.expiry?.label ?? "?"}</div>,

                            <div className="trayWeight" key={3}>{tray.weight ?? "?"}kg</div>,

                            <div className="trayCustomField" key={4}>{tray.customField ?? ""}</div>
                        ]}
                        {!(tray instanceof Tray) && [
                            index === column.trays.length && <p key={1}>Tray Space!!! {tray.index}</p>
                        ]}

                    </div>
            ))}
               </div>;
    }

    componentDidUpdate(prevProps: Readonly<ViewPortProps>, prevState: Readonly<ViewPortState>, snapshot?: any): void {
        if (this.props.shelf !== prevProps.shelf) {
            this.traySpaces.clear();
            this.setState({
                ...this.state,
                longPress: null
            });
        }
    }

    padWithTraySpaces(column: Column): (Tray | TraySpace)[] {

        const missingTrays = column.maxHeight ? column.maxHeight - column.trays.length
                                              : 1;

        const existing: TraySpace[] | undefined = this.traySpaces.get(column);
        if (existing) {

            if (existing.length === missingTrays) {

                return (column.trays as (Tray | TraySpace)[]).concat(existing);

            } else if (existing.length > missingTrays) { // there are too many missing trays

                const newSpaces = existing.filter(space => space.index >= column.trays.length);

                this.traySpaces.set(column, newSpaces);
                return (column.trays as (Tray | TraySpace)[]).concat(newSpaces);
            } else { // there are not enough tray spaces

                const traysToAdd = missingTrays - existing.length;
                const newSpaces = Array(traysToAdd).fill(0).map((_, index) => {
                        return {column: column, index: column.trays.length + index};
                    }
                ).concat(existing);

                this.traySpaces.set(column, newSpaces);
                return (column.trays as (Tray | TraySpace)[]).concat(newSpaces);
            }

        } else { // build tray spaces

            const newSpaces = Array(missingTrays).fill(0).map((_, index) => {
                    return {column: column, index: column.trays.length + index};
                }
            );
            this.traySpaces.set(column, newSpaces);

            return (column.trays as (Tray | TraySpace)[]).concat(newSpaces);

        }

    }
}