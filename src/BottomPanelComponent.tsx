import React from "react";

/**
 * This interface represents pages of the bottom panel.
 * @see BottomPanelComponent
 * @see BottomPanelSection
 */
export interface BottomPanelPage {
  name: string;
  sections: BottomPanelSection[];
}

/**
 * This interface represents one section of a page of a bottom panel.
 * @see BottomPanelComponent
 * @see BottomPanelPage
 */
export interface BottomPanelSection {
  title: string;
  buttons: string[];
  onClick: (button: string, index: number) => void;
}

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanelComponent extends React.Component<BottomPanelProps, any> {

  render() {
    return (
      <div id="bottom">
        <button>🡄</button>
        {/*TODO this appears on the right side, it ought to be restyled to be on the left.  We ought to make a separate component for pages */}

        <div
          id="pageContainer"> {/* TODO this ought to be a horizontal list, the buttons should only animate a scroll across this*/}
          {
            this.props.pages.map((page, _) => (
              <div className="page">{

                page.sections.map((section: BottomPanelSection, iSection: number) => (
                  // TODO it might be a good idea to make a page component
                  <div className="bottomSection" key={iSection}>
                    <div className="titleContainer">
                      <h3>{section.title}</h3>
                    </div>
                    <div className="btnContainer">{

                      section.buttons.map((label, iButton) => {

                        const key = iSection.toString() + iButton.toString(); // add parent
                        let onClick = section.onClick.bind(null, label, iButton);

                        return <button key={key} onClick={onClick}>{label}</button>
                      })

                    }</div>
                  </div>
                ))
              }</div>
            ))
          }
        </div>

        <button>🡆</button>
        {/*🡄 🡆 🡅 🡇*/}
      </div>
    );
  }
}

export interface BottomPanelProps {
  pages: BottomPanelPage[]
}
