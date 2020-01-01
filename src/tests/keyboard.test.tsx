import React from "react";
import renderer from "react-test-renderer";
import ShallowRenderer from "react-test-renderer/shallow";
import {Keyboard} from "../keyboard";
import {
    faAmericanSignLanguageInterpreting as icon1,
    faSolarPanel as icon3,
    faSpider as icon2
} from "@fortawesome/free-solid-svg-icons";

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

        // @ts-ignore
        const kbRenderer = new ShallowRenderer(); // shallow render needed because FontAwesomeIcons change between runs
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

        // @ts-ignore
        const kbRenderer = new ShallowRenderer(); // shallow render needed because FontAwesomeIcons change between runs
        kbRenderer.render(<Keyboard {...props} />);
        expect(kbRenderer.getRenderOutput()).toMatchSnapshot();
    });
});