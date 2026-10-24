package com.baiyanliu.expensetracker.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {
    @GeneratedValue @Id private long id;
    private String name;
    // "#rrggbb"
    private String color;

    public Category(String name, String color) {
        this.name = name;
        this.color = color;
    }
}
