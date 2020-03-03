import React from "react";
import {User} from "../core/Firebase/Authentication";
import {Category, ExpiryRange, Warehouse} from "../core/WarehouseModel";
import {MONTHS_TRANSLATOR} from "../utils/monthsTranslator";

type CustomKeyboardEditorProps = {
    user: User;
    warehouse: Warehouse;
};

export function buildDefaultUnifiedKeyboard(warehouse: Warehouse): UnifiedKeyboard {

    const now = new Date();

    const yearButtons: UnifiedKeyboardButton[] = Array(4).fill(0).map((_, index) =>
        index + now.getFullYear()
    ).map((year, index) => ({
        label: year.toString(),
        columnStart: 22,
        columnEnd: 25,
        rowStart: index + 1,
        rowEnd: index + 2,
        category: null,
        expiry: {
            from: new Date(year, 1).getTime(),
            to: new Date(year + 1, 1).getTime(),
            label: year.toString(),
        },
    }));

    const quarterButtons: UnifiedKeyboardButton[] = Array(4).fill(0).map((_, index) => ({
        label: `Q${index + 1}`,
        columnStart: 19 + 3 * (index % 2),
        columnEnd: 22 + 3 * (index % 2),
        rowStart: Math.floor(index / 2) + 5,
        rowEnd: Math.floor(index / 2) + 6,
        category: null,
        expiry: {
            // from: new Date(year, 1).getTime(),
            // to: new Date(year + 1, 1).getTime(),
            from: null, //todo fixme
            to: null,
            label: `Q${index + 1}`,
        },
    }));

    // {
    //     this.quarters.map((quarter, index) => {
    //         return <button
    //             onClick={quarter.onClick}
    //             style={{
    //                 margin: 0,
    //                 gridRow: (5 + Math.floor(index / 2)),
    //                 gridColumn: (7 + index % 2),
    //                 backgroundColor: quarter.bg
    //             }}
    //         >{quarter.name}</button>;
    //     });
    // }

    const monthButtons = Array(12).fill(0).map((_, index) =>
        index + 1
    ).map((month, index) => {
        const currentMonth = new Date(now.getFullYear() + month < now.getMonth() ? 1 : 0, month);
        return {
            label: MONTHS_TRANSLATOR[month - 1],
            columnStart: index * 2 + 1,
            columnEnd: (index + 1) * 2 + 1,
            rowStart: 9,
            rowEnd: 10,
            category: null,
            expiry: {
                from: new Date(currentMonth.getFullYear(), currentMonth.getMonth()).getTime(),
                to: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).getTime(),
                label: MONTHS_TRANSLATOR[month - 1],
            },
        };
    });


    const categoryButtons: UnifiedKeyboardButton[] = warehouse.categories.reduce((acc, cur) => {

        const currentButton: UnifiedKeyboardButton = ({
            label: cur.shortName ?? cur.name,
            columnStart: acc.column,
            columnEnd: acc.column + 3,
            rowStart: acc.row,
            rowEnd: acc.row,
            category: cur,
            expiry: null,
        });
        acc.buttons.push(currentButton);

        acc.column += 3;
        if (acc.column === 22 || (acc.row === 5 && acc.column === 19)) {
            acc.column = 1;
            acc.row += 1;
        }

        return acc;
    }, {
        buttons: [],
        row: 1,
        column: 1
    } as {
        buttons: UnifiedKeyboardButton[];
        row: number;
        column: number;
    }).buttons;

    return {
        buttons: yearButtons.concat(quarterButtons, monthButtons, categoryButtons)
    };
}

export interface UnifiedKeyboardButton {
    label: string;
    columnStart: number | null;
    columnEnd: number | null;
    rowStart: number | null;
    rowEnd: number | null;
    category: Category | null;
    expiry: ExpiryRange | null;
}

export interface UnifiedKeyboard {
    buttons: UnifiedKeyboardButton[];
}

export class CustomKeyboardEditor extends React.Component<CustomKeyboardEditorProps> {
    render(): React.ReactNode {

        const keyboard = this.props.user.unifiedKeyboard;
        if (keyboard) {

            return <div>
                <h2>Keyboard Builder</h2>
                TODO build a keyboard builder

                <h2>Preview</h2>
                {this.renderKeyboard(keyboard)}</div>;

        } else {

            return <div>No unified keyboard is specified, enable this feature in the settings</div>;
        }

    }

    private renderKeyboard(keyboard: UnifiedKeyboard): React.ReactNode {
        return <div style={{
            display: "grid",
        }}>{
            keyboard.buttons.length === 0 ? <div>
                The keyboard has no buttons
            </div> : keyboard.buttons.map(button => <button
                style={{
                    fontSize: 10,
                    gridColumnStart: button.columnStart ?? undefined,
                    gridColumnEnd: button.columnEnd ?? undefined,
                    gridRowStart: button.rowStart ?? undefined,
                    gridRowEnd: button.rowEnd ?? undefined,
                }}
                disabled={true}
            >
                {button.label}
            </button>)
        }</div>;
    }
}
