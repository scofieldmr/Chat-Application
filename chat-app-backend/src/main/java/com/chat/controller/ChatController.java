package com.chat.controller;

import com.chat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    // This method listens for messages sent to "/app/sendMessage" and sends them to "/topic/messages"
    @MessageMapping("/sendMessage")
    public void sendMessage(ChatMessage chatMessage) {
        messagingTemplate.convertAndSend("/topic/messages", chatMessage);

    }

    //Using Thymeleaf

//        @MessageMapping("/sendMessage")    //app/sendMessage ->Need to send message to this group channels
//        @SendTo("/topic/messages")
//        public ChatMessage sendMessage(@Payload ChatMessage chatMessage){
//            System.out.println("Received message: " + chatMessage.getSender() +" :" + chatMessage.getContent());
//            return chatMessage;
//        }
//
//        @GetMapping("/chat")
//        public String getChat(){
//            return "chat";
//        }
}
