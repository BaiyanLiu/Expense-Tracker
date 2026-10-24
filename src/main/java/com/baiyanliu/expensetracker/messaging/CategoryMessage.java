package com.baiyanliu.expensetracker.messaging;

import com.baiyanliu.expensetracker.entity.Category;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class CategoryMessage extends Message {
    private final Category category;

    @Override
    protected String getDestination() {
        return "/category";
    }
}
