'use strict';

import React, {useEffect, useMemo, useState} from "react";
import {ExpenseType} from "./calendar";
import {CategoryName, CategoryOptions, useCategories} from "./categories";
import {amountClass, formatAmount, roundToCents} from "./amount";
import {PERSONAL_TYPE} from "./csv";
import {findDuplicates, ImportRow, readExport} from "./csvImport";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faFileArrowUp} from '@fortawesome/free-solid-svg-icons'

// rendering thousands of rows at once freezes the page, so rows are added as the preview is scrolled
const ROWS_PER_PAGE = 100;

// what the export writes for an expense whose category is gone; such rows take the chosen category instead
const UNKNOWN_CATEGORY_NAME = "unknown";

// kept the same between renders, so the duplicate check isn't redone while no file is chosen
const NO_ROWS: ImportRow[] = [];

const plural = (count: number, word: string): string => `${count} ${word}${count === 1 ? "" : "s"}`;

type LoadedFile = {
    fileName: string,
    rows: ImportRow[],
}

function ImportCsv({expenses}: {
    expenses: ExpenseType[]
}) {

    const categories = useCategories();
    const [file, setFile] = useState<LoadedFile | undefined>(undefined);
    const [defaultCategoryId, setDefaultCategoryId] = useState<number | undefined>(categories[0]?.id);
    // rows ticked or unticked by hand, by line; the rest follow whether they can and should be imported
    const [overrides, setOverrides] = useState<Map<number, boolean>>(new Map());
    const [rowCount, setRowCount] = useState<number>(ROWS_PER_PAGE);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    // the outcome of the last file chosen or imported
    const [message, setMessage] = useState<string | undefined>(undefined);

    // the chosen category can be merged away while the panel is open
    useEffect(() => {
        if (!categories.some(category => category.id === defaultCategoryId)) {
            setDefaultCategoryId(categories[0]?.id);
        }
    }, [categories])

    const onFileChosen = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const chosen = e.target.files?.[0];
        e.target.value = "";
        if (!chosen) {
            return;
        }
        chosen.text().then(text => {
            const rows = readExport(text);
            setFile(typeof rows === "string" ? undefined : {fileName: chosen.name, rows});
            setMessage(typeof rows === "string" ? rows : undefined);
            setOverrides(new Map());
            setRowCount(ROWS_PER_PAGE);
        });
    }

    const rows = file?.rows ?? NO_ROWS;
    // also checked against expenses added since the file was chosen
    const duplicates = useMemo(() => findDuplicates(rows, expenses), [rows, expenses]);

    const categoryIdsByName = useMemo(() =>
        new Map(categories.map(category => [category.name.toLowerCase(), category.id])), [categories]);

    const hasCategoryName = (row: ImportRow): boolean => {
        const named = row.categoryName.toLowerCase();
        return named.length > 0 && named !== UNKNOWN_CATEGORY_NAME;
    }

    // a category that isn't here yet, e.g. in a file from another copy of the app; the server adds it
    const isNewCategory = (row: ImportRow): boolean =>
        hasCategoryName(row) && !categoryIdsByName.has(row.categoryName.toLowerCase());

    const getCategoryId = (row: ImportRow): number | undefined =>
        hasCategoryName(row) ? categoryIdsByName.get(row.categoryName.toLowerCase()) : defaultCategoryId;

    const isIncluded = (row: ImportRow): boolean =>
        !row.error && (overrides.get(row.line) ?? !duplicates.has(row.line));

    const included = rows.filter(isIncluded);
    const total = roundToCents(included.reduce((sum, row) => sum + row.amount!, 0));
    // the server adds one category for names that differ only in case, so they're listed once, as first spelled
    const newCategories = new Map<string, string>();
    included.filter(isNewCategory).forEach(row => {
        const key = row.categoryName.toLowerCase();
        if (!newCategories.has(key)) {
            newCategories.set(key, row.categoryName);
        }
    });
    const needsDefaultCategory = included.some(row => !hasCategoryName(row));
    const errorCount = rows.filter(row => row.error).length;
    const skippedDuplicateCount = rows.filter(row => duplicates.has(row.line) && !isIncluded(row)).length;
    const canImport = included.length > 0 && (!needsDefaultCategory || defaultCategoryId !== undefined) && !isSaving;

    const onToggle = (row: ImportRow): void => {
        setOverrides(prev => new Map(prev).set(row.line, !isIncluded(row)));
    }

    const onImport = (): void => {
        if (!canImport) {
            return;
        }
        const body = included.map(row => ({
            date: row.date,
            name: row.name,
            amount: row.amount,
            note: row.note.length > 0 ? row.note : null,
            personal: row.personal,
            ...(isNewCategory(row) ? {categoryName: row.categoryName} : {categoryId: getCategoryId(row)}),
        }));
        setIsSaving(true);
        fetch("api/expense/import", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        }).then(response => {
            setIsSaving(false);
            if (!response.ok) {
                // the server says which row it couldn't take
                response.json()
                    .then(error => window.alert(`Couldn't import the file. ${error.message ?? ""}`))
                    .catch(() => window.alert("Couldn't import the file. Please try again."));
                return;
            }
            setMessage(`Imported ${plural(body.length, "expense")} from ${file!.fileName}.`);
            setFile(undefined);
        }, () => {
            setIsSaving(false);
            window.alert("Couldn't import the file. Please try again.");
        });
    }

    const onPreviewScroll = (e: React.UIEvent<HTMLDivElement>): void => {
        const preview = e.currentTarget;
        const isNearBottom = preview.scrollTop + preview.clientHeight >= preview.scrollHeight - 200;
        if (isNearBottom && rowCount < rows.length) {
            setRowCount(rowCount + ROWS_PER_PAGE);
        }
    }

    return (
        <div className="import-csv">
            <div className="panel-title">Import CSV</div>
            <div className="hint">Adds expenses from a file made by Export CSV.</div>
            <label className="file-button">
                <FontAwesomeIcon icon={faFileArrowUp} size="sm"/>{file ? "Choose Another File" : "Choose File"}
                <input type="file" accept=".csv,text/csv" onChange={onFileChosen}/>
            </label>
            {file && <span className="file-name">{file.fileName}</span>}
            {message && <div className="message">{message}</div>}

            {file && rows.length === 0 && <div className="empty">This file has no expenses.</div>}

            {file && rows.length > 0 &&
                <>
                    <div className="summary">
                        {plural(included.length, "expense")} to import -&nbsp;
                        <span className={amountClass(total)}>{formatAmount(total)}</span>
                        {skippedDuplicateCount > 0 && <span className="skipped">{plural(skippedDuplicateCount, "row")} already saved</span>}
                        {errorCount > 0 && <span className="skipped">{plural(errorCount, "row")} can't be read</span>}
                        {newCategories.size > 0 &&
                            <div className="new-categories">New categories: {Array.from(newCategories.values()).join(", ")}</div>}
                    </div>
                    {needsDefaultCategory &&
                        <div className="options">
                            <label>
                                Category for rows without one
                                <select
                                    value={defaultCategoryId ?? ""}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDefaultCategoryId(Number(e.target.value))}>
                                    {categories.length === 0 && <option value="">Add a category first</option>}
                                    <CategoryOptions/>
                                </select>
                            </label>
                        </div>}

                    <div className="preview" onScroll={onPreviewScroll}>
                        <table>
                            <tbody>
                            {rows.slice(0, rowCount).map(row =>
                                <tr key={row.line} className={isIncluded(row) ? "" : "excluded"}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            disabled={!!row.error}
                                            checked={isIncluded(row)}
                                            onChange={() => onToggle(row)}/>
                                    </td>
                                    <td className="date">{row.date ?? "?"}</td>
                                    <td className="name">{row.name}</td>
                                    <td className="category">
                                        {isNewCategory(row)
                                            ? <>{row.categoryName} (new)</>
                                            : getCategoryId(row) !== undefined && <CategoryName categoryId={getCategoryId(row)!}/>}
                                    </td>
                                    <td className={`amount ${row.amount !== undefined ? amountClass(row.amount) : ""}`}>
                                        {row.amount !== undefined ? formatAmount(row.amount) : "?"}
                                    </td>
                                    <td className="type">
                                        {row.personal ? PERSONAL_TYPE : ""}
                                    </td>
                                    <td className="status">
                                        {row.error ?? (duplicates.has(row.line) ? "Already saved" : "")}
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>

                    <span className={`${canImport ? "save" : "disabled"}-button`} onClick={onImport}>
                        {isSaving ? "Importing..." : `Import ${plural(included.length, "expense")}`}
                    </span>
                </>}
        </div>
    );
}

export default React.memo(ImportCsv);
