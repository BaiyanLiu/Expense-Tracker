package com.baiyanliu.expensetracker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.sql.Date;

@Data
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(indexes = {@Index(name = "date", columnList = "date")})
public class Expense {
    @GeneratedValue @Id private long id;
    private Date date;
    private BigDecimal amount;
    @ManyToOne(cascade = CascadeType.PERSIST) private Type type;

    public Expense(Date date, BigDecimal amount, Type type) {
        this.date = date;
        this.amount = amount;
        this.type = type;
    }
}
