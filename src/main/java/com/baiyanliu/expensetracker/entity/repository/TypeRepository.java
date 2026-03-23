package com.baiyanliu.expensetracker.entity.repository;

import com.baiyanliu.expensetracker.entity.Type;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
public interface TypeRepository extends CrudRepository<Type, Long> {}
