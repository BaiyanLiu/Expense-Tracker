package com.baiyanliu.expensetracker.messaging;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

// sent once for a whole import, which can be too many expenses to send one message each
@Getter
@RequiredArgsConstructor
public class ExpensesImportedMessage extends Message {
    private final int count;

    @Override
    protected String getDestination() {
        return "/expense/imported";
    }
}
