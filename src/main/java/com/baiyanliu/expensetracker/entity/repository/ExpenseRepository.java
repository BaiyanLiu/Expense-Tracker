package com.baiyanliu.expensetracker.entity.repository;

import com.baiyanliu.expensetracker.entity.Expense;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
public interface ExpenseRepository extends CrudRepository<Expense, Long> {}
