import React from "react";
import "./styles/loading.scss";

interface SpinnerTrayProps {
    pos: number[],
    anim?: string
}

interface LoadingPageState {
    animation?: any
}

class SpinnerTray extends React.Component<SpinnerTrayProps> {

    render() {
        return (
            <rect x={this.props.pos[0] * 40} y={this.props.pos[1] * 25}
                  className={`spinner-tray ${this.props.anim ? this.props.anim : ""}`}/>
        );
    }
}

export class LoadingPage extends React.Component<any, LoadingPageState> {

    swapTrays() {
        // configurable shelf dimensions: you'd need to add CSS classes and trays to reflect class and key changes
        const shelfWidth = 4;
        const shelfHeight = 3;

        // Decide what kind of swap to make
        const swapDir: boolean = Math.random() < 0.5; // axis: true => x, false => y
        let swaps = swapDir ? ["r", "l"] : ["d", "u"]; // start generating class names
        const dist = Math.floor(Math.random() * ((swapDir ? shelfWidth : shelfHeight) - 1) + 1); // decide distance
        console.log(dist);
        swaps = swaps.map(item => { // finish generating class names
            return `${item}${dist}`;
        });

        // Initialise tray variables
        let startTray, endTray;
        // if swapping vertically
        if (swapDir) {
            // decide first tray
            const row = Math.floor(Math.random() * shelfHeight);
            const col = Math.floor(Math.random() * (shelfWidth - dist));
            startTray = `${col}${row}`;

            // find key of the tray at the other end of the swap
            endTray = `${col + dist}${row}`;
        }
        // otherwise, swapping horizontally
        else {
            // decide first tray
            const col = Math.floor(Math.random() * shelfWidth);
            const row = Math.floor(Math.random() * (shelfHeight - dist));
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
        setInterval(this.swapTrays.bind(this), 250);
    }

    render() {
        return (
            <div id="loadingPage">
                <div id="menu-header">
                    <h1>Shelfmaster</h1>
                </div>
                <div id="loading-box">
                    <svg id="spinner">
                        {
                            Array(4).fill(0).map((_, i) => {
                                return Array(3).fill(0).map((_, j) => {
                                    let key = `${i}${j}`;
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