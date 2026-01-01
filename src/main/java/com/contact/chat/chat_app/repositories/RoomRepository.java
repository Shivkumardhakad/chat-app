package com.contact.chat.chat_app.repositories;

import com.contact.chat.chat_app.entities.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepository extends MongoRepository<Room,String> {

    // getRoom Using room id
    Room findByRoomId(String userId);
}
