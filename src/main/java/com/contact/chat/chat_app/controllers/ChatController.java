package com.contact.chat.chat_app.controllers;

import com.contact.chat.chat_app.entities.Message;
import com.contact.chat.chat_app.entities.Room;
import com.contact.chat.chat_app.payload.MessageRequest;
import com.contact.chat.chat_app.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Controller
public class ChatController  {

    @Autowired
    RoomRepository roomRepository;

    // sending message  receiving message
    @MessageMapping("/sendMessage/{roomId}")//  send message /chat/sendMessage/roomId
    @SendTo("/topic/room/{roomId}")// subscribe
    public Message sendMessage (
            @DestinationVariable String roomId , @RequestBody MessageRequest request
    ) {
       Room room    =roomRepository.findByRoomId(request.getRoomId().trim());

       Message message= new Message();
       message.setContent(request.getContent());
       message.setSender(request.getSender());
       message.setTimeStamp(request.getMessageTime());

       if(room!=null){

   room.getMessages().add(message);

   roomRepository.save(room);

       }else {
           throw new  RuntimeException("Room not found");
       }

       return message;
    }



}

