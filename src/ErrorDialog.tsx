import Popup from "reactjs-popup";
import React, {Component} from "react";

interface ControlledPopupState {
    open: boolean;
}

class ControlledPopup extends Component<any, ControlledPopupState> {
    constructor(props: any) {
        super(props);
        this.state = {open: false};
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
    }

    openModal() {
        this.setState({open: true});
    }

    closeModal() {
        this.setState({open: false});
    }

    render() {
        return (
            <div>
                <Popup
                    open={this.state.open}
                    closeOnDocumentClick
                    onClose={this.closeModal}
                >
                    <div className="modal">
                        <a className="close" onClick={this.closeModal}>
                            &times;
                        </a>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae magni
                        omnis delectus nemo, maxime molestiae dolorem numquam mollitia, voluptate
                        ea, accusamus excepturi deleniti ratione sapiente! Laudantium, aperiam
                        doloribus. Odit, aut.
                    </div>
                </Popup>
            </div>
        );
    }
}