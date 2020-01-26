import React from "react";
import "../styles/settings.scss";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome} from "@fortawesome/free-solid-svg-icons";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel";

interface WarehouseSwitcherProps {
    user: User;
    setWarehouse: (warehouse: Warehouse) => void;
}

interface WarehouseSwitcherState {
    loading: boolean;
}

/**
 * RouteComponentProps enables the history.push to change paths
 */
class WarehouseSwitcherPage extends React.Component<RouteComponentProps & WarehouseSwitcherProps, WarehouseSwitcherState> {

    constructor(props: RouteComponentProps & WarehouseSwitcherProps) {
        super(props);
        this.state = {
            loading: false
        };
    }


    render(): React.ReactNode {
        return <div>
            <h1>Change Warehouse</h1>

            {this.props.user.accessibleWarehouses.length === 0 ? <p>
                You don't have access to any warehouse! Contact your administrator, more info in the manual
            </p> : <div id="warehouseList">{
                this.props.user.accessibleWarehouses.map((warehouse, index) =>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            cursor: "pointer"
                        }}
                        key={index}
                        onClick={() => this.props.setWarehouse(warehouse)}
                    >
                        {/*todo this can be styled and displayed in any way, maybe move the last warehouse to the top or something*/}
                        <FontAwesomeIcon
                            style={warehouse.id === this.props.user.lastWarehouseID ? {
                                color: "#ff0000"
                            } : {}}
                            icon={faHome}
                        />
                        <p>{warehouse.name}</p>

                    </div>
                )
            }</div>}
        </div>;
    }

}


export default withRouter(WarehouseSwitcherPage);