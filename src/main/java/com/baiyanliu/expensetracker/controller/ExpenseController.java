package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import com.baiyanliu.expensetracker.messaging.MessageFactory;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@Log
@RequestMapping("/api/expense")
@RestController
public class ExpenseController extends CrudController<Expense> {
    private final ExpenseRepository expenseRepository;
    private final MessageFactory messageFactory;

    @Autowired
    private ExpenseController(ExpenseRepository expenseRepository, MessageFactory messageFactory) {
        super(expenseRepository);
        this.expenseRepository = expenseRepository;
        this.messageFactory = messageFactory;
    }

    @GetMapping("/all")
    public ResponseEntity<CollectionModel<EntityModel<Expense>>> getAllExpenses() {
        log.info("getAllExpenses");
        return getAll();
    }

    @PostMapping
    public ResponseEntity<EntityModel<Expense>> createExpense(@RequestBody Expense expense) {
        log.info("createExpense - " + expense);
        return create(expense);
    }

    @PutMapping
    public ResponseEntity<EntityModel<Expense>> updateExpense(@RequestBody Expense expense) {
        log.info("updateExpense - " + expense);
        return update(expense);
    }

    @Override
    void onUpserted(Expense expense) {
        messageFactory.createMessage(expense);
    }

    @DeleteMapping
    public ResponseEntity<Long> deleteExpense(@RequestBody long id) {
        log.info("deleteExpense - " + id);
        expenseRepository.deleteById(id);
        return ResponseEntity.ok(id);
    }

    @GetMapping("/category/all")
    public ResponseEntity<CollectionModel<String>> getAllCategories() {
        log.info("getAllCategories");
        List<String> categories = Arrays.stream(Category.values())
                .map(Category::name)
                .toList();
        return ResponseEntity.ok(CollectionModel.of(categories));
    }
}
