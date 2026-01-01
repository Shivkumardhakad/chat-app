package com.contact.chat.chat_app.controllers;

import com.contact.chat.chat_app.entities.Message;
import com.contact.chat.chat_app.entities.Room;
import com.contact.chat.chat_app.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
       room.setRoomId(roomId.trim());
   Room savedRoom=  roomRepository.save(room);
      return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }


    // get room :join

    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable("roomId") String roomId){

        Room room =roomRepository.findByRoomId(roomId);

        if(room!=null){

          return ResponseEntity.ok(room);
      }
         return ResponseEntity.badRequest().body("Room not Found ");

    }



    // get Massages of room
    @GetMapping("/{roomId}/massages")
    public  ResponseEntity<List<Message>> getMassage(@PathVariable("roomId") String roomId){
      Room room =roomRepository.findByRoomId(roomId);
if(room==null){
    return ResponseEntity.badRequest().build();
}
       List<Message> messages =room.getMessages();

       return ResponseEntity.ok(messages);
    }

}
