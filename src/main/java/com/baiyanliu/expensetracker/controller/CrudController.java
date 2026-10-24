package com.baiyanliu.expensetracker.controller;

import org.springframework.data.repository.CrudRepository;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

abstract class CrudController<T> {
    private final CrudRepository<T, ?> repository;
    // the key the page reads the list from, e.g. "expenses"
    private final String collectionName;

    CrudController(CrudRepository<T, ?> repository, String collectionName) {
        this.repository = repository;
        this.collectionName = collectionName;
    }

    // same shape as a HAL collection ({"_embedded": {"expenses": [...]}}), built directly because
    // HAL's own serializer slows down sharply once there are thousands of items
    ResponseEntity<Map<String, Map<String, List<T>>>> getAll() {
        List<T> entities = StreamSupport.stream(repository.findAll().spliterator(), false).toList();
        return ResponseEntity.ok(Map.of("_embedded", Map.of(collectionName, entities)));
    }

    ResponseEntity<EntityModel<T>> upsert(T entity) {
        entity = repository.save(entity);
        onUpserted(entity);
        return ResponseEntity.ok(EntityModel.of(entity));
    }

    abstract void onUpserted(T entity);
}
