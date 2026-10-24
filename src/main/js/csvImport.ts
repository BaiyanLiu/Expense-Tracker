import {ExpenseType} from "./calendar";
import {roundToCents} from "./amount";
import {COLUMNS, FORMULA_START, PERSONAL_TYPE} from "./csv";
import {MAX_NAME_LENGTH as MAX_CATEGORY_NAME_LENGTH} from "./categories";

// one row of a file made by Export CSV
export type ImportRow = {
    // row number in the file, counting the header as 1, as a spreadsheet would show it
    line: number,
    date?: string,
    name: string,
    amount?: number,
    categoryName: string,
    note: string,
    personal: boolean,
    // why the row can't be imported
    error?: string,
}

// splits CSV text into rows of cells, following quotes and doubled quotes; blank lines are dropped
const parseCsv = (text: string): string[][] => {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = "";
    let isQuoted = false;

    const endRow = (): void => {
        row.push(cell);
        if (row.some(value => value.length > 0)) {
            rows.push(row);
        }
        row = [];
        cell = "";
    }

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (isQuoted) {
            if (char === '"' && text[i + 1] === '"') {
                cell += '"';
                i++;
            } else if (char === '"') {
                isQuoted = false;
            } else {
                cell += char;
            }
        } else if (char === '"') {
            isQuoted = true;
        } else if (char === ",") {
            row.push(cell);
            cell = "";
        } else if (char === "\r" || char === "\n") {
            if (char === "\r" && text[i + 1] === "\n") {
                i++;
            }
            endRow();
        } else {
            cell += char;
        }
    }
    if (cell.length > 0 || row.length > 0) {
        endRow();
    }
    return rows;
}

// the export writes "YYYY-MM-DD"; checked as a real date so 2025-02-30 isn't saved
const isValidDate = (date: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }
    const parsed = new Date(`${date}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date;
}

// the export puts a ' in front of text Excel would otherwise run as a formula
const unescapeText = (value: string): string =>
    value.startsWith("'") && FORMULA_START.test(value.slice(1)) ? value.slice(1) : value;

// files exported before the Type column was added end at Note, and are still read
const isExportHeader = (row: string[]): boolean =>
    (row.length === COLUMNS.length || row.length === COLUMNS.length - 1) && row.every((name, i) => name.trim() === COLUMNS[i]);

// returns the rows, or a reason the file isn't one made by Export CSV
export const readExport = (text: string): ImportRow[] | string => {
    // the export starts with a byte order mark so Excel reads it as UTF-8
    const rows = parseCsv(text.charCodeAt(0) === 0xfeff ? text.slice(1) : text);
    if (rows.length === 0 || !isExportHeader(rows[0])) {
        return `This isn't a file from Export CSV. Its first line should be ${COLUMNS.join(",")}.`;
    }

    return rows.slice(1).map((row, i) => {
        const [date = "", name = "", categoryName = "", amountText = "", note = "", typeText = ""] = row.map(cell => unescapeText(cell.trim()));
        const type = typeText.toLowerCase();
        const personal = type === PERSONAL_TYPE.toLowerCase();
        const amount = /^-?\d+(\.\d+)?$/.test(amountText) ? roundToCents(Number(amountText)) : undefined;
        const error = !isValidDate(date) ? "Can't read the date"
            : amount === undefined ? "Can't read the amount"
            : name.length === 0 ? "No name"
            : type.length > 0 && !personal ? "Can't read the type"
            // the server refuses to add such a category, which would stop the whole import
            : categoryName.length > MAX_CATEGORY_NAME_LENGTH ? "Category name is too long"
            : undefined;
        return {
            line: i + 2,
            date: isValidDate(date) ? date : undefined,
            name,
            amount,
            categoryName,
            note,
            personal,
            error,
        };
    });
}

const duplicateKey = (date: string, name: string, amount: number): string =>
    `${date}|${name.trim().toLowerCase()}|${amount.toFixed(2)}`;

// lines of rows that are already saved, with the same date, name and amount. Each saved expense matches one row,
// so if a file really has two identical coffees and one is saved, the other still comes in
export const findDuplicates = (rows: ImportRow[], expenses: ExpenseType[]): Set<number> => {
    const saved = new Map<string, number>();
    expenses.forEach(expense => {
        const key = duplicateKey(expense.date, expense.name, expense.amount);
        saved.set(key, (saved.get(key) ?? 0) + 1);
    });

    const duplicates = new Set<number>();
    rows.forEach(row => {
        if (row.error) {
            return;
        }
        const key = duplicateKey(row.date!, row.name, row.amount!);
        const count = saved.get(key) ?? 0;
        if (count > 0) {
            duplicates.add(row.line);
            saved.set(key, count - 1);
        }
    });
    return duplicates;
}
