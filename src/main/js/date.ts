import {ExpenseType} from "./calendar";

// expense dates are "YYYY-MM-DD" strings; read them directly so the browser's timezone can't shift them.
// Returns [year, month number (1-12), date]. Slicing is several times faster than split, which adds up
// because every expense is regrouped whenever one changes
export const parseDate = (date: string): [number, number, number] =>
    [Number(date.slice(0, 4)), Number(date.slice(5, 7)), Number(date.slice(8, 10))];

const pad = (n: number, length: number): string => {
    const digits = String(n);
    return "0".repeat(Math.max(0, length - digits.length)) + digits;
}

// month is 0-11; the server only accepts four-digit years
export const toDateString = (year: number, month: number, date: number): string =>
    `${pad(year, 4)}-${pad(month + 1, 2)}-${pad(date, 2)}`;

// new Date(year, ...) reads years 0-99 as 1900-1999, so set the year separately
export const toDate = (year: number, month: number, date: number): Date => {
    const result = new Date(2000, month, date);
    result.setFullYear(year, month, date);
    return result;
}

// dates sort correctly as text, and comparing directly is cheaper than localeCompare
export const byNewestFirst = (a: ExpenseType, b: ExpenseType): number =>
    a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
