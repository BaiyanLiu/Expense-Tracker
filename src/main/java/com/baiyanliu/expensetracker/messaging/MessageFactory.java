package com.baiyanliu.expensetracker.messaging;

import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.Note;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class MessageFactory {
    private final SimpMessagingTemplate webSocket;

    public void createMessage(Expense expense) {
        new ExpenseMessage(expense).send(webSocket);
    }

    public void createDeletedMessage(long expenseId) {
        new ExpenseDeletedMessage(expenseId).send(webSocket);
    }

    public void createImportedMessage(int count) {
        new ExpensesImportedMessage(count).send(webSocket);
    }

    public void createMessage(Note note) {
        new NoteMessage(note).send(webSocket);
    }

    public void createMessage(Category category) {
        new CategoryMessage(category).send(webSocket);
    }

    public void createCategoryMergedMessage(long fromId, long toId) {
        new CategoryMergedMessage(fromId, toId).send(webSocket);
    }
}
