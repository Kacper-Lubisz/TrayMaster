import {faArrowLeft, faHome} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {TrayMasterLogo} from "../components/TrayMasterLogo";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel";
import "../styles/warehouseswitcher.scss";

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
        return <>
            <TrayMasterLogo/>

            <div id="switch-box">
                <h1>Select Warehouse</h1>
                {this.props.user.accessibleWarehouses.some(warehouse => warehouse.id === this.props.user.lastWarehouseID)
                 ?
                 <button className="key-btn" onClick={() => this.props.history.goBack()}>
                     <FontAwesomeIcon className="back-btn" icon={faArrowLeft}/>
                     <p>Back</p>
                 </button> : undefined}

                {this.props.user.accessibleWarehouses.length === 0 ? <>
                    <p>You don't have access to any warehouses! You might want to contact your administrator.</p>
                    {/*fixme add back button*//*<button onClick={() => this.props.history.goBack()}>Go back</button>*/}
                </> : <div id="warehouse-list">
                     <div id="warehouse-options-container">{
                         this.props.user.accessibleWarehouses.map((warehouse, index) =>
                             <div
                                 className={classNames("warehouse-option", {
                                     "warehouse-option-selected": warehouse.id === this.props.user.lastWarehouseID
                                 })}
                                 key={index}
                                 onClick={() => this.props.setWarehouse(warehouse)}
                             >
                                 <FontAwesomeIcon icon={faHome}/>
                                 <p>{warehouse.name}</p>

                             </div>
                         )
                     }</div>
                 </div>}
            </div>
        </>;
    }

}


export default withRouter(WarehouseSwitcherPage);