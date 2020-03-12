import {EXPIRY_GREY, EXPIRY_GREY_RATIO} from "../components/BottomPanel";
import {Category, ExpiryRange, Warehouse} from "../core/WarehouseModel";
import {NEVER_EXPIRY} from "../core/WarehouseModel/Utils";
import {getExpiryColor, interpolateTowardsGrey, toExpiryRange} from "./getExpiryColor";
import {MONTHS_TRANSLATOR} from "./monthsTranslator";
import {byNullSafe} from "./sortsUtils";

export type ButtonProperties = {
    label: string;
    background: string | null;
};


type SingleEdit = {
    type: "singular";
    alteration: Edit;
};
type GroupedEdit = {
    type: "grouped";
    alterations: (Edit & ButtonProperties)[];
};
type ErasingButton = {
    type: "erase";
};


export type TrayEditingButton = (ErasingButton | SingleEdit | GroupedEdit) & ButtonProperties;

const NOTHING: { type: "nothing" } = {type: "nothing"};
const CLEAR: { type: "clear" } = {type: "clear"};

export type CategoryAlteration = { type: "set"; categoryID: string } | { type: "clear" } | { type: "nothing" };
export type ExpiryAlteration = { type: "set"; expiry: ExpiryRange } | { type: "clear" } | { type: "nothing" };
export type WeightAlteration = { type: "set"; weight: string } | { type: "clear" } | { type: "nothing" };
export type CommentAlteration = { type: "set"; comment: string } | { type: "clear" } | { type: "nothing" };
export type Edit = {
    category: CategoryAlteration;
    expiry: ExpiryAlteration;
    weight: WeightAlteration;
    comment: CommentAlteration;
};

export type CustomKeyboardButton = TrayEditingButton & {
    columnStart: number | null;
    columnEnd: number | null;
    rowStart: number | null;
    rowEnd: number | null;
};

export interface CustomKeyboard {
    buttons: CustomKeyboardButton[];
}

export function buildKeyboardButtons(
    yearsAhead: number,
    quartersAhead: number,
    addYearToQuarters: boolean,
    addYearToMonths: boolean,
    warehouse: Warehouse
): {
    mixedYears: TrayEditingButton[];
    categories: TrayEditingButton[];
    specialCategoryButtons: { removeTray: TrayEditingButton };
    specialExpiryButtons: { never: TrayEditingButton; clearExpiry: TrayEditingButton };
    years: TrayEditingButton[];
    quarters: TrayEditingButton[];
    months: TrayEditingButton[];
} {

    const specialExpiryButtons: { never: TrayEditingButton; clearExpiry: TrayEditingButton } = {
        never: {
            type: "singular",
            label: "Never",
            alteration: {
                category: NOTHING,
                expiry: {type: "set", expiry: NEVER_EXPIRY},
                weight: NOTHING,
                comment: NOTHING,
            },
            background: null
        },
        clearExpiry: {
            type: "singular",
            label: "Clear Expiry",
            alteration: {
                category: NOTHING,
                expiry: CLEAR,
                weight: NOTHING,
                comment: NOTHING,
            },
            background: "#ffffff"
        }
    };

    const specialCategoryButtons: { removeTray: TrayEditingButton } = {
        removeTray: {
            type: "erase",
            label: "< Clear >",
            background: "#ffffff"
        }
    };

    const yearButtons: (SingleEdit & ButtonProperties)[] = buildYearButtons(yearsAhead);

    // this code is terrible todo fixme
    // though, if a keyboard editor goes in, this won't be an issue
    const mixed = warehouse.categories.find(cat => cat.name === "Mixed");

    const mixedYears: TrayEditingButton[] = mixed ? yearButtons.map(year => ({
        label: `${mixed.shortName ?? mixed.name} ${year.label}`,
        type: "singular",
        alteration: {
            category: {type: "set", categoryID: warehouse.getCategoryID(mixed)},
            expiry: year.alteration.expiry,
            weight: CLEAR,
            comment: CLEAR
        },
        background: year.background
    })) : [];

    return {
        mixedYears: mixedYears,
        categories: buildCategoryButtons(warehouse),
        specialCategoryButtons: specialCategoryButtons,
        specialExpiryButtons: specialExpiryButtons,
        years: yearButtons,
        quarters: buildQuarterButtons(quartersAhead, addYearToQuarters),
        months: buildMonthButtons(addYearToMonths),
    };
}


const GROUP_BUTTON_BACKGROUND = "#e3c9ba";

function buildCategoryButtons(warehouse: Warehouse): TrayEditingButton[] {

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

    const buttonsWithoutGroups: TrayEditingButton[] = warehouse.categories.filter(cat =>
        cat.group === null
    ).map((cat): TrayEditingButton => ({
        type: "singular",
        label: cat.shortName ?? cat.name,
        alteration: {
            category: {type: "set", categoryID: warehouse.getCategoryID(cat)},
            expiry: CLEAR,
            weight: CLEAR,
            comment: CLEAR,
        },
        background: null
    }));

    const groupedButtons: TrayEditingButton[] = Array.from(categoryGroups.entries()).map(([group, categories]) => ({
        label: group,
        type: "grouped",
        alterations: categories.map(category => ({
            label: category.shortName ?? category.name,
            background: null,
            category: {type: "set", categoryID: warehouse.getCategoryID(category)},
            expiry: CLEAR,
            weight: CLEAR,
            comment: CLEAR,
        })),
        background: GROUP_BUTTON_BACKGROUND
    }));

    return buttonsWithoutGroups
        .concat(groupedButtons)
        .sort(byNullSafe(button => button.label));
}

function buildYearButtons(yearsAhead: number): (SingleEdit & ButtonProperties)[] {
    const now = new Date();
    return Array(yearsAhead).fill(0).map((_, index) => {
        const year = now.getFullYear() + index;
        const expiry = {year: year};

        const properExpiry = toExpiryRange(expiry);

        const expiryColor = getExpiryColor(properExpiry, "warehouse");
        const color = interpolateTowardsGrey(
            expiryColor,
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );

        return {
            label: year.toString(),
            type: "singular",
            alteration: {
                category: NOTHING,
                expiry: {type: "set", expiry: properExpiry},
                weight: NOTHING,
                comment: NOTHING,
            },
            expiryFrom: new Date(year, 0).getTime(),
            background: color
        };

    });
}

export function buildMonthButtons(addYearToMonths: boolean): TrayEditingButton[] {
    const now = new Date();
    return Array(12).fill(0).map((_, index) => {
        const year = now.getFullYear() + (now.getMonth() + index >= 12 ? 1 : 0);

        const expiry = {year: year, month: (now.getMonth() + index) % 12};
        const properExpiry = toExpiryRange(expiry);
        const color = interpolateTowardsGrey(
            getExpiryColor(properExpiry, "warehouse"),
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );

        return {
            label: `${MONTHS_TRANSLATOR[(index + now.getMonth()) % 12]}${addYearToMonths ? ` ${year}` : ""}`,
            type: "singular",
            alteration: {
                category: NOTHING,
                expiry: {type: "set", expiry: properExpiry},
                weight: NOTHING,
                comment: NOTHING,
            },
            expiryFrom: new Date(year, index).getTime(),
            background: color
        };
    });
}

export function buildQuarterButtons(quartersAhead: number, addYearToQuarters: boolean): TrayEditingButton[] {
    const now = new Date();
    const thisQuarter = Math.floor(now.getMonth() / 3);
    return Array(quartersAhead).fill(0).map((_, index) => {

        const year = now.getFullYear() + (thisQuarter + index >= 4 ? 1 : 0);

        const expiry = {year: year, quarter: (index + thisQuarter) % 4};
        const properExpiry = toExpiryRange(expiry);

        const color = interpolateTowardsGrey(
            getExpiryColor(properExpiry, "warehouse"),
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );
        return {
            type: "singular",
            label: `Q${(index + thisQuarter) % 4 + 1}${addYearToQuarters ? ` ${year}` : ""}`,
            alteration: {
                category: NOTHING,
                expiry: {type: "set", expiry: properExpiry},
                weight: NOTHING,
                comment: NOTHING,
            },
            expiryFrom: new Date(year, index * 3).getTime(),
            background: color
        };
    });
}

export function buildDefaultUnifiedKeyboard(warehouse: Warehouse): CustomKeyboard {

    const {
        categories,
        years,
        quarters,
        months,
        mixedYears
    } = buildKeyboardButtons(4, 4, false, false, warehouse);

    const yearButtons: CustomKeyboardButton[] = years.map((button, index) => ({
        ...button,
        columnStart: 22,
        columnEnd: 25,
        rowStart: index + 1,
        rowEnd: index + 2,
    }));

    const quarterButtons: CustomKeyboardButton[] = quarters.map((button, index) => ({
        ...button,
        columnStart: 19 + 3 * (index % 2),
        columnEnd: 22 + 3 * (index % 2),
        rowStart: Math.floor(index / 2) + 5,
        rowEnd: Math.floor(index / 2) + 6,
    }));

    const monthButtons = months.map((button, index) => ({
        ...button,
        columnStart: index * 2 + 1,
        columnEnd: (index + 1) * 2 + 1,
        rowStart: 7,
        rowEnd: 8,
    }));

    const mixedButtons = mixedYears.map((button, index) => ({
        ...button,
        columnStart: 19,
        columnEnd: 22,
        rowStart: index + 1,
        rowEnd: index + 2,
    }));


    const categoryButtons = categories.reduce((acc, button) => {
        if (button.label === "Mixed") {
            // absolutely awful code, this needs to be replaced with a category editor
            return acc;
        }


        const currentButton: CustomKeyboardButton = ({
            ...button,
            columnStart: acc.column,
            columnEnd: acc.column + 3,
            rowStart: acc.row,
            rowEnd: acc.row,
        });
        acc.buttons.push(currentButton);

        acc.column += 3;
        if (acc.column === 19) {
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
    }).buttons.splice(0, 36);
    // take the first 36 because that's all there's space for

    return {
        buttons: yearButtons.concat(quarterButtons, monthButtons, categoryButtons, mixedButtons)
    };
}

