package com.baiyanliu.expensetracker.messaging;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CategoryMergedMessage extends Message {
    private final long fromId;
    private final long toId;

    @Override
    protected String getDestination() {
        return "/category/merged";
    }
}
