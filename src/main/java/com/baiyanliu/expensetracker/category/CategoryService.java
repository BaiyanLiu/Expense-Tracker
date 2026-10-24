package com.baiyanliu.expensetracker.category;

import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.CategoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@RequiredArgsConstructor(onConstructor = @__({@Autowired}))
public class CategoryService {
    // readable on the dark background; new categories take the first one not already in use
    private static final List<String> PALETTE = List.of(
            "#5b8def", "#e8a33d", "#4cc38a", "#d660a8", "#2ab7ca", "#9a8cf0", "#e5c454", "#e0645c");
    private static final int MAX_NAME_LENGTH = 50;

    private final CategoryRepository categoryRepository;
    @PersistenceContext private EntityManager entityManager;

    // trims the name and fills in a color if missing; returns a reason if the category can't be saved
    public String normalizeAndValidate(Category category) {
        String name = category.getName() == null ? "" : category.getName().trim();
        category.setName(name);
        if (name.isEmpty()) {
            return "Name can't be blank";
        }
        if (name.length() > MAX_NAME_LENGTH) {
            return "Name can't be longer than " + MAX_NAME_LENGTH + " characters";
        }
        boolean isTaken = categoryRepository.findByNameIgnoreCase(name)
                .filter(existing -> existing.getId() != category.getId())
                .isPresent();
        if (isTaken) {
            return "There's already a category called " + name;
        }

        if (category.getColor() == null || category.getColor().isBlank()) {
            category.setColor(getNextColor());
        } else if (!category.getColor().matches("^#[0-9a-fA-F]{6}$")) {
            return "Color must look like #rrggbb";
        }
        category.setColor(category.getColor().toLowerCase());
        return null;
    }

    private String getNextColor() {
        List<Category> categories = StreamSupport.stream(categoryRepository.findAll().spliterator(), false).toList();
        Set<String> used = categories.stream()
                .map(Category::getColor)
                .collect(Collectors.toSet());
        return PALETTE.stream()
                .filter(color -> !used.contains(color))
                .findFirst()
                .orElse(PALETTE.get(categories.size() % PALETTE.size()));
    }

    // moves every expense from one category to another, then removes the first
    @Transactional
    public void merge(long fromId, long toId) {
        entityManager.createQuery("update Expense e set e.categoryId = :toId where e.categoryId = :fromId")
                .setParameter("fromId", fromId)
                .setParameter("toId", toId)
                .executeUpdate();

        categoryRepository.deleteById(fromId);
    }
}
