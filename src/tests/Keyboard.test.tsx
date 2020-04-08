// Following https://gist.github.com/jackawatts/1c7a8d3c277ccf4e969675002fe35bc9

import {
    faAmericanSignLanguageInterpreting as icon1,
    faSolarPanel as icon3,
    faSpider as icon2
} from "@fortawesome/free-solid-svg-icons";
import Enzyme from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import renderer from "react-test-renderer";
import {createRenderer} from "react-test-renderer/shallow";
import {Keyboard} from "../components/Keyboard";

// configure Enzyme to use React 16
Enzyme.configure({adapter: new React16Adapter()});

// noinspection DuplicatedCode

describe("Keyboard matches snapshots:", () => {
    it("renders no keys", () => {
        const props = {
            buttons: [],
            gridX: 1
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders one key", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()}
            ],
            gridX: 1
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders selected buttons", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()},
                {name: "Geoffrey", onClick: jest.fn(), selected: true},
                {name: "Doris", onClick: jest.fn()}
            ],
            gridX: 3
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders multi-line keyboards", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()},
                {name: "Geoffrey", onClick: jest.fn(), selected: false},
                {name: "Doris", onClick: jest.fn()},
                {name: "Steve", onClick: jest.fn()},
                {name: "Paul", onClick: jest.fn()},
                {name: "Dave", onClick: jest.fn()}
            ],
            gridX: 3
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders disabled keyboard", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()},
                {name: "Geoffrey", onClick: jest.fn(), selected: false},
                {name: "Doris", onClick: jest.fn()},
                {name: "Steve", onClick: jest.fn()},
                {name: "Paul", onClick: jest.fn()},
                {name: "Dave", onClick: jest.fn()}
            ],
            gridX: 3,
            disabled: true
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders keyboard with a number of buttons that's not divisible by gridX", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()},
                {name: "Geoffrey", onClick: jest.fn(), selected: false},
                {name: "Doris", onClick: jest.fn()},
                {name: "Steve", onClick: jest.fn()},
                {name: "Paul", onClick: jest.fn()},
                {name: "Dave", onClick: jest.fn()}
            ],
            gridX: 4
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders with a given id", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()},
                {name: "Geoffrey", onClick: jest.fn(), selected: false},
                {name: "Doris", onClick: jest.fn()},
                {name: "Steve", onClick: jest.fn()},
                {name: "Paul", onClick: jest.fn()},
                {name: "Dave", onClick: jest.fn()}
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders coloured buttons", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn(), bg: "#00ff00"},
                {name: "Geoffrey", onClick: jest.fn(), selected: false},
                {name: "Doris", icon: icon2, onClick: jest.fn(), bg: "#00d2ff"},
                {name: "Steve", icon: icon3, onClick: jest.fn(), bg: "#000000"},
                {name: "Paul", onClick: jest.fn(), bg: "#212d3a"},
                {name: "Dave", icon: icon1, onClick: jest.fn(), bg: "#ffffff"}
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const kbRenderer = createRenderer(); // shallow render needed because FontAwesomeIcons change between runs
        kbRenderer.render(<Keyboard {...props} />);
        expect(kbRenderer.getRenderOutput()).toMatchSnapshot();
        kbRenderer.unmount();
    });

    it("renders with Font Awesome icons in buttons", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn()},
                {name: "Geoffrey", onClick: () => jest.fn(), selected: false},
                {name: "Doris", icon: icon2, onClick: jest.fn()},
                {name: "Steve", icon: icon3, onClick: jest.fn()},
                {name: "Paul", onClick: jest.fn()},
                {name: "Dave", icon: icon1, onClick: jest.fn()}
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const kbRenderer = createRenderer(); // shallow render needed because FontAwesomeIcons change between runs
        kbRenderer.render(<Keyboard {...props} />);
        expect(kbRenderer.getRenderOutput()).toMatchSnapshot();
        kbRenderer.unmount();
    });

    it("renders with multiple selected buttons", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn(), selected: true},
                {name: "Geoffrey", onClick: jest.fn(), selected: true},
                {name: "Doris", onClick: jest.fn()},
                {name: "Steve", onClick: jest.fn()},
                {name: "Paul", onClick: jest.fn(), selected: true},
                {name: "Dave", onClick: jest.fn(), selected: false}
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders with multiple disabled buttons", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn(), disabled: true},
                {name: "Geoffrey", onClick: jest.fn(), disabled: true},
                {name: "Doris", onClick: jest.fn()},
                {name: "Steve", onClick: jest.fn(), disabled: true},
                {name: "Paul", onClick: jest.fn(), disabled: true},
                {name: "Dave", onClick: jest.fn(), disabled: false}
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders the big chonker", () => {
        const props = {
            buttons: [
                {name: "Bob", onClick: jest.fn(), disabled: true},
                {name: "Geoffrey", onClick: jest.fn(), selected: true},
                {name: "Doris", icon: icon2, onClick: jest.fn(), bg: "#000000"},
                {name: "Steve", icon: icon3, onClick: jest.fn(), disabled: false},
                {name: "Paul", onClick: jest.fn(), bg: "#ff0000"},
                {name: "Dave", icon: icon1, onClick: jest.fn(), selected: true}
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const kbRenderer = createRenderer(); // shallow render needed because FontAwesomeIcons change between runs
        kbRenderer.render(<Keyboard {...props} />);
        expect(kbRenderer.getRenderOutput()).toMatchSnapshot();
        kbRenderer.unmount();
    });
});

describe("Keyboard DOM tests:", () => {
    it("Buttons execute their onClick functions", () => {
        // https://stackoverflow.com/a/46211877/5094386

        const mockCallback = jest.fn();
        const props = {
            buttons: [
                {name: "Geoff", onClick: mockCallback}
            ],
            gridX: 1
        };

        const keyboard = Enzyme.mount(<Keyboard {...props} />);
        keyboard.find("button").simulate("click");
        expect(mockCallback.mock.calls.length).toEqual(1);
        keyboard.unmount();
    });

    it("Generates the right number of rows", () => {
        for (let i = 0; i < 10; i++) {
            const btnCount = Math.floor(Math.random() * 20 + 20); // anywhere from 20-39
            const gridX = Math.floor(Math.random() * 7 + 3); // anywhere from 3-9

            const props = {
                buttons: Array(btnCount).fill(0).map((_, i) => {
                    return {
                        name: `Btn ${i}`
                    };
                }),
                gridX: gridX
            };

            const keyboard = Enzyme.mount(<Keyboard {...props} />);
            expect(keyboard.find("div.kb-row")).toHaveLength(Math.ceil(btnCount / gridX));
            expect(keyboard.find("div.kb-row:last-child button.key-btn")).toHaveLength(btnCount % gridX || gridX);
            keyboard.unmount();
        }
    });
});
