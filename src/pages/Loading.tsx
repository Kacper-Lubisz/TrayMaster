import React from "react";
import "../styles/loading.scss";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {TrayMasterLogo} from "../components/TrayMasterLogo";

/**
 * Loading page component
 * Contents:
 * - 'TrayMaster' heading
 * - Loading spinner & 'Loading...' text
 * No props
 */
export class LoadingPage extends React.Component {

    render(): React.ReactNode {
        return <div id="loadingPage">
            <TrayMasterLogo/>
            <div id="loading-box">
                <LoadingSpinner/>
                <h2>Loading...</h2>
            </div>
        </div>;

    }
}