package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import com.baiyanliu.expensetracker.messaging.MessageFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.StreamSupport;

@Log
@RequestMapping("/api/expense")
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
@RestController
public class ExpenseController {
    private final ExpenseRepository expenseRepository;
    private final MessageFactory messageFactory;

    @GetMapping("/all")
    public ResponseEntity<CollectionModel<EntityModel<Expense>>> getAllExpenses() {
        log.info("getAllExpenses");
        List<EntityModel<Expense>> expenses = StreamSupport.stream(expenseRepository.findAll().spliterator(), false)
                .map(EntityModel::of)
                .toList();
        return ResponseEntity.ok(CollectionModel.of(expenses));
    }

    @PostMapping
    public ResponseEntity<EntityModel<Expense>> createExpense(@RequestBody Expense expense) {
        log.info("createExpense - " + expense);
        expense = expenseRepository.save(expense);
        messageFactory.createMessage(expense);
        return ResponseEntity.ok(EntityModel.of(expense));
    }
}
