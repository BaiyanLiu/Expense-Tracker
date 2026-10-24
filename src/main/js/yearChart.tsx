'use strict';

import React, {useState} from "react";
import {ExpenseType} from "./calendar";
import {CategoryOptions, useCategories} from "./categories";
import {amountClass, formatAmount} from "./amount";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const WIDTH = 840;
const HEIGHT = 260;
const PLOT_TOP = 24;
const PLOT_BOTTOM = HEIGHT - 24;
const SLOT = WIDTH / 12;
// last year's bar sits left of this year's, the pair taking up 70% of the month's slot
const BAR_WIDTH = SLOT * 0.33;
const BAR_GAP = SLOT * 0.04;

// spending only: positive amounts; limited to one category when categoryId is set
const getMonthlySpending = (expenses?: Map<number, Map<number, ExpenseType[]>>, categoryId?: number): number[] =>
    MONTH_LABELS.map((_, month) => {
        let spending = 0;
        expenses?.get(month)?.forEach(date =>
            date.forEach(expense => {
                if (expense.amount > 0 && (categoryId === undefined || expense.categoryId === categoryId)) {
                    spending += expense.amount;
                }
            }));
        return spending;
    });

const sum = (amounts: number[]): number => amounts.reduce((total, amount) => total + amount, 0);

const formatDollars = (amount: number): string => `$${Math.round(amount).toLocaleString()}`;

const formatChange = (amount: number, previous: number): string => {
    if (previous <= 0) {
        return "";
    }
    const change = Math.round((amount - previous) / previous * 100);
    return ` (${change > 0 ? "+" : ""}${change}%)`;
}

// rounded top, square bottom on the baseline
const getBarPath = (x: number, y: number): string => {
    const radius = Math.min(4, PLOT_BOTTOM - y);
    return `M${x},${PLOT_BOTTOM} V${y + radius} Q${x},${y} ${x + radius},${y} ` +
        `H${x + BAR_WIDTH - radius} Q${x + BAR_WIDTH},${y} ${x + BAR_WIDTH},${y + radius} V${PLOT_BOTTOM} Z`;
}

function YearChart({year, expenses, previousExpenses, onSelectMonth}: {
    year: number,
    expenses?: Map<number, Map<number, ExpenseType[]>>,
    previousExpenses?: Map<number, Map<number, ExpenseType[]>>,
    onSelectMonth: (month: number) => void
}) {

    const categories = useCategories();
    const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
    // a merged or deleted category falls back to all categories
    const category = categories.find(category => category.id === categoryId);
    const color = category ? {fill: category.color} : undefined;

    const previousYear = year - 1;
    const spending = getMonthlySpending(expenses, category?.id);
    const previousSpending = getMonthlySpending(previousExpenses, category?.id);
    const hasPrevious = previousSpending.some(amount => amount > 0);
    const max = Math.max(...spending, ...previousSpending);
    const monthsWithSpending = spending.filter(amount => amount > 0);
    const average = monthsWithSpending.length > 0 ? sum(monthsWithSpending) / monthsWithSpending.length : 0;
    const toY = (amount: number): number => PLOT_BOTTOM - (max > 0 ? amount / max : 0) * (PLOT_BOTTOM - PLOT_TOP);

    const categorySelect =
        <select value={category?.id ?? ""} onChange={event =>
            setCategoryId(event.target.value === "" ? undefined : Number(event.target.value))}>
            <option value="">All categories</option>
            <CategoryOptions/>
        </select>;
    const subject = category ? `${category.name} spending` : "Spending";

    if (max === 0) {
        return (
            <div className="year-chart">
                <div className="panel-title">{subject} by month, {year} {categorySelect}</div>
                <div className="empty">No {category ? `${category.name} ` : ""}spending in {year}</div>
            </div>
        );
    }

    // the current year is compared against the same months of last year, so a part year isn't set against a full one
    const today = new Date();
    const comparedMonths = year === today.getFullYear() ? today.getMonth() + 1 : 12;
    const total = sum(spending.slice(0, comparedMonths));
    const previousTotal = sum(previousSpending.slice(0, comparedMonths));
    const period = comparedMonths === 12 ? `${year}` : `${MONTH_LABELS[0]}–${MONTH_LABELS[comparedMonths - 1]} ${year}`;

    return (
        <div className="year-chart">
            <div className="panel-title">
                {subject} by month, {year}{hasPrevious && ` vs ${previousYear}`} {categorySelect}
            </div>
            {hasPrevious
                ? <div className="comparison">
                    <span className="legend previous"/>{previousYear}
                    <span className="legend current" style={category ? {backgroundColor: category.color} : undefined}/>{year}
                    <span className="summary">
                        {period}: {formatDollars(total)} vs {formatDollars(previousTotal)} in {previousYear}
                        {/* spending more than last year is the bad case, so it shows red */}
                        <span className={amountClass(previousTotal - total)}>
                            {formatChange(total, previousTotal)}
                        </span>
                    </span>
                </div>
                : <div className="comparison">No spending in {previousYear} to compare</div>}
            <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width={WIDTH} height={HEIGHT} role="img"
                 aria-label={`Monthly ${category ? `${category.name} ` : ""}spending in ${year}${hasPrevious ? ` compared with ${previousYear}` : ""}`}>
                <line className="baseline" x1={0} x2={WIDTH} y1={PLOT_BOTTOM} y2={PLOT_BOTTOM}/>
                {spending.map((amount, month) => {
                    const previousAmount = previousSpending[month];
                    const center = month * SLOT + SLOT / 2;
                    // without last year's data the bar stays centered, as before
                    const x = hasPrevious ? center + BAR_GAP / 2 : center - BAR_WIDTH / 2;
                    const previousX = center - BAR_GAP / 2 - BAR_WIDTH;
                    const y = toY(amount);
                    const title = hasPrevious
                        ? `${MONTH_LABELS[month]}: ${formatDollars(amount)} in ${year} vs ` +
                            `${formatDollars(previousAmount)} in ${previousYear}${formatChange(amount, previousAmount)}`
                        : `${MONTH_LABELS[month]} ${year}: ${formatAmount(amount)} spent${category ? ` on ${category.name}` : ""}`;
                    return (
                        <g key={month} className="bar" onClick={() => onSelectMonth(month)}>
                            <title>{title}</title>
                            {/* full-height hit target so short bars are easy to click */}
                            <rect className="hit" x={month * SLOT} y={PLOT_TOP} width={SLOT} height={PLOT_BOTTOM - PLOT_TOP}/>
                            {hasPrevious && previousAmount > 0 &&
                                <path className="previous-fill" d={getBarPath(previousX, toY(previousAmount))}/>}
                            {amount > 0 && <path className={`bar-fill ${category ? "category" : ""}`} style={color} d={getBarPath(x, y)}/>}
                            {amount > 0 &&
                                <text className="value" x={x + BAR_WIDTH / 2} y={y - 6} textAnchor="middle">
                                    ${Math.round(amount)}
                                </text>}
                            <text className="label" x={center} y={HEIGHT - 6} textAnchor="middle">
                                {MONTH_LABELS[month]}
                            </text>
                        </g>
                    );
                })}
                {average > 0 &&
                    <>
                        <line className="average" x1={0} x2={WIDTH} y1={toY(average)} y2={toY(average)}/>
                        <text className="average-label" x={WIDTH - 4} y={toY(average) - 4} textAnchor="end">
                            Avg ${Math.round(average)}
                        </text>
                    </>}
            </svg>
        </div>
    );
}

export default React.memo(YearChart);
