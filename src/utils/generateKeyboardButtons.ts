import {EXPIRY_GREY, EXPIRY_GREY_RATIO} from "../components/BottomPanel";
import {Category, ExpiryRange} from "../core/WarehouseModel";
import {NEVER_EXPIRY, Warehouse} from "../core/WarehouseModel/Layers/Warehouse";
import {getExpiryColor, interpolateTowardsGrey, toExpiryRange} from "./getExpiryColor";
import {MONTHS_TRANSLATOR} from "./monthsTranslator";

type ButtonProperties = {
    label: string;
    background: string | null;
};

export type TrayAlteringButton = {
    alteration: null | Alteration | AlterationGroup;
} & ButtonProperties;

type Alteration = {
    category: Category | null | undefined;
    expiry: ExpiryRange | null | undefined;
};

type  AlterationGroup = (Alteration & ButtonProperties)[] ;

export type CustomKeyboardButton = TrayAlteringButton & {
    columnStart: number | null;
    columnEnd: number | null;
    rowStart: number | null;
    rowEnd: number | null;
};

export interface CustomKeyboard {
    buttons: CustomKeyboardButton[];
}

export function buildKeyboardButtons(yearsAhead: number, quartersAhead: number, categories: Category[]) {

    const specialExpiryButtons: { never: TrayAlteringButton, clear: TrayAlteringButton } = {
        never: {
            label: "Never",
            onClick: this.props.updateTrayProperties.bind(undefined,
                undefined,
                NEVER_EXPIRY,
                undefined,
                true
            ),
            background: null
        },
        clearExpiry: {
            label: "< Clear >",
            onClick: this.props.updateTrayProperties.bind(undefined,
                undefined,
                null,
                undefined,
                true
            ),
            background: "#ffffff"
        }
    };

    const specialCategoryButtons: { removeTray: TrayAlteringButton } = {
        removeTray: {
            label: "< Clear >",
            alteration: null,
            background: "#ffffff"
        }
    };


    return {
        categories: buildCategoryButtons(categories),
        specialCategoryButtons: specialCategoryButtons,
        specialExpiryButtons: specialExpiryButtons,
        years: buildYearButtons(yearsAhead),
        quarters: buildQuarterButtons(quartersAhead),
        months: buildMonthButtons(),
    };
}


function buildCategoryButtons(categories: Category[]): TrayAlteringButton[] {
    return [];
}

function buildYearButtons(yearsAhead: number): TrayAlteringButton[] {
    const now = new Date();
    return Array(yearsAhead).fill(0).map((_, index) => {
        const year = now.getFullYear() + index;
        const expiry = {year: year};

        const properExpiry = toExpiryRange(expiry);
        const color = interpolateTowardsGrey(
            getExpiryColor(properExpiry, "warehouse"),
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );

        return {
            label: year.toString(),
            alteration: {
                category: undefined,
                expiry: properExpiry
            },
            expiryFrom: new Date(year, 0).getTime(),
            background: color
        };

    });
}

export function buildMonthButtons(): TrayAlteringButton[] {
    const now = new Date();
    return Array(12).fill(0).map((_, index) => {
        const year = now.getFullYear() + (now.getMonth() <= index ? 0 : 1);

        const expiry = {year: year, month: index};
        const properExpiry = toExpiryRange(expiry);
        const color = interpolateTowardsGrey(
            getExpiryColor(properExpiry, "warehouse"),
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );

        return {
            label: `${MONTHS_TRANSLATOR[index]}`,
            alteration: {
                category: undefined,
                expiry: properExpiry
            },
            expiryFrom: new Date(year, index).getTime(),
            background: color
        };
    });
}

export function buildQuarterButtons(quartersAhead: number): TrayAlteringButton[] {
    const now = new Date();
    const thisQuarter = Math.floor(now.getMonth() / 3);
    return Array(quartersAhead).fill(0).map((_, index) => {

        const quarter = index + 1;
        const year = now.getFullYear() + (thisQuarter < index ? 0 : 1);

        const expiry = {year: year, quarter: quarter};
        const properExpiry = toExpiryRange(expiry);

        const color = interpolateTowardsGrey(
            getExpiryColor(properExpiry, "warehouse"),
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );
        return {
            label: `Q${quarter}`,
            alteration: {
                category: undefined,
                expiry: properExpiry
            },
            expiryFrom: new Date(year, quarter * 3).getTime(),
            background: color
        };
    });
}

export function buildDefaultUnifiedKeyboard(warehouse: Warehouse): CustomKeyboard {

    const {
        categories,
        years,
        quarters,
        months
    } = buildKeyboardButtons(4, 4, warehouse.categories);

    const now = new Date();
    const yearButtons: CustomKeyboardButton[] = Array(4).fill(0).map((_, index) =>
        index + now.getFullYear()
    ).map((year, index) => {
        const expiry = {
            from: new Date(year, 1).getTime(),
            to: new Date(year + 1, 1).getTime(),
            label: year.toString(),
        };
        const bg = interpolateTowardsGrey(getExpiryColor(expiry, "warehouse"), EXPIRY_GREY, EXPIRY_GREY_RATIO);
        return {
            label: year.toString(),
            columnStart: 22,
            columnEnd: 25,
            rowStart: index + 1,
            rowEnd: index + 2,
            alteration: {
                category: undefined,
                expiry: expiry,
            },
            background: bg,
        };
    });

    const quarterButtons: CustomKeyboardButton[] = Array(4).fill(0).map((_, index) => {
        const expiry = {
            from: null, //todo fixme
            to: null,
            label: `Q${index + 1} ${now.getFullYear()}`,
        };
        const bg = interpolateTowardsGrey(getExpiryColor(expiry, "warehouse"), EXPIRY_GREY, EXPIRY_GREY_RATIO);
        return {
            label: `Q${index + 1}`,
            columnStart: 19 + 3 * (index % 2),
            columnEnd: 22 + 3 * (index % 2),
            rowStart: Math.floor(index / 2) + 5,
            rowEnd: Math.floor(index / 2) + 6,
            alteration: {
                category: undefined,
                expiry: expiry,
            },
            background: bg,
        };
    });

    const monthButtons = Array(12).fill(0).map((_, index) =>
        index + 1
    ).map((month, index) => {
        const currentMonth = new Date(now.getFullYear() + ((month <= now.getMonth()) ? 1 : 0), month);
        const expiry = {
            from: new Date(currentMonth.getFullYear(), currentMonth.getMonth()).getTime(),
            to: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1).getTime(),
            label: `${MONTHS_TRANSLATOR[month - 1]} ${currentMonth.getFullYear()}`,
        };
        const bg = interpolateTowardsGrey(getExpiryColor(expiry, "warehouse"), EXPIRY_GREY, EXPIRY_GREY_RATIO);
        return {
            label: MONTHS_TRANSLATOR[month - 1],
            columnStart: index * 2 + 1,
            columnEnd: (index + 1) * 2 + 1,
            rowStart: 9,
            rowEnd: 10,
            background: bg,
            alteration: {
                category: undefined,
                expiry: expiry,
            },
        };
    });


    const categoryGroups: Map<string, [Category]> = new Map();
    warehouse.categories.forEach(cat => {
        if (cat.group !== null) {
            if (categoryGroups.has(cat.group)) {
                categoryGroups.get(cat.group)?.push(cat);
            } else {
                categoryGroups.set(cat.group, [cat]);
            }
        }
    });

    // const buttonsWithoutGroups = this.props.categories.filter(cat =>
    //     cat.group === null
    // ).map((cat): CustomButtonProps => ({
    //     name: cat.shortName ?? cat.name,
    //     onClick: this.props.updateTrayProperties.bind(undefined, cat, null, null, true),
    //     selected: cat.name === commonCat,
    // }));
    //
    // const groupedButtons = Array.from(categoryGroups.entries()).map(([group, categories]) => ({
    //     name: group,
    //     onClick: this.props.openDialog.bind(undefined, {
    //         dialog: (close: () => void) => {
    //             const groupButtons = categories.map((cat) => ({
    //                 name: cat.shortName ?? cat.name,
    //                 onClick: () => {
    //                     this.props.updateTrayProperties.bind(undefined,
    //                         cat,
    //                         null,
    //                         null,
    //                         true
    //                     );
    //                     close();
    //                 },
    //                 selected: cat.name === commonCat
    //             }));
    //             return <GroupedCategoriesDialog
    //                 groupTitle={group}
    //                 categoryButtons={groupButtons}
    //                 close={close}/>;
    //         },
    //         closeOnDocumentClick: true,
    //     }),
    //     selected: commonCat ? categories.some(cat => cat.name === commonCat) : false
    // }));

    // const categoryButtons: CustomButtonProps[] = buttonsWithoutGroups
    //     .concat(groupedButtons)
    //     .sort(byNullSafe(button => button.name));
    //
    // const specialButtons: CustomButtonProps[] = [
    //     {
    //         name: "< Clear >",
    //         onClick: this.props.removeSelection,
    //         selected: false,
    //         bg: "#ffffff"
    //     }
    // ];

    const categoryButtons: CustomKeyboardButton[] = warehouse.categories.reduce((acc, cur) => {
        if (cur.group !== null) {
            return acc;
        }


        const currentButton: CustomKeyboardButton = ({
            label: cur.shortName ?? cur.name,
            columnStart: acc.column,
            columnEnd: acc.column + 3,
            rowStart: acc.row,
            rowEnd: acc.row,
            alteration: {
                category: cur,
                expiry: null,
            },
            background: null,
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
        buttons: CustomKeyboardButton[];
        row: number;
        column: number;
    }).buttons;

    return {
        buttons: yearButtons.concat(quarterButtons, monthButtons, categoryButtons)
    };
}

