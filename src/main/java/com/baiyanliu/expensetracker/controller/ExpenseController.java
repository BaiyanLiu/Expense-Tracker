package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Optional;
import java.util.stream.StreamSupport;

@Log
@RequestMapping("/api/expense")
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
@RestController
public class ExpenseController {
    private final ExpenseRepository expenseRepository;

    @GetMapping("/all")
    public ResponseEntity<CollectionModel<EntityModel<Expense>>> getAllExpenses() {
        log.info("getAllExpenses");
        List<EntityModel<Expense>> expenses = StreamSupport.stream(expenseRepository.findAll().spliterator(), false)
                .map(EntityModel::of)
                .toList();
        return ResponseEntity.ok(CollectionModel.of(expenses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<Expense>> getExpense(@PathVariable("id") Long id) {
        log.info(String.format("getExpense - id [%d]", id));
        Optional<Expense> expense = expenseRepository.findById(id);
        return expense.map(value -> ResponseEntity.ok(EntityModel.of(value)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
