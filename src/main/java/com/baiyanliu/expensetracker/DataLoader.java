package com.baiyanliu.expensetracker;

import com.baiyanliu.expensetracker.entity.CategoryRepository;
import com.baiyanliu.expensetracker.entity.Expense;
import com.baiyanliu.expensetracker.entity.Note;
import com.baiyanliu.expensetracker.entity.repository.ExpenseRepository;
import com.baiyanliu.expensetracker.entity.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

/**
 * Seeds sample data from January of last year until today: monthly bills, weekly groceries, dining, kids, travel and
 * other spending, with some refunds, notes on expenses, monthly notes and a few edge cases.
 * Spending is positive and refunds are negative.
 * Uses a fixed random seed, so every restart produces the same data.
 */
@Component
@Profile("dev")
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class DataLoader implements ApplicationRunner {
    private static final String[] GROCERY_STORES = {"Loblaws", "Costco", "No Frills", "Farm Boy"};
    private static final String[] COFFEE = {"Starbucks", "Tim Hortons"};
    private static final String[] RESTAURANTS = {"Pizza Pizza", "Thai Express", "Sushi Kaji", "The Keg", "Chipotle"};
    private static final String[] DINING_NOTES = {"split with Sam", "birthday dinner", "work lunch, expense later",
            "takeout for the whole family"};
    private static final String[] KIDS = {"Swim lessons", "Toys R Us", "Old Navy", "School trip"};
    private static final String[] OTHER = {"Amazon", "Shoppers Drug Mart", "Canadian Tire", "Petro-Canada"};
    // nothing is recorded this month, to see how an empty month looks
    private static final YearMonth EMPTY_MONTH = YearMonth.of(LocalDate.now().getYear() - 1, 9);

    private final ExpenseRepository expenseRepository;
    private final NoteRepository noteRepository;
    private final CategoryRepository categoryRepository;
    private final Random random = new Random(42);
    private final List<Expense> expenses = new ArrayList<>();
    private final Map<String, Long> categoryIds = new HashMap<>();

    @Override
    public void run(ApplicationArguments args) {
        LocalDate today = LocalDate.now();
        LocalDate start = LocalDate.of(today.getYear() - 1, 1, 1);
        for (LocalDate date = start; !date.isAfter(today); date = date.plusDays(1)) {
            if (!YearMonth.from(date).equals(EMPTY_MONTH)) {
                addDay(date);
            }
        }
        addTrips(today.getYear() - 1);
        addEdgeCases(today.getYear() - 1);
        expenses.removeIf(expense -> expense.getDate().isAfter(today));
        expenseRepository.saveAll(expenses);

        List<Note> notes = new ArrayList<>();
        for (YearMonth month = YearMonth.from(start); !month.isAfter(YearMonth.from(today)); month = month.plusMonths(1)) {
            boolean current = month.equals(YearMonth.from(today));
            // notes number their months 0-11, like the page does
            notes.add(new Note(month.getYear(), month.getMonthValue() - 1, !current, monthText(month)));
        }
        noteRepository.saveAll(notes);
    }

    private void addDay(LocalDate date) {
        switch (date.getDayOfMonth()) {
            case 1 -> add(date, "Rent", "Bills", 185000);
            case 5 -> add(date, "Daycare", "Kids", 95000);
            case 15 -> add(date, "Hydro", "Bills", between(6000, 14000));
            case 20 -> add(date, "Internet", "Bills", 7999);
            case 25 -> add(date, "Phone", "Bills", 4500);
            default -> {
            }
        }
        if (date.getDayOfMonth() == 15 && random.nextInt(8) == 0) {
            add(date.plusDays(2), "Hydro credit", "Bills", -between(1000, 3000));
        }

        if (date.getDayOfWeek() == DayOfWeek.SATURDAY) {
            Expense groceries = add(date, pick(GROCERY_STORES), "Groceries", between(4000, 22000));
            if (random.nextInt(10) == 0) {
                groceries.setNote("includes party supplies");
            }
        }

        if (random.nextInt(4) == 0) {
            add(date, pick(COFFEE), "Dining", between(450, 900));
        }
        if (random.nextInt(5) == 0) {
            Expense dinner = add(date, pick(RESTAURANTS), "Dining", between(1500, 9000));
            if (random.nextInt(3) == 0) {
                dinner.setNote(pick(DINING_NOTES));
            }
        }

        if (random.nextInt(12) == 0) {
            add(date, pick(KIDS), "Kids", between(2000, 15000));
        }

        if (random.nextInt(9) == 0) {
            String name = pick(OTHER);
            add(date, name, "Other", between(1000, 12000));
            if (name.equals("Amazon") && random.nextInt(3) == 0) {
                add(date.plusDays(between(3, 14)), "Amazon refund", "Other", -between(1000, 6000))
                        .setNote("returned, wrong size");
            }
        }
    }

    private void addTrips(int year) {
        add(LocalDate.of(year, 7, 2), "Air Canada", "Travel", 412873).setNote("flights to Lisbon for four");
        add(LocalDate.of(year, 7, 3), "Hotel Avenida", "Travel", 186040);
        add(LocalDate.of(year, 7, 10), "Hotel Avenida", "Travel", -15000).setNote("refund for the broken AC");
        add(LocalDate.of(year + 1, 3, 13), "Airbnb", "Travel", 64500).setNote("March break at the cottage");
        add(LocalDate.of(year + 1, 3, 13), "Petro-Canada", "Travel", 8250);
    }

    private void addEdgeCases(int year) {
        add(LocalDate.of(year, 4, 2), "App Store", "Other", 1);
        add(LocalDate.of(year, 6, 18), "Costco Wholesale Kitchener - paper towels, detergent, snacks and a patio "
                + "umbrella for the cottage weekend", "Groceries", 38712);
        add(LocalDate.of(year, 11, 12), "Tax refund", "Other", -124300).setNote("CRA");

        // a busy holiday shopping day
        LocalDate shopping = LocalDate.of(year, 12, 20);
        add(shopping, "Toys R Us", "Kids", 21499);
        add(shopping, "Indigo", "Other", 6380);
        add(shopping, "Best Buy", "Other", 54999).setNote("gift for Mom");
        add(shopping, "Starbucks", "Dining", 785);
        add(shopping, "LCBO", "Other", 9420);
        add(shopping, "Old Navy", "Kids", 8800);
        add(shopping, "Best Buy", "Other", -5000).setNote("price match");
        add(shopping, "The Keg", "Dining", 18650);
    }

    private Expense add(LocalDate date, String name, String category, long cents) {
        Expense expense = new Expense(date, name, getCategoryId(category), BigDecimal.valueOf(cents, 2));
        expenses.add(expense);
        return expense;
    }

    private String monthText(YearMonth month) {
        if (month.equals(EMPTY_MONTH)) {
            return "Away all month, nothing tracked";
        }
        return switch (month.getMonthValue()) {
            case 1 -> "New year budget: $4,500";
            case 7 -> "Lisbon trip";
            case 12 -> "Holiday gifts";
            default -> random.nextInt(3) == 0 ? "Paid by e-transfer" : null;
        };
    }

    private int between(int min, int max) {
        return min + random.nextInt(max - min + 1);
    }

    private String pick(String[] options) {
        return options[random.nextInt(options.length)];
    }

    // the default categories are added by CategoryMigration, which runs first
    private Long getCategoryId(String name) {
        return categoryIds.computeIfAbsent(name,
                key -> categoryRepository.findByNameIgnoreCase(key).orElseThrow().getId());
    }
}
