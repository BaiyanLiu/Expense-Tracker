package com.baiyanliu.expensetracker.messaging;

import com.baiyanliu.expensetracker.entity.Expense;
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
}
