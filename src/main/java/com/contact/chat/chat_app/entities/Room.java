package com.contact.chat.chat_app.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collation = "Rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {
@Id
private String id;// mogodb ka unique identyfiere hai

private String roomId;

   List<Message> massages= new ArrayList<>();
}
