package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.Category;
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

import java.util.Arrays;
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
        return ResponseEntity.ok(EntityModel.of(upsertExpense(expense)));
    }

    @PutMapping
    public ResponseEntity<EntityModel<Expense>> updateExpense(@RequestBody Expense expense) {
        log.info("updateExpense - " + expense);
        return ResponseEntity.ok(EntityModel.of(upsertExpense(expense)));
    }

    private Expense upsertExpense(Expense expense) {
        expense = expenseRepository.save(expense);
        messageFactory.createMessage(expense);
        return expense;
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
