package com.chat.controller;

import com.chat.model.ChatMessage;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class ChatController {

         @MessageMapping("/sendMessage")    //app/sendMessage ->Need to send message to this group channels
         @SendTo("/topic/messages")
        public ChatMessage sendMessage(ChatMessage chatMessage){
             return chatMessage;
        }

        @GetMapping("/chat")
        public String chat(){
             return "chat";
        }
}
