package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.Category;
import lombok.extern.java.Log;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@Log
@RequestMapping("/api/type")
@RestController
public class TypeController {

    @GetMapping("/category/all")
    public ResponseEntity<CollectionModel<EntityModel<Category>>> getAlCategories() {
        log.info("getAlCategories");
        List<EntityModel<Category>> categories = Arrays.stream(Category.values())
                .map(EntityModel::of)
                .toList();
        return ResponseEntity.ok(CollectionModel.of(categories));
    }
}
