package com.baiyanliu.expensetracker;

import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.Note;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import com.baiyanliu.expensetracker.entity.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class DataLoader implements ApplicationRunner {
    private final ExpenseRepository expenseRepository;
    private final NoteRepository noteRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        expenseRepository.saveAll(List.of(
                new Expense(LocalDate.now().minusMonths(6L), "name1", Category.BILLS, BigDecimal.valueOf(-123.45d)),
                new Expense(LocalDate.now().minusMonths(1L), "name2", Category.KIDS, BigDecimal.valueOf(-123.45d)),
                new Expense(LocalDate.now().minusMonths(1L), "name3", Category.GROCERIES, BigDecimal.valueOf(234.56d)),
                new Expense(LocalDate.now().minusDays(1L), "name4", Category.OTHER, BigDecimal.valueOf(234.56d))
        ));

        noteRepository.saveAll(List.of(
                new Note(2025, 9, true, "note1"),
                new Note(2026, 3, false, null),
                new Note(2026, 4, true, "note2")
        ));
    }
}
