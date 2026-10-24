import {ExpenseType} from "./calendar";
import {CategoryType} from "./categories";

export const COLUMNS = ["Date", "Name", "Category", "Amount", "Note", "Type"];

// what the Type column holds for a personal expense; it's blank for everything else
export const PERSONAL_TYPE = "Personal";

// Excel runs text starting with these as a formula, so such text gets a leading ' to keep it as text.
// Text that already starts with ' before one of them gets another, so the import's removing one ' gives it back
export const FORMULA_START = /^'*[=+\-@\t\r]/;

const escapeText = (value: string): string => {
    const text = FORMULA_START.test(value) ? `'${value}` : value;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const toCsv = (expenses: ExpenseType[], categories: CategoryType[]): string => {
    const categoryNames = new Map(categories.map(category => [category.id, category.name]));
    const rows = expenses.map(expense => [
        expense.date,
        escapeText(expense.name),
        escapeText(categoryNames.get(expense.categoryId) ?? "Unknown"),
        // a plain number, so the column can be summed
        expense.amount.toFixed(2),
        escapeText(expense.note ?? ""),
        expense.personal ? PERSONAL_TYPE : "",
    ].join(","));
    // Excel expects Windows line endings
    return [COLUMNS.join(","), ...rows].join("\r\n") + "\r\n";
}

// the byte order mark tells Excel the file is UTF-8, otherwise accented names come out garbled
export const downloadCsv = (fileName: string, expenses: ExpenseType[], categories: CategoryType[]): void => {
    const blob = new Blob(["﻿" + toCsv(expenses, categories)], {type: "text/csv;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    // released once the browser has started the download
    setTimeout(() => URL.revokeObjectURL(url));
}
