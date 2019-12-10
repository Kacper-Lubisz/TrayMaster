import React from "react";
import "./ViewPort.scss";
import {Column, Tray} from "./core/Warehouse";

interface ViewPortProps {
    zoneLabel: string;
}

interface LongPress {
    isHappening: boolean;
    timeout: number;
    dragFrom: Tray;
    selectedBefore: Map<Tray, boolean>;
}

/**
 *@property
 */
interface ViewPortState {
    columns: Column[];
    selected: Map<Tray, boolean>;
    isMultipleSelect: boolean;
    mouseDown?: boolean;
    longPress?: LongPress;
}

const LONG_PRESS_TIMEOUT = 300;

export class ViewPort extends React.Component<ViewPortProps, ViewPortState> {

    constructor(props: ViewPortProps) {
        super(props);

        let category = {name: "Beans"};
        let expiry = {
            from: new Date().getTime(),
            to: new Date().getTime(),
            label: "2020",
            color: "#ff0"
        };
        let weight: number = 10.1;

        let trayA = new Tray(category, expiry, weight, "CUSTOM FIELD");
        let trayB = new Tray(category, expiry, weight);

        let bigBoyTray = new Tray({
            name: "BeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeansBeans"
        }, expiry, weight);

        this.state = {
            isMultipleSelect: false,
            selected: new Map([trayA].map((tray) => [tray, true])),
            columns: [
                new Column([
                    new Tray(category, expiry, weight),
                    trayA,
                    new Tray(category, expiry, weight),
                    new Tray(category, expiry, weight)
                ]),
                new Column([
                    new Tray(category, expiry, weight),
                    new Tray(category, expiry, weight),
                    new Tray(category, expiry, weight)
                ]),
                new Column(Array(15).fill(0).map(() => {
                    return new Tray(category, expiry, weight);
                })),
                new Column([
                    new Tray(category, expiry, weight),
                    new Tray(category, expiry, weight),
                    trayB,
                    // bigBoyTray
                    // fixme This doesn't work, the style needs fixing for big trays 😉
                ]),
            ]
        };
    }

    /**
     * This method allows for selecting a tray.  The behaviour changes depending on if the viewport is in multiple
     * select mode.  If in multiple select mode, the last tray can't be deselected.  The target selection state can be
     * specified, if null will toggle.
     *
     * @param tray The tray to be selected
     * @param to if the tray should be selected or deselected, if null it will toggle
     * @param selectionMap The map of currently selected trays, defaults to the states selection of null
     * @param isMultipleSelect If multiple selections are to be allowed
     */
    selectTray(
        tray: Tray,
        to: boolean,
        selectionMap: Map<Tray, boolean> = this.state.selected,
        isMultipleSelect: boolean = this.state.isMultipleSelect
    ): Map<Tray, boolean> {
        const selected = selectionMap;
        const multipleSelect = isMultipleSelect;

        const newSelected = (to === undefined && !selected.get(tray)) || to;
        // if the tray will become selected

        if (!multipleSelect && newSelected) { // deselect the currently selected
            selected.forEach((_, tray) =>
                selected.set(tray, false)
            );
            selected.set(tray, newSelected);
        } else if (multipleSelect) {
            selected.set(tray, newSelected);
        } // else !multipleSelect && !newSelected, can't deselect

        if (selectionMap === this.state.selected) {
            this.forceUpdate();
        }

        return selectionMap;
    }

    updateDragSelection(from: Tray, to: Tray, originalSelection: Map<Tray, boolean>) {

        this.state.selected.forEach((_, key) =>
            // this.state.selected.set(key, originalSelection.get(key) ?? false)
            this.state.selected.set(key, false)
        );

        const xor: (a: boolean, b: boolean) => boolean = (a, b) => a ? !b : b;

        let selection = originalSelection;
        let selecting = false;

        this.state.columns.flatMap(col => {
            return col.trays;
        }).forEach((tray, index) => {
            const selectThis = selecting || tray === from || tray === to;
            if (selectThis) {
                selection = this.selectTray(tray, true, selection, true);
            }
            selecting = xor(selecting, xor(tray === from, tray === to));
        });

        this.setState(Object.assign(this.state, {
            selected: selection
        }));

    }

    onMouseDown(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {

        const timeout: number = window.setTimeout(() => { // await hold time

            if (this.state.longPress?.timeout !== undefined) { // not interrupted
                console.log("TIMEOUT ", JSON.stringify(this.state.longPress));

                const clonedSelected = new Map();
                this.state.selected.forEach((selected, tray) => {
                    clonedSelected.set(tray, selected);
                });

                this.setState(Object.assign(this.state, {
                    longPress: {
                        isHappening: true,
                        timeout: 0,
                        dragFrom: tray,
                        selectedBefore: clonedSelected,
                    },
                    isMultipleSelect: true
                }), () => {
                    // this.selectTray(tray, true, this.state.isMultipleSelect);
                });
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

    onMouseUp(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {
        console.log("mouse up");

        if (this.state.longPress !== undefined) {
            if (this.state.longPress.isHappening) {
                // long press done
            } else {
                window.clearTimeout(this.state.longPress.timeout);
                this.setState(Object.assign(this.state, {
                    longPress: null
                }));
            }
        }
    }

    onMouseLeave() {
        if (!(this.state.longPress?.isHappening)) {
            this.setState(Object.assign(this.state, {
                longPress: null
            }));
        }
    }

    onMouseEnter(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {
        console.log("mouse Enter");

        if (this.state.longPress?.isHappening) {

            this.updateDragSelection(this.state.longPress.dragFrom, tray, this.state.longPress.selectedBefore);

        }

    }

    render() {
        return (
            <div id="outer">
                <h1>Green A1</h1>

                <div id="shelf">
                    {this.state.columns.map((column, columnIndex) =>

                        <div
                            style={{order: columnIndex}}
                            className="column"
                            key={columnIndex}
                        >
                            {column.trays.map((tray, trayIndex) =>

                                <div
                                    className={`tray${this.state.isMultipleSelect ? " multipleSelect" : ""}${
                                        this.state.selected.get(tray) ? " selected" : ""}`}

                                    onClick={this.selectTray.bind(this, tray, true, undefined, undefined)}
                                    onMouseDown={this.onMouseDown.bind(this, tray)}
                                    onMouseLeave={this.onMouseLeave.bind(this)}
                                    onMouseEnter={this.onMouseEnter.bind(this, tray)}
                                    onMouseUp={this.onMouseUp.bind(this, tray)}
                                    key={trayIndex}
                                >
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