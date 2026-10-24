package com.baiyanliu.expensetracker.category;

import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Categories used to be a fixed enum, stored as its position (0 = Bills ... 5 = Other) in a "category" column.
 * On the first start with editable categories this adds the six defaults in that order and points existing
 * expenses at them. The old column is left as it was.
 * Runs before anything else so the dev data loader sees the new categories.
 */
@Log
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class CategoryMigration implements ApplicationRunner {
    private static final List<Category> DEFAULTS = List.of(
            new Category("Bills", "#5b8def"),
            new Category("Dining", "#e8a33d"),
            new Category("Groceries", "#4cc38a"),
            new Category("Kids", "#d660a8"),
            new Category("Travel", "#2ab7ca"),
            new Category("Other", "#9aa0a6"));

    private final CategoryRepository categoryRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        log.info("Adding default categories");
        for (int ordinal = 0; ordinal < DEFAULTS.size(); ordinal++) {
            Category template = DEFAULTS.get(ordinal);
            long id = categoryRepository.save(new Category(template.getName(), template.getColor())).getId();

            if (hasColumn("expense", "category")) {
                int updated = jdbcTemplate.update(
                        "update expense set category_id = ? where category = ? and category_id is null", id, ordinal);
                log.info("Moved " + updated + " expenses to " + template.getName());
            }
        }
    }

    private boolean hasColumn(String table, String column) {
        Integer count = jdbcTemplate.queryForObject(
                "select count(*) from information_schema.columns " +
                        "where table_schema = current_schema() and table_name = ? and column_name = ?",
                Integer.class, table, column);
        return count != null && count > 0;
    }
}
