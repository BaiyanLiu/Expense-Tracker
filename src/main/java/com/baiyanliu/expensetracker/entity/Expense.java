package com.baiyanliu.expensetracker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(indexes = {@Index(name = "date", columnList = "date")})
public class Expense {
    @GeneratedValue @Id private long id;
    private LocalDate date;
    private String name;
    private Category category;
    private BigDecimal amount;

    public Expense(LocalDate date, String name, Category category, BigDecimal amount) {
        this.date = date;
        this.name = name;
        this.category = category;
        this.amount = amount;
    }
}
