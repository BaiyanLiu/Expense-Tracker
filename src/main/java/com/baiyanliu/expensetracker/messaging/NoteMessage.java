package com.baiyanliu.expensetracker.messaging;

import com.baiyanliu.expensetracker.entity.Note;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class NoteMessage extends Message {
    private final Note note;

    @Override
    protected String getDestination() {
        return "/note";
    }
}
