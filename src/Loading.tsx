import React from "react";
import "./styles/loading.scss";

// VARIABLES DEFINING THE TRAY SPINNER GRID
// DO NOT ADJUST THESE WITHOUT ADJUSTING THE CORRESPONDING VALUES IN "loading.scss"
const gridDistX = 40;   // distance between rows in the grid (in px) (ie, width of tray + 1 x gutter width)
const gridDistY = 25;   // distance between columns in the grid (in px) (ie, height of tray + 1 x gutter width)
const gridCols = 4;     // number of columns in the grid
const gridRows = 3;     // number of rows in the grid

/**
 * Props to be passed into SpinnerTray components
 */
interface SpinnerTrayProps {
    /**
     * Co-ordinates inside the SVG in pixels, from top left, in the format [x, y]
     */
    pos: [number, number];

    /**
     * Animation class to give to the returned SVG rect
     */
    anim?: string;
}

/**
 * State of the LoadingPage component
 */
interface LoadingPageState {
    /**
     * Object that defines any ongoing animations in the format:
     * {
     *     [trayKey]: [animationClass],
     *     [tray2Key]: [animationClass2]
     * }
     */
    animation?: any;
}

/**
 * Spinner tray
 * Returns an SVG rect with class equal to its anim prop
 */
class SpinnerTray extends React.Component<SpinnerTrayProps> {

    render(): React.ReactNode {
        // generate rect with appropriate position and animation class as given in this.props.anim
        return (
            <rect x={this.props.pos[0] * gridDistX} y={this.props.pos[1] * gridDistY}
                  className={`spinner-tray ${this.props.anim ? this.props.anim : ""}`}/>
        );
    }
}

/**
 * Loading page component
 * Contents:
 * - 'Shelfmaster' heading
 * - Loading spinner & 'Loading...' text
 * No props
 */
export class LoadingPage extends React.Component<any, LoadingPageState> {
    traySwapInterval: NodeJS.Timeout | undefined;

    /**
     * Choose two trays to swap, and update the state to reflect this
     */
    swapTrays(): void {
        // Decide what kind of swap to make
        const swapDir: boolean = Math.random() < 0.5; // axis: true => x, false => y
        let swaps = swapDir ? ["r", "l"] : ["d", "u"]; // start generating class names
        const dist = Math.floor(Math.random() * ((swapDir ? gridCols : gridRows) - 1) + 1); // decide distance
        swaps = swaps.map(item => { // finish generating class names
            return `${item}${dist}`;
        });

        // Initialise tray variables
        let startTray, endTray;
        // if swapping vertically
        if (swapDir) {
            // decide first tray
            const row = Math.floor(Math.random() * gridRows);
            const col = Math.floor(Math.random() * (gridCols - dist));
            startTray = `${col}${row}`;

            // find key of the tray at the other end of the swap
            endTray = `${col + dist}${row}`;
        } else {
            // otherwise, swapping horizontally
            // decide first tray
            const col = Math.floor(Math.random() * gridCols);
            const row = Math.floor(Math.random() * (gridRows - dist));
            startTray = `${col}${row}`;

            // find key of the tray at the other end of the swap
            endTray = `${col}${row + dist}`;
        }

        // set state to reflect trays being swapped
        this.setState({
            ...this.state,
            animation: {
                [startTray]: swaps[0],
                [endTray]: swaps[1]
            }
        });
    }

    componentDidMount(): void {
        // when fully rendered, start swapping :D
        this.traySwapInterval = setInterval(this.swapTrays.bind(this), 250);
    }

    componentWillUnmount(): void {
        if (this.traySwapInterval) {
            clearInterval(this.traySwapInterval);
        }
    }

    render(): React.ReactNode {
        return (
            <div id="loadingPage">
                <div id="menu-header">
                    <h1>Shelfmaster</h1>
                </div>
                <div id="loading-box">
                    <svg id="spinner">
                        <g>
                            {
                                Array(gridCols).fill(0).map((_, i) => {
                                    return Array(gridRows).fill(0).map((_, j) => {
                                        const key = `${i}${j}`;
                                        return <rect className="spinner-tray-slot" key={key} x={i * gridDistX}
                                                     y={j * gridDistY}/>;
                                    });
                                })
                            }
                        </g>
                        {
                            Array(gridCols).fill(0).map((_, i) => {
                                return Array(gridRows).fill(0).map((_, j) => {
                                    const key = `${i}${j}`;
                                    return <SpinnerTray anim={this.state?.animation[key]} key={key} pos={[i, j]}/>;
                                });
                            })
                        }
                    </svg>
                    <h2>Loading...</h2>
                </div>
            </div>
        );
    }
}