import React from "react";
import "./ViewPort.scss";
import "./core/"


interface ViewPortProps {

}

interface ViewPortState {
    columns:Co
}

export class ViewPort extends React.Component<ViewPortProps, ViewPortState> {

    constructor(props: ViewPortProps) {
        super(props);

    }

    render() {
        return (
            <div id="outer">
                <h1>Green A1</h1>
                <div id="inner">
                    {
                        [1, 2, 3, 4].map((i) => {
                            return <div style={{order: i}} className={"column"}>{i}</div>;
                        })
                    }

                </div>
            </div>
        );
    }
}