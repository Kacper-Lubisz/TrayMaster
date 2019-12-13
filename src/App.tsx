import React from "react";
import "./App.scss";
import {ViewPort} from "./ViewPort";
import {BottomPanelPage} from "./BottomPanelComponent";
import {Column, Tray} from "./core/Warehouse";

class App extends React.Component<any, any> {

    pages: BottomPanelPage[];

    constructor(props: any) {
        super(props);

        this.pages = [
            {
                name: "Categories", sections: [
                    {
                        title: "All",
                        buttons: [
                            "Peas", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans",
                            "Beans", "Beans", "Beans", "Beans", "Beans"
                        ],
                        onClick: () => null
                    }, {
                        title: "Suggested",
                        buttons: ["Beans", "Beans", "Beans <3", "Beans", "Beans"],
                        onClick: () => null
                    }
                ]
            },
            {
                name: "Expiry", sections: [
                    {
                        title: "Years",
                        buttons: [
                            "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020",
                            "2020", "2020", "2020", "2020"
                        ],
                        onClick: () => null
                    }, {
                        title: "Quarters",
                        buttons: ["Q1", "Q2", "Q3", "Q4"],
                        onClick: () => null
                    }, {
                        title: "Months",
                        buttons: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        onClick: () => null
                    },
                ]
            }
        ];

        // Warehouse.loadWarehouse().then(warehouse => {
        //     console.log(warehouse);
        // });

    }

    render() {

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

        const columns = [
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
        ];
        // todo derive the columns to feed to the viewport from the shelf view state

        return (
            <div id="app">
                <ViewPort zoneLabel={"Green 1A"} columns={columns}/>
            </div>
        );
    }

}


export default App;
