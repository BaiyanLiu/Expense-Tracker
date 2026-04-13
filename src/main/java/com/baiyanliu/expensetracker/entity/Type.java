package com.baiyanliu.expensetracker.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(indexes = {@Index(name = "category", columnList = "category")})
public class Type {
    @GeneratedValue @Id private long id;
    private String name;
    private Category category;

    public Type(String name, Category category) {
        this.name = name;
        this.category = category;
    }
}
