package com.baiyanliu.expensetracker.entity;

import jakarta.annotation.Nullable;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import lombok.AccessLevel;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@IdClass(Month.class)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Note {
    @Id private int year;
    @Id private int month;
    private boolean paid;
    @Nullable private String text;

    public Note(int year, int month, boolean paid, @Nullable String text) {
        this.year = year;
        this.month = month;
        this.paid = paid;
        this.text = text;
    }
}
