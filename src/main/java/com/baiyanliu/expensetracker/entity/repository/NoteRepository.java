package com.baiyanliu.expensetracker.entity.repository;

import com.baiyanliu.expensetracker.entity.Month;
import com.baiyanliu.expensetracker.entity.Note;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
public interface NoteRepository extends CrudRepository<Note, Month> {}
