package com.baiyanliu.expensetracker.controller;

import com.baiyanliu.expensetracker.entity.Note;
import com.baiyanliu.expensetracker.entity.repository.NoteRepository;
import com.baiyanliu.expensetracker.messaging.MessageFactory;
import lombok.extern.java.Log;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Log
@RequestMapping("/api/note")
@RestController
public class NoteController extends CrudController<Note> {
    private final MessageFactory messageFactory;

    @Autowired
    private NoteController(NoteRepository noteRepository, MessageFactory messageFactory) {
        super(noteRepository);
        this.messageFactory = messageFactory;
    }

    @GetMapping("/all")
    public ResponseEntity<CollectionModel<EntityModel<Note>>> getAllNotes() {
        log.info("getAllNotes");
        return getAll();
    }

    @PostMapping
    public ResponseEntity<EntityModel<Note>> createNote(@RequestBody Note note) {
        log.info("createNote - " + note);
        return create(note);
    }

    @PutMapping
    public ResponseEntity<EntityModel<Note>> updateNote(@RequestBody Note note) {
        log.info("updateNote - " + note);
        return update(note);
    }

    @Override
    void onUpserted(Note note) {
        messageFactory.createMessage(note);
    }
}
