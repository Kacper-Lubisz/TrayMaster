import React from "react";
import "./ViewPort.scss";
import {Column, Tray} from "./core/Warehouse";

interface ViewPortProps {
    zoneLabel: string;
}

interface LongPress {
    isHappening: boolean;
    timeout: number;
    dragFrom: number;
    selectedBefore: Map<Tray, boolean>;
}

/**
 *@property
 */
interface ViewPortState {
    columns: Column[];
    selected: Map<Tray, Boolean>;
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
            selected: new Map([trayA, trayB].map((tray) => [tray, true])),
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

    selectTray(tray: Tray, toggle: boolean, e: React.MouseEvent<HTMLDivElement>) {
        let selected = this.state.selected;
        if (!toggle && selected.get(tray)) {
            selected.set(tray, false);
        } else {
            selected.set(tray, true);
        }
        this.forceUpdate();
    }

    updateDragSelection(form: Tray, to: Tray, originalSelection: Map<Tray, boolean>) {

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
                        selectedBefore: clonedSelected
                    }
                }));
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

    onMouseLeave(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {
        console.log("mouse leave");

        if (!(this.state.longPress?.isHappening)) {
            this.setState(Object.assign(this.state, {
                longPress: null
            }));
        }
    }

    onMouseEnter(tray: Tray, e: React.MouseEvent<HTMLDivElement>) {
        console.log("mouse Enter");

        if (this.state.longPress?.isHappening) {
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
                                    className={`tray${(this.state.selected.get(tray) ? " selected" : "")}`}
                                    onClick={this.selectTray.bind(this, tray, true)}
                                    onMouseDown={this.onMouseDown.bind(this, tray)}
                                    onMouseLeave={this.onMouseLeave.bind(this, tray)}
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