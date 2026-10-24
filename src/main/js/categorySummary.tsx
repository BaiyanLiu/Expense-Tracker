'use strict';

import React from "react";
import {ExpenseType} from "./calendar";
import {CategoryName, useCategoryLookup} from "./categories";
import {amountClass, formatAmount} from "./amount";

type CategoryTotal = {
    categoryId: number,
    total: number,
}

const getCategoryTotals = (expenses?: Map<number, ExpenseType[]>): CategoryTotal[] => {
    const totals = new Map<number, number>();
    expenses?.forEach(date =>
        date.forEach(expense =>
            totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + expense.amount)));

    return Array.from(totals, ([categoryId, total]) => ({categoryId, total}))
        .filter(categoryTotal => Math.abs(categoryTotal.total) >= 0.005)
        .sort((a, b) => b.total - a.total);
}

function CategorySummary({expenses}: {
    expenses?: Map<number, ExpenseType[]>
}) {

    const getCategory = useCategoryLookup();
    const categoryTotals = getCategoryTotals(expenses);
    const totalSpending = categoryTotals
        .filter(categoryTotal => categoryTotal.total > 0)
        .reduce((total, categoryTotal) => total + categoryTotal.total, 0);

    if (categoryTotals.length === 0) {
        return <div className="category-summary empty">No expenses this month</div>;
    }

    return (
        <table className="category-summary">
            <tbody>
            {categoryTotals.map(({categoryId, total}) => {
                const share = total > 0 && totalSpending > 0 ? total / totalSpending * 100 : undefined;
                return (
                    <tr key={categoryId}>
                        <td className="category">
                            <CategoryName categoryId={categoryId}/>
                        </td>
                        <td className={`amount ${amountClass(total)}`}>{formatAmount(total)}</td>
                        <td className="share">{share !== undefined ? `${share.toFixed(0)}%` : ""}</td>
                        <td className="bar">
                            {share !== undefined && <div
                                className="bar-fill"
                                style={{width: `${share}%`, backgroundColor: getCategory(categoryId).color}}/>}
                        </td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
}

export default CategorySummary;
