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
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                }
            ],
            gridX: 1
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders selected buttons", () => {
        const props = {
            buttons: [
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: true
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                }
            ],
            gridX: 3
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders multi-line keyboards", () => {
        const props = {
            buttons: [
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: false
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    onClick: () => {
                        alert("No");
                    }
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    }
                },
                {
                    name: "Dave",
                    onClick: () => {
                        alert("Absolutely not");
                    }
                }
            ],
            gridX: 3
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders disabled keyboard", () => {
        const props = {
            buttons: [
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: false
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    onClick: () => {
                        alert("No");
                    }
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    }
                },
                {
                    name: "Dave",
                    onClick: () => {
                        alert("Absolutely not");
                    }
                }
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
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: false
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    onClick: () => {
                        alert("No");
                    }
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    }
                },
                {
                    name: "Dave",
                    onClick: () => {
                        alert("Absolutely not");
                    }
                }
            ],
            gridX: 4
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders with a given id", () => {
        const props = {
            buttons: [
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: false
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    onClick: () => {
                        alert("No");
                    }
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    }
                },
                {
                    name: "Dave",
                    onClick: () => {
                        alert("Absolutely not");
                    }
                }
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const tree = renderer.create(<Keyboard {...props} />).toJSON();
        expect(tree).toMatchSnapshot();
    });

    it("renders with Font Awesome icons in buttons", () => {
        const props = {
            buttons: [
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    }
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: false
                },
                {
                    name: "Doris",
                    icon: icon2,
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    icon: icon3,
                    onClick: () => {
                        alert("No");
                    }
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    }
                },
                {
                    name: "Dave",
                    icon: icon1,
                    onClick: () => {
                        alert("Absolutely not");
                    }
                }
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const kbRenderer = createRenderer(); // shallow render needed because FontAwesomeIcons change between runs
        kbRenderer.render(<Keyboard {...props} />);
        expect(kbRenderer.getRenderOutput()).toMatchSnapshot();
    });

    it("renders with multiple selected buttons", () => {
        const props = {
            buttons: [
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    },
                    selected: true
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: true
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    onClick: () => {
                        alert("No");
                    }
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    },
                    selected: true
                },
                {
                    name: "Dave",
                    onClick: () => {
                        alert("Absolutely not");
                    },
                    selected: false
                }
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
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    },
                    disabled: true
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    disabled: true
                },
                {
                    name: "Doris",
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    onClick: () => {
                        alert("No");
                    },
                    disabled: true
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    },
                    disabled: true
                },
                {
                    name: "Dave",
                    onClick: () => {
                        alert("Absolutely not");
                    },
                    disabled: false
                }
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
                {
                    name: "Bob",
                    onClick: () => {
                        alert("hello");
                    },
                    disabled: true
                },
                {
                    name: "Geoffrey",
                    onClick: () => {
                        alert("I am the coolest because I'm selected");
                    },
                    selected: true
                },
                {
                    name: "Doris",
                    icon: icon2,
                    onClick: () => {
                        alert("Yes");
                    }
                },
                {
                    name: "Steve",
                    icon: icon3,
                    onClick: () => {
                        alert("No");
                    },
                    disabled: false
                },
                {
                    name: "Paul",
                    onClick: () => {
                        alert("Perhaps");
                    }
                },
                {
                    name: "Dave",
                    icon: icon1,
                    onClick: () => {
                        alert("Absolutely not");
                    },
                    selected: true
                }
            ],
            gridX: 4,
            id: "BigBoy"
        };

        const kbRenderer = createRenderer(); // shallow render needed because FontAwesomeIcons change between runs
        kbRenderer.render(<Keyboard {...props} />);
        expect(kbRenderer.getRenderOutput()).toMatchSnapshot();
    });
});

describe("Keyboard DOM tests:", () => {
    it("Buttons execute their onClick functions", () => {
        // https://stackoverflow.com/a/46211877/5094386
        const mockCallback = jest.fn();
        const props = {
            buttons: [
                {
                    name: "Geoff",
                    onClick: mockCallback
                }
            ],
            gridX: 1
        };

        const keyboard = Enzyme.mount(<Keyboard {...props} />);
        keyboard.find("button").simulate("click");
        expect(mockCallback.mock.calls.length).toEqual(1);
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
        }
    });
});
