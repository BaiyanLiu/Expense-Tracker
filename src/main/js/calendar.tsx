'use strict';

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
//@ts-expect-error
import SockJsClient from "react-stomp";
import Year, {OpenMonthRequest} from "./year";
import YearHeader from "./yearHeader";
import YearChart from "./yearChart";
import ImportCsv from "./importCsv";
import Categories, {CategoriesContext, CategoryType} from "./categories";
import {getPastNames, PastNamesContext} from "./editExpense";
import {parseDate} from "./date";
import {roundToCents, sumShared} from "./amount";
import {downloadCsv} from "./csv";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faChartColumn, faFileArrowDown, faFileArrowUp, faTags} from '@fortawesome/free-solid-svg-icons'

const MIN_YEAR = 1;
const MAX_YEAR = 9999;

function Calendar() {
    const [expenses, setExpenses] = useState<ExpenseType[]>([]);
    const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
    const [notes, setNotes] = useState<NoteType[]>([]);
    const [scrollTarget, setScrollTarget] = useState<string | undefined>(undefined);
    const [openMonth, setOpenMonth] = useState<OpenMonthRequest | undefined>(undefined);
    const [showYearChart, setShowYearChart] = useState<boolean>(false);
    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [showCategories, setShowCategories] = useState<boolean>(false);
    const [showImport, setShowImport] = useState<boolean>(false);

    const loadExpenses = (): void => {
        fetch("api/expense/all")
            .then(response => response.json())
            .then(data => data._embedded.expenses)
            .then((data: ExpenseType[]) => setExpenses(data));
    }

    useEffect(() => {
        loadExpenses();

        fetch("api/note/all")
            .then(response => response.json())
            .then(data => data._embedded.notes)
            .then((data: NoteType[]) => setNotes(data));

        fetch("api/category/all")
            .then(response => response.json())
            .then(data => data._embedded?.categories ?? [])
            .then((data: CategoryType[]) => setCategories(data));
    }, [])

    // scroll once the selected year has rendered its months
    useEffect(() => {
        if (scrollTarget) {
            document.getElementById(scrollTarget)?.scrollIntoView({behavior: "smooth"});
            setScrollTarget(undefined);
        }
    }, [scrollTarget, activeYear])

    // works from the latest state, so messages arriving close together don't overwrite each other
    const onExpenseMessage = (newExpense: ExpenseType): void => {
        setExpenses(prevExpenses => {
            const newExpenses = [...prevExpenses];
            const index = newExpenses.findIndex(expense => expense.id === newExpense.id);
            if (index > -1) {
                newExpenses[index] = newExpense;
            } else {
                newExpenses.push(newExpense);
            }
            return newExpenses;
        });
    }

    const onExpenseDeleted = useCallback((id: string): void => {
        setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    }, []);

    const onNoteMessage = (newNote: NoteType): void => {
        setNotes(prevNotes => {
            const newNotes = [...prevNotes];
            const index = newNotes.findIndex(note => note.year === newNote.year && note.month === newNote.month);
            if (index > -1) {
                newNotes[index] = newNote;
            } else {
                newNotes.push(newNote);
            }
            return newNotes;
        });
    }

    const getNotesByMonth = (): Map<number, Map<number, NoteType>> => {
        const notesByMonth = new Map();

        notes.forEach(note => {
            const year = note.year;
            if (!notesByMonth.has(year)) {
                notesByMonth.set(year, new Map());
            }
            notesByMonth.get(year).set(note.month, note);
        });

        return notesByMonth;
    }

    const onCategoryMessage = (newCategory: CategoryType): void => {
        setCategories(prevCategories => [
            ...prevCategories.filter(category => category.id !== newCategory.id),
            newCategory,
        ]);
    }

    // mirrors the server: everything in the merged category moves over
    const onCategoryMerged = (fromId: number, toId: number): void => {
        setCategories(prevCategories => prevCategories.filter(category => category.id !== fromId));
        setExpenses(prevExpenses => prevExpenses.map(expense =>
            expense.categoryId === fromId ? {...expense, categoryId: toId} : expense));
    }

    // expands the month if it's collapsed, then scrolls to it
    const showMonth = (year: number, month: number): void => {
        setOpenMonth(prev => ({year, month, seq: (prev?.seq ?? 0) + 1}));
        setScrollTarget(`month-${year}-${month}`);
    }

    // the year being viewed, oldest first
    const onExportYear = (): void => {
        const yearExpenses = expenses
            .filter(expense => parseDate(expense.date)[0] === activeYear)
            .sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
        downloadCsv(`expenses-${activeYear}.csv`, yearExpenses, sortedCategories);
    }

    const onSelectChartMonth = useCallback((month: number): void => {
        showMonth(activeYear, month);
    }, [activeYear]);

    // one websocket connection for every topic; each message goes to the handler for the topic it arrived on
    const messageHandlers: {[topic: string]: (payload: any) => void} = {
        "/topic/expense": payload => onExpenseMessage(payload.expense),
        "/topic/expense/deleted": payload => onExpenseDeleted(payload.id),
        // an import can add thousands of expenses, too many to send one by one, so everything is loaded again
        "/topic/expense/imported": () => loadExpenses(),
        "/topic/note": payload => onNoteMessage(payload.note),
        "/topic/category": payload => onCategoryMessage(payload.category),
        "/topic/category/merged": payload => onCategoryMerged(payload.fromId, payload.toId),
    };

    // regrouped only when expenses change, keeping whatever didn't change so only the affected days re-render
    const previousExpensesByDate = useRef<ExpensesByDate | undefined>(undefined);
    const expensesByDate = useMemo(() => {
        previousExpensesByDate.current = groupExpensesByDate(expenses, previousExpensesByDate.current);
        return previousExpensesByDate.current;
    }, [expenses]);
    const notesByMonth = useMemo(getNotesByMonth, [notes]);
    const credits = useMemo(() => getCarriedCredits(expensesByDate, activeYear), [expensesByDate, activeYear]);
    // always offer the current year and the year being viewed, even when they have no expenses
    const years = Array.from(new Set([...expensesByDate.keys(), new Date().getFullYear(), activeYear]));
    years.sort((a, b) => a - b);
    const sortedCategories = useMemo(() => [...categories].sort((a, b) => a.name.localeCompare(b.name)), [categories]);
    const pastNames = useMemo(() => getPastNames(expenses), [expenses]);

    return (
        <CategoriesContext.Provider value={sortedCategories}>
        <PastNamesContext.Provider value={pastNames}>
        <div>
            <SockJsClient
                url={'/events'}
                topics={Object.keys(messageHandlers)}
                onMessage={(payload: any, topic: string) => messageHandlers[topic]?.(payload)}/>
            <button className="year-nav" title="Previous year" disabled={activeYear <= MIN_YEAR} onClick={() => setActiveYear(activeYear - 1)}>&lsaquo;</button>
            {years.map(year =>
                <YearHeader
                    key={year}
                    year={year}
                    expenses={expensesByDate.get(year)}
                    isActive={year === activeYear}
                    setActiveYear={setActiveYear}/>)}
            <button className="year-nav" title="Next year" disabled={activeYear >= MAX_YEAR} onClick={() => setActiveYear(activeYear + 1)}>&rsaquo;</button>
            <span className={`panel-button ${showYearChart ? "active" : ""}`} onClick={() => setShowYearChart(!showYearChart)}>
                <FontAwesomeIcon icon={faChartColumn} size="sm"/>Year Chart
            </span>
            <span className={`panel-button ${showCategories ? "active" : ""}`} onClick={() => setShowCategories(!showCategories)}>
                <FontAwesomeIcon icon={faTags} size="sm"/>Categories
            </span>
            <span className="panel-button" title={`Download ${activeYear}'s expenses as a CSV file`} onClick={onExportYear}>
                <FontAwesomeIcon icon={faFileArrowDown} size="sm"/>Export CSV
            </span>
            <span className={`panel-button ${showImport ? "active" : ""}`} title="Add expenses from a file made by Export CSV" onClick={() => setShowImport(!showImport)}>
                <FontAwesomeIcon icon={faFileArrowUp} size="sm"/>Import CSV
            </span>
            {showImport && <ImportCsv expenses={expenses}/>}
            {showCategories && <Categories expenses={expenses}/>}
            {showYearChart &&
                <YearChart
                    year={activeYear}
                    expenses={expensesByDate.get(activeYear)}
                    previousExpenses={expensesByDate.get(activeYear - 1)}
                    onSelectMonth={onSelectChartMonth}/>}
            <Year
                year={activeYear}
                expenses={expensesByDate.get(activeYear)}
                notes={notesByMonth.get(activeYear)}
                credits={credits}
                openMonth={openMonth}
                onExpenseDeleted={onExpenseDeleted}/>
        </div>
        </PastNamesContext.Provider>
        </CategoriesContext.Provider>
    );
}

type ExpensesByDate = Map<number, Map<number, Map<number, ExpenseType[]>>>;

// A month whose shared expenses come to less than zero (more came in than went out) carries that credit into the
// next month's Each, and only there. A credit the next month doesn't use up carries on again, so it's never lost,
// and months with no expenses pass it straight through. Returns the credit carried into each month of the year,
// as a negative amount, for months that have one
const getCarriedCredits = (expensesByDate: ExpensesByDate, year: number): Map<number, number> => {
    const credits = new Map<number, number>();
    const firstYear = Math.min(...expensesByDate.keys());
    if (!Number.isFinite(firstYear) || firstYear > year) {
        return credits;
    }
    let credit = 0;
    for (let y = firstYear; y <= year; y++) {
        for (let month = 0; month < 12; month++) {
            if (y === year && credit < 0) {
                credits.set(month, credit);
            }
            credit = Math.min(0, roundToCents(credit + sumShared(expensesByDate.get(y)?.get(month))));
        }
    }
    return credits;
}

const isSameArray = <T,>(a: T[], b: T[]): boolean => a.length === b.length && a.every((item, i) => item === b[i]);

// puts back the previous value for every key whose contents didn't change, and the previous map itself if nothing did
const keepUnchanged = <K, V>(next: Map<K, V>, previous: Map<K, V> | undefined, keep: (next: V, previous: V) => V): Map<K, V> => {
    if (!previous) {
        return next;
    }
    let isSame = next.size === previous.size;
    next.forEach((value, key) => {
        const previousValue = previous.get(key);
        const kept = previousValue === undefined ? value : keep(value, previousValue);
        next.set(key, kept);
        isSame = isSame && kept === previousValue;
    });
    return isSame ? previous : next;
}

const groupExpensesByDate = (expenses: ExpenseType[], previous?: ExpensesByDate): ExpensesByDate => {
    const expensesByDate: ExpensesByDate = new Map();

    expenses.forEach(expense => {
        const [year, monthNumber, date] = parseDate(expense.date);
        const month = monthNumber - 1;

        if (!expensesByDate.has(year)) {
            expensesByDate.set(year, new Map());
        }
        const expensesForYear = expensesByDate.get(year)!;

        if (!expensesForYear.has(month)) {
            expensesForYear.set(month, new Map());
        }
        const expensesForMonth = expensesForYear.get(month)!;

        if (!expensesForMonth.has(date)) {
            expensesForMonth.set(date, []);
        }

        expensesForMonth.get(date)!.push(expense);
    });

    return keepUnchanged(expensesByDate, previous, (year, previousYear) =>
        keepUnchanged(year, previousYear, (month, previousMonth) =>
            keepUnchanged(month, previousMonth, (date, previousDate) =>
                isSameArray(date, previousDate) ? previousDate : date)));
}

export type ExpenseType = {
    id: string,
    date: string,
    name: string,
    categoryId: number,
    amount: number,
    note?: string | null,
    // left out of the month's split
    personal?: boolean,
}

export type NoteType = {
    year: number,
    month: number,
    paid: boolean,
    text: string,
}

export default Calendar;