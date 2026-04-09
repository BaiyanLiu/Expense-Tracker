package com.baiyanliu.expensetracker.messaging;

import com.baiyanliu.expensetracker.entity.Expense;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ExpenseMessage extends Message {
    private final Expense expense;

    @Override
    protected String getDestination() {
        return "/expense";
    }
}
