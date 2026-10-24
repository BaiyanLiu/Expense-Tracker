package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.category.CategoryService;
import com.baiyanliu.expensetracker.entity.Category;
import com.baiyanliu.expensetracker.entity.CategoryRepository;
import com.baiyanliu.expensetracker.messaging.MessageFactory;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Log
@RequestMapping("/api/category")
@RestController
public class CategoryController extends CrudController<Category> {
    private final CategoryRepository categoryRepository;
    private final CategoryService categoryService;
    private final MessageFactory messageFactory;

    @Autowired
    private CategoryController(CategoryRepository categoryRepository, CategoryService categoryService, MessageFactory messageFactory) {
        super(categoryRepository, "categories");
        this.categoryRepository = categoryRepository;
        this.categoryService = categoryService;
        this.messageFactory = messageFactory;
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Map<String, List<Category>>>> getAllCategories() {
        log.info("getAllCategories");
        return getAll();
    }

    // synchronized so two requests arriving together can't both pass the name check and save the same name twice
    @PostMapping
    public synchronized ResponseEntity<EntityModel<Category>> createCategory(@RequestBody Category category) {
        log.info("createCategory - " + category);
        category.setId(0);
        validate(category);
        return upsert(category);
    }

    @PutMapping
    public synchronized ResponseEntity<EntityModel<Category>> updateCategory(@RequestBody Category category) {
        log.info("updateCategory - " + category);
        if (!categoryRepository.existsById(category.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found");
        }
        validate(category);
        return upsert(category);
    }

    private void validate(Category category) {
        String error = categoryService.normalizeAndValidate(category);
        if (error != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, error);
        }
    }

    @Override
    void onUpserted(Category category) {
        messageFactory.createMessage(category);
    }

    public record MergeRequest(long fromId, long toId) {}

    @PostMapping("/merge")
    public ResponseEntity<MergeRequest> mergeCategories(@RequestBody MergeRequest request) {
        log.info("mergeCategories - " + request);
        if (request.fromId() == request.toId()
                || !categoryRepository.existsById(request.fromId())
                || !categoryRepository.existsById(request.toId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pick two different categories");
        }
        categoryService.merge(request.fromId(), request.toId());
        messageFactory.createCategoryMergedMessage(request.fromId(), request.toId());
        return ResponseEntity.ok(request);
    }
}
