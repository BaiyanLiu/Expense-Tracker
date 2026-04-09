package com.baiyanliu.expensetracker.messaging;

import com.baiyanliu.expensetracker.configuration.WebSocketConfiguration;
import org.springframework.messaging.simp.SimpMessagingTemplate;

public abstract class Message {

    public final void send(SimpMessagingTemplate webSocket) {
        webSocket.convertAndSend(WebSocketConfiguration.MESSAGE_PREFIX + getDestination(), getPayload());
    }

    protected abstract String getDestination();

    protected Object getPayload() {
        return this;
    }
}
