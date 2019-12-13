import React from 'react';
import {TopBar} from "./TopBar";
import {SideBar} from "./SideBar";
import {ViewPort} from "./ViewPort";
import {BottomPanelComponent, BottomPanelPage} from "./BottomPanelComponent";
import "./styles/shelfview.scss";

export class ShelfView extends React.Component<any, any> {

  pages: BottomPanelPage[];

  constructor(props: any) {
    super(props);

    this.pages = [{
      name: "Categories", sections: [
        {
          title: "All",
          buttons: ["Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans", "Beans"],
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
            buttons: ["2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020", "2020"],
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

  }

  render() {
    return (
      //TODO should change ID to "shelf-view"
      <div id="app">
        <TopBar/>
        <ViewPort/>
        <SideBar/>
        <BottomPanelComponent pages={this.pages}/>
      </div>
    );
  }

}


