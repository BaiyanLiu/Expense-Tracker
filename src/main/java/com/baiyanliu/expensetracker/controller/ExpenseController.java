package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.CategoryRepository;
import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import com.baiyanliu.expensetracker.expense.ExpenseImportService;
import com.baiyanliu.expensetracker.expense.ExpenseImportService.ImportException;
import com.baiyanliu.expensetracker.expense.ExpenseImportService.ImportResult;
import com.baiyanliu.expensetracker.expense.ExpenseImportService.ImportRow;
import com.baiyanliu.expensetracker.messaging.MessageFactory;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Log
@RequestMapping("/api/expense")
@RestController
public class ExpenseController extends CrudController<Expense> {
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final ExpenseImportService expenseImportService;
    private final MessageFactory messageFactory;

    @Autowired
    private ExpenseController(ExpenseRepository expenseRepository, CategoryRepository categoryRepository,
                              ExpenseImportService expenseImportService, MessageFactory messageFactory) {
        super(expenseRepository, "expenses");
        this.expenseRepository = expenseRepository;
        this.categoryRepository = categoryRepository;
        this.expenseImportService = expenseImportService;
        this.messageFactory = messageFactory;
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Map<String, List<Expense>>>> getAllExpenses() {
        log.info("getAllExpenses");
        return getAll();
    }

    @PostMapping
    public ResponseEntity<EntityModel<Expense>> createExpense(@RequestBody Expense expense) {
        log.info("createExpense - " + expense);
        validateCategory(expense);
        return upsert(expense);
    }

    @PutMapping
    public ResponseEntity<EntityModel<Expense>> updateExpense(@RequestBody Expense expense) {
        log.info("updateExpense - " + expense);
        validateCategory(expense);
        return upsert(expense);
    }

    // a category can be merged away while a form is still open on it
    private void validateCategory(Expense expense) {
        if (expense.getCategoryId() == null || !categoryRepository.existsById(expense.getCategoryId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found");
        }
    }

    @Override
    void onUpserted(Expense expense) {
        messageFactory.createMessage(expense);
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Integer>> importExpenses(@RequestBody List<ImportRow> rows) {
        log.info("importExpenses - " + (rows == null ? 0 : rows.size()) + " rows");
        ImportResult result = expenseImportService.importExpenses(rows);
        // sent once the import is saved, so pages that reload on the message see everything
        result.createdCategories().forEach(messageFactory::createMessage);
        messageFactory.createImportedMessage(result.expenses().size());
        return ResponseEntity.ok(Map.of("imported", result.expenses().size()));
    }

    // the page shows the reason, e.g. which row was wrong
    @ExceptionHandler(ImportException.class)
    public ResponseEntity<Map<String, String>> onImportFailed(ImportException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }

    @DeleteMapping
    public ResponseEntity<Long> deleteExpense(@RequestBody long id) {
        log.info("deleteExpense - " + id);
        expenseRepository.deleteById(id);
        messageFactory.createDeletedMessage(id);
        return ResponseEntity.ok(id);
    }
}
