import {EXPIRY_GREY, EXPIRY_GREY_RATIO} from "../components/BottomPanel";
import {Category, ExpiryRange} from "../core/WarehouseModel";
import {MIXED_CATEGORY, NEVER_EXPIRY, Warehouse} from "../core/WarehouseModel/Layers/Warehouse";
import {getExpiryColor, interpolateTowardsGrey, toExpiryRange} from "./getExpiryColor";
import {MONTHS_TRANSLATOR} from "./monthsTranslator";
import {byNullSafe} from "./sortsUtils";

export type ButtonProperties = {
    label: string;
    background: string | null;
};


type SingularAlteration = {
    type: "singular";
    alteration: Alteration;
};
type GroupedAlteration = {
    type: "grouped";
    alterations: (Alteration & ButtonProperties)[];
};
type ErasingButton = {
    type: "erase";
};


export type TrayAlteringButton = (ErasingButton | SingularAlteration | GroupedAlteration) & ButtonProperties;

export type Alteration = {
    category: Category | null | undefined;
    expiry: ExpiryRange | null | undefined;
    weight: string | null | undefined;
    comment: string | null | undefined;
};

export type CustomKeyboardButton = TrayAlteringButton & {
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
    categories: Category[]
): {
    mixedYears: TrayAlteringButton[];
    categories: TrayAlteringButton[];
    specialCategoryButtons: { removeTray: TrayAlteringButton };
    specialExpiryButtons: { never: TrayAlteringButton; clearExpiry: TrayAlteringButton };
    years: TrayAlteringButton[];
    quarters: TrayAlteringButton[];
    months: TrayAlteringButton[];
} {

    const specialExpiryButtons: { never: TrayAlteringButton; clearExpiry: TrayAlteringButton } = {
        never: {
            type: "singular",
            label: "Never",
            alteration: {
                category: undefined,
                expiry: NEVER_EXPIRY,
                weight: undefined,
                comment: undefined,
            },
            background: null
        },
        clearExpiry: {
            type: "singular",
            label: "Clear Expiry",
            alteration: {
                category: undefined,
                expiry: null,
                weight: undefined,
                comment: undefined,
            },
            background: "#ffffff"
        }
    };

    const specialCategoryButtons: { removeTray: TrayAlteringButton } = {
        removeTray: {
            type: "erase",
            label: "< Clear >",
            background: "#ffffff"
        }
    };

    const yearButtons: (SingularAlteration & ButtonProperties)[] = buildYearButtons(yearsAhead);

    const mixedYears: TrayAlteringButton[] = yearButtons.map(year => ({
        label: `${MIXED_CATEGORY.shortName ?? MIXED_CATEGORY.name} ${year.label}`,
        type: "singular",
        alteration: {
            category: MIXED_CATEGORY,
            expiry: year.alteration.expiry,
            weight: null,
            comment: null
        },
        background: null
    }));

    return {
        mixedYears: mixedYears,
        categories: buildCategoryButtons(categories),
        specialCategoryButtons: specialCategoryButtons,
        specialExpiryButtons: specialExpiryButtons,
        years: yearButtons,
        quarters: buildQuarterButtons(quartersAhead),
        months: buildMonthButtons(),
    };
}


const GROUP_BUTTON_BACKGROUND = "#e3c9ba";

function buildCategoryButtons(categories: Category[]): TrayAlteringButton[] {

    const categoryGroups: Map<string, [Category]> = new Map();
    categories.forEach(cat => {
        if (cat.group !== null) {
            if (categoryGroups.has(cat.group)) {
                categoryGroups.get(cat.group)?.push(cat);
            } else {
                categoryGroups.set(cat.group, [cat]);
            }
        }
    });

    const buttonsWithoutGroups: TrayAlteringButton[] = categories.filter(cat =>
        cat.group === null
    ).map((cat): TrayAlteringButton => ({
        type: "singular",
        label: cat.shortName ?? cat.name,
        alteration: {
            category: cat,
            expiry: null,
            weight: null,
            comment: null,
        },
        background: null
    }));

    const groupedButtons: TrayAlteringButton[] = Array.from(categoryGroups.entries()).map(([group, categories]) => ({
        label: group,
        type: "grouped",
        alterations: categories.map(category => ({
            label: category.shortName ?? category.name,
            background: null,
            category: category,
            expiry: null,
            weight: null,
            comment: null,
        })),
        background: GROUP_BUTTON_BACKGROUND
    }));

    return buttonsWithoutGroups
        .concat(groupedButtons)
        .sort(byNullSafe(button => button.label));
}

function buildYearButtons(yearsAhead: number): (SingularAlteration & ButtonProperties)[] {
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
            type: "singular",
            alteration: {
                category: undefined,
                expiry: properExpiry,
                weight: undefined,
                comment: undefined,
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
            type: "singular",
            alteration: {
                category: undefined,
                expiry: properExpiry,
                weight: undefined,
                comment: undefined,
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

        const year = now.getFullYear() + (thisQuarter <= index ? 0 : 1);

        const expiry = {year: year, quarter: index};
        const properExpiry = toExpiryRange(expiry);

        const color = interpolateTowardsGrey(
            getExpiryColor(properExpiry, "warehouse"),
            EXPIRY_GREY,
            EXPIRY_GREY_RATIO
        );
        return {
            type: "singular",
            label: `Q${index + 1}`,
            alteration: {
                category: undefined,
                expiry: properExpiry,
                weight: undefined,
                comment: undefined,
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
    } = buildKeyboardButtons(4, 4, warehouse.categories);

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

    const categoryButtons = categories.reduce((acc, button) => {
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
    }).buttons;

    const mixedButtons = mixedYears.map((button, index) => ({
        ...button,
        columnStart: 19,
        columnEnd: 22,
        rowStart: index + 1,
        rowEnd: index + 2,
    }));

    return {
        buttons: yearButtons.concat(quarterButtons, monthButtons, categoryButtons, mixedButtons)
    };
}

