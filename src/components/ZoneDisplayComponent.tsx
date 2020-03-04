import classNames from "classnames";
import React, {ReactNode} from "react";
import {Shelf} from "../core/WarehouseModel/Layers/Shelf";
import {Zone} from "../core/WarehouseModel/Layers/Zone";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import "./styles/_zonedisplay.scss";

interface ZoneDisplayComponentProps {
    zone: Zone;
    selected: Shelf | null;
    onSelected: null | ((shelf: Shelf) => void);
}

export class ZoneDisplayComponent extends React.Component<ZoneDisplayComponentProps> {

    render(): ReactNode {
        return <div id="nav-zone">{
            this.props.zone.bays.length ? (() => {

                const textColor = getTextColorForBackground(this.props.zone.color);

                return this.props.zone.bays.flatMap((bay, bayIndex) =>
                    <div className="nav-bay" key={bayIndex}>

                        {bay.shelves.map((shelf, shelfIndex) =>

                            <div
                                key={`${bayIndex.toString()}_${shelfIndex.toString()}`}
                                className={classNames("nav-shelf", {
                                    "currentShelf": this.props.selected === shelf
                                })} style={{
                                backgroundColor: this.props.zone.color,
                                color: textColor,
                                border: `1px solid ${textColor}`
                            }}
                                onClick={this.props.onSelected?.bind(this, shelf)}
                            >
                                <p className="shelfLabel">{bay.name}{shelf.name}</p>
                            </div>
                        )}
                    </div>
                );
            })() : <h3>This zone has no bays</h3>
        }</div>;
    }
}