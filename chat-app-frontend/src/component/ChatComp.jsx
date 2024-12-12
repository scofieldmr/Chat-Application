import 'bootstrap/dist/css/bootstrap.min.css'
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import React, { useState, useEffect } from 'react';

function ChatComp() {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [connected, setConnected] = useState(false);

  // Set the connection status
  const setConnectionStatus = (status) => {
    setConnected(status);
  };

  // Connect to WebSocket and set up STOMP
  const connect = () => {
    const socket = new SockJS('http://localhost:8080/chat');  // Backend server which is running
    const client = Stomp.over(socket);

    // Connect to the WebSocket server
    client.connect({}, (frame) => {
      console.log('Connected: ' + frame);
      setConnectionStatus(true); // Set connected status to true

      // Subscribe to messages only once
      client.subscribe('/topic/messages', (msg) => {
        console.log("Received message:", msg);  // Log received message to confirm it triggers once
        showMessage(JSON.parse(msg.body)); // Display incoming messages
      });
    }, (error) => {
      console.error('Error in WebSocket connection:', error);
      setConnectionStatus(false); // Set connected status to false if error occurs
    });

    setStompClient(client); // Set the stomp client
  };

  // Display incoming messages in the chat window
  const showMessage = (message) => {
    setMessages((prevMessages) => {
      // Avoid adding duplicate messages
      const messageExists = prevMessages.some(msg => msg.content === message.content && msg.sender === message.sender);
      if (!messageExists) {
        return [...prevMessages, { sender: message.sender, content: message.content }];
      }
      return prevMessages; // Don't add if message already exists
    });
  };

  // Send a message to the WebSocket
  const sendMessage = () => {
    if (stompClient && sender && message && connected) {  // Ensure connected is true
      const chatMessage = { sender, content: message };
      stompClient.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
      setMessage(''); // Clear the message input
    } else {
      console.log('Cannot send message: WebSocket is not connected or input is empty.');
    }
  };

  // Log connection status changes
  useEffect(() => {
    console.log('Connected to server:', connected);  // This will log whenever the connection status changes
  }, [connected]); // Only runs when connected changes

  useEffect(() => {
    if (!stompClient) {
      connect(); // Only establish connection once
    }
    return () => {
      if (stompClient) {
        stompClient.disconnect();    // Clean up WebSocket on unmount
      }
    };
  }, [stompClient]); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="container mt-4">
      <h2 className="text-center" style={{ color: 'red' }}>
        REAL TIME CHAT APPLICATION
      </h2>

      <div
        id="chat"
        className="border border-primary border rounded p-3 mb-3"
        style={{ height: '300px', overflowY: 'auto' }}
      >
        {messages.map((msg, index) => (
          <div key={index} className="border-bottom mb-2" style={{fontSize:'20px'}}>
            {msg.sender}: {msg.content}
          </div>
        ))}
      </div>

      <div className="input-group mb-3">
        <input
          id="senderInput"
          type="text"
          placeholder="Enter your name"
          className="form-control"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          style={{padding:'10px'}}
        />
      </div>

      <div className="input-group mb-3">
        <input
          id="messageInput"
          type="text"
          placeholder="Type message.."
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{padding:'10px'}}
        />
        <div className="input-group-append">
          <button
            id="sendMessage"
            className="btn btn-primary"
            onClick={sendMessage}
            disabled={!connected}       // Disable the button if not connected
            style={{padding:'10px'}} 
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatComp;
