package com.baiyanliu.expensetracker.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
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
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate date;
    private String name;
    private Long categoryId;
    private BigDecimal amount;
    // optional extra details, e.g. who the bill was split with
    @Column(columnDefinition = "text")
    private String note;
    // a personal purchase, left out of the month's split; the default fills in existing rows when the column is added
    @Column(columnDefinition = "boolean default false not null")
    private boolean personal;

    public Expense(LocalDate date, String name, Long categoryId, BigDecimal amount) {
        this.date = date;
        this.name = name;
        this.categoryId = categoryId;
        this.amount = amount;
    }
}
