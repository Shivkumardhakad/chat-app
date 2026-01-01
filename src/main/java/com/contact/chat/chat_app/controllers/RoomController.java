package com.contact.chat.chat_app.controllers;

import com.contact.chat.chat_app.entities.Room;
import com.contact.chat.chat_app.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {
    @Autowired
    private RoomRepository roomRepository;
    //create room
 @PostMapping("/")
public ResponseEntity<?> createRoom(@RequestBody String roomId){

       if(roomRepository.findByRoomId(roomId)!=null){

           return ResponseEntity.badRequest().body("Room alredy exists ");
       }
       Room room = new Room();
       room.setRoomId(roomId);
   Room savedRoom=  roomRepository.save(room);
      return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }


    // get room


    // get Massages of room

}
