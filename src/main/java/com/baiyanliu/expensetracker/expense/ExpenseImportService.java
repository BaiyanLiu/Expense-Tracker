package com.baiyanliu.expensetracker.expense;

import com.baiyanliu.expensetracker.category.CategoryService;
import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.CategoryRepository;
import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class ExpenseImportService {
    // the length of the name column
    private static final int MAX_NAME_LENGTH = 255;
    private static final int MAX_ROWS = 50000;

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;

    // one row of an imported file. A row names either an existing category by id, or a category by name,
    // which is added if there isn't one by that name yet. The flags are false when left out
    public record ImportRow(LocalDate date, String name, BigDecimal amount, String note, Long categoryId, String categoryName,
                            boolean personal) {}

    public record ImportResult(List<Expense> expenses, List<Category> createdCategories) {}

    public static class ImportException extends RuntimeException {
        public ImportException(String message) {
            super(message);
        }
    }

    // all or nothing, so a bad row partway through doesn't leave half a file imported
    @Transactional
    public ImportResult importExpenses(List<ImportRow> rows) {
        if (rows == null || rows.isEmpty()) {
            throw new ImportException("There's nothing to import.");
        }
        if (rows.size() > MAX_ROWS) {
            throw new ImportException("A file can have at most " + MAX_ROWS + " rows.");
        }

        Map<String, Long> categoryIdsByName = new HashMap<>();
        List<Category> createdCategories = new ArrayList<>();
        List<Expense> expenses = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            ImportRow row = rows.get(i);
            String rowLabel = "Row " + (i + 1) + ": ";
            String name = row.name() == null ? "" : row.name().trim();
            if (row.date() == null || row.amount() == null || name.isEmpty()) {
                throw new ImportException(rowLabel + "needs a date, a name and an amount.");
            }

            Long categoryId = row.categoryId();
            if (row.categoryName() != null && !row.categoryName().isBlank()) {
                String key = row.categoryName().trim().toLowerCase();
                categoryId = categoryIdsByName.get(key);
                if (categoryId == null) {
                    Category category = categoryRepository.findByNameIgnoreCase(row.categoryName().trim())
                            .orElseGet(() -> createCategory(row.categoryName(), rowLabel, createdCategories));
                    categoryId = category.getId();
                    categoryIdsByName.put(key, categoryId);
                }
            } else if (categoryId == null || !categoryRepository.existsById(categoryId)) {
                throw new ImportException(rowLabel + "category not found.");
            }

            Expense expense = new Expense(row.date(), name.substring(0, Math.min(name.length(), MAX_NAME_LENGTH)), categoryId, row.amount());
            expense.setNote(row.note() == null || row.note().isBlank() ? null : row.note().trim());
            expense.setPersonal(row.personal());
            expenses.add(expense);
        }

        List<Expense> saved = new ArrayList<>();
        expenseRepository.saveAll(expenses).forEach(saved::add);
        return new ImportResult(saved, createdCategories);
    }

    private Category createCategory(String name, String rowLabel, List<Category> createdCategories) {
        Category category = new Category(name, null);
        String error = categoryService.normalizeAndValidate(category);
        if (error != null) {
            throw new ImportException(rowLabel + error);
        }
        category = categoryRepository.save(category);
        createdCategories.add(category);
        return category;
    }
}
