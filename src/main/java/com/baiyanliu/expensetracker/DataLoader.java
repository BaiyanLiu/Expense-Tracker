package com.baiyanliu.expensetracker;

import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.Type;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class DataLoader implements ApplicationRunner {
    private final ExpenseRepository expenseRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        expenseRepository.saveAll(List.of(
                new Expense(Date.valueOf(LocalDate.now().minusMonths(6L)), BigDecimal.valueOf(-123.45d), new Type("type1", "category1")),
                new Expense(Date.valueOf(LocalDate.now().minusMonths(1L)), BigDecimal.valueOf(-123.45d), new Type("type1", "category1")),
                new Expense(Date.valueOf(LocalDate.now().minusMonths(1L)), BigDecimal.valueOf(234.56d), new Type("type2", "category2")),
                new Expense(Date.valueOf(LocalDate.now().minusDays(1L)), BigDecimal.valueOf(234.56d), new Type("type2", "category2"))
        ));
    }
}
