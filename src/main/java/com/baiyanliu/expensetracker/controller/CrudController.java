package com.baiyanliu.expensetracker.controller;

import org.springframework.data.repository.CrudRepository;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.stream.StreamSupport;

abstract class CrudController<T> {
    private final CrudRepository<T, ?> repository;

    CrudController(CrudRepository<T, ?> repository) {
        this.repository = repository;
    }

    ResponseEntity<CollectionModel<EntityModel<T>>> getAll() {
        List<EntityModel<T>> entities = StreamSupport.stream(repository.findAll().spliterator(), false)
                .map(EntityModel::of)
                .toList();
        return ResponseEntity.ok(CollectionModel.of(entities));
    }

    ResponseEntity<EntityModel<T>> create( T entity) {
        return ResponseEntity.ok(EntityModel.of(upsert(entity)));
    }

    ResponseEntity<EntityModel<T>> update(@RequestBody T entity) {
        return ResponseEntity.ok(EntityModel.of(upsert(entity)));
    }

    private T upsert(T entity) {
        entity = repository.save(entity);
        onUpserted(entity);
        return entity;
    }

    abstract void onUpserted(T entity);
}
