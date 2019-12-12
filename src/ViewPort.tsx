import React from "react";
import "./ViewPort.scss";
import {Column, Tray} from "./core/Warehouse";
import selectedIcon from "./icons/check_circle-24px.svg";
import notSelectedIcon from "./icons/check_circle_outline-24px.svg";

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
            this.updateDragSelection(this.state.longPress?.dragFrom!!);
        });
    }

    updateDragSelection(to: Tray) {

        this.state.selected.forEach((_, tray) => { // reset selection
            this.state.selected.set(tray, this.state.longPress?.selectedBefore.get(tray) ?? false);
        });

        const xor: (a: boolean, b: boolean) => boolean = (a, b) => a ? !b : b;

        const from = this.state.longPress?.dragFrom;
        // fixme this tray order can shouldn't be calculated on each call to this method
        // todo use the fields from trays and columns to sort this
        const trayOrdered = this.state.columns.flatMap((column, columnIndex) =>
            column.trays.map((tray: Tray, trayIndex) => {
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

            if (a.trayIndex < b.trayIndex) return 1;
            if (a.trayIndex > b.trayIndex) return -1;

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

    onDragSelectEnd() {
        console.log("end of the thing")

        this.setState(Object.assign(this.state, {
            longPress: null,
        }));
    }

    onTrayClick(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {

        console.log("this is a bad");

        e.preventDefault();
        e.stopPropagation();

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

    onTrayMouseDown(tray: Tray) {

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

    onTrayMouseUp(e: React.MouseEvent<HTMLDivElement>) {
        if (this.state.longPress !== undefined) {
            if (this.state.longPress.isHappening) {
                this.onDragSelectEnd();
                e.preventDefault();
            } else {
                window.clearTimeout(this.state.longPress.timeout);
                this.setState(Object.assign(this.state, {
                    longPress: null
                }));
            }
        }
    }

    onTrayMouseLeave() {
        if (!(this.state.longPress?.isHappening)) {
            this.setState(Object.assign(this.state, {
                longPress: null
            }));
        }
    }

    onTrayMouseEnter(tray: Tray) {
        if (this.state.longPress?.isHappening) {
            this.updateDragSelection(tray);
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

                                    onClick={this.onTrayClick.bind(this, tray)}
                                    onMouseDown={this.onTrayMouseDown.bind(this, tray)}
                                    onMouseEnter={this.onTrayMouseEnter.bind(this, tray)}
                                    onMouseLeave={this.onTrayMouseLeave.bind(this)}
                                    onMouseUp={this.onTrayMouseUp.bind(this)}
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