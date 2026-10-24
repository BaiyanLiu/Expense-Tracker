package com.baiyanliu.expensetracker.messaging;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ExpenseDeletedMessage extends Message {
    private final long id;

    @Override
    protected String getDestination() {
        return "/expense/deleted";
    }
}
