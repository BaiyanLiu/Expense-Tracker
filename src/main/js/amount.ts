import {ExpenseType} from "./calendar";

// adding up cents in floating point leaves tiny errors, so a refund that cancels a purchase could come to
// -0.0000001 and show as a red -$0.00; totals are rounded to the cent to come out exactly
export const roundToCents = (amount: number): number => Math.round(amount * 100) / 100;

export const sumAmounts = (expenses: ExpenseType[]): number =>
    roundToCents(expenses.reduce((total, expense) => total + expense.amount, 0));

// what a month's expenses come to once personal ones are left out: the amount that's split
export const sumShared = (expenses?: Map<number, ExpenseType[]>): number => {
    let total = 0;
    expenses?.forEach(date => total += sumAmounts(date.filter(expense => !expense.personal)));
    return roundToCents(total);
}

// red for negative amounts, white for positive amounts and zero
export const amountClass = (amount: number): string => amount < 0 ? "negative-amount-text" : "positive-amount-text";

// two decimals with thousands separators, and the minus sign ahead of the dollar sign: -$1,234.50
const AMOUNT_FORMAT = new Intl.NumberFormat("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});

export const formatAmount = (amount: number): string =>
    `${amount < 0 ? "-" : ""}$${AMOUNT_FORMAT.format(Math.abs(amount))}`;

// half of an amount to the cent, rounding a half-cent away from zero so the two halves never come to less than the whole
export const halveAmount = (amount: number): number =>
    Math.sign(amount) * Math.ceil(Math.round(Math.abs(amount) * 100) / 2) / 100;

// a plain number, allowing a missing whole or fractional part: 5, -5.25, .5, 5.
const NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;

// works out what's typed in an amount box: a plain number, or sums like 45.80/2 or (12+8.50)*3.
// Returns undefined for anything else, including division by zero. A plain number keeps the
// two-decimal limit; a sum's result is rounded to the cent
export const evaluateAmount = (text: string): number | undefined => {
    const input = text.replace(/\s/g, "");
    if (NUMBER.test(input)) {
        return /\.\d{3,}$/.test(input) ? undefined : Number(input);
    }

    let position = 0;
    const peek = (): string => input[position];

    // a number, a bracketed sum, or either with a minus in front
    const factor = (): number => {
        if (peek() === "-") {
            position++;
            return -factor();
        }
        if (peek() === "(") {
            position++;
            const value = sum();
            if (peek() !== ")") {
                throw new Error();
            }
            position++;
            return value;
        }
        const match = /^(\d+\.?\d*|\.\d+)/.exec(input.slice(position));
        if (!match) {
            throw new Error();
        }
        position += match[0].length;
        return Number(match[0]);
    }

    const product = (): number => {
        let value = factor();
        while (peek() === "*" || peek() === "/") {
            const operator = input[position++];
            const next = factor();
            if (operator === "/" && next === 0) {
                throw new Error();
            }
            value = operator === "*" ? value * next : value / next;
        }
        return value;
    }

    const sum = (): number => {
        let value = product();
        while (peek() === "+" || peek() === "-") {
            const operator = input[position++];
            const next = product();
            value = operator === "+" ? value + next : value - next;
        }
        return value;
    }

    try {
        const value = sum();
        return position === input.length && Number.isFinite(value) ? roundToCents(value) : undefined;
    } catch {
        return undefined;
    }
}
