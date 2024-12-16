import React, { useEffect, useRef, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';


const ChatComponentAlter = () => {

    //defining the state variable and setters
    const [content, setContent] = useState('');
    const [sender, setSender] = useState('');
    const [messages, setMessages] = useState([]);
    const [recipient,setRecipient] = useState('');

    //Foe the active user tab

    //defining the websocket variable
    const stompClient = useRef(null);
    const [connected, setConnected] = useState(false);

    // To track if we have already subscribed to the WebSocket
    const isSubscribed = useRef(false);

        // To track if we have already subscribed to the WebSocket
      const isJoined = useRef(false);

     // reference to the message container
     const messagesEndRef = useRef(null);

    //Connection status
    const setConnectionStatus = (status) => {
        setConnected(status);
    }

    //Connect
    const connect = () => {
        const socket = new SockJS('http://localhost:8080/chat');
        stompClient.current = Stomp.over(socket);

        stompClient.current.connect({}, (frame) => {
            console.log("Connected : ", frame);  //frame (Contains connectio data)
            setConnectionStatus(true);       //Set Connection

            // Subscribe to the group only once
            if (!isSubscribed.current) {
                stompClient.current.subscribe("/topic/messages", (msge) => {
                    console.log("Received Message : " + msge);
                    showMessage(msge);
                });
    
                // Subscribe to private messages (queue for the current user)
                // stompClient.current.subscribe("/user/queue/private", (msge) => {
                //     console.log("Received Message : " + msge);
                //     showMessage(msge);
                // });
                isSubscribed.current = true;  // Mark as subscribe
            }

            // Send JOIN message when user connects
            if (sender) {
                const joinMessage = { sender, status: 'JOIN' }; // Send JOIN status
                stompClient.current.send('/app/sendMessage', {}, JSON.stringify(joinMessage));
            }

        }, (error) => {
            console.error("Web Socket Connection Error:", error);
            setConnectionStatus(false);
        })
    }

    //Send Message
    const sendMessage = () => {
     
        if (stompClient.current && sender && content && connected) {
            const chatMessage = { sender, content, status: 'MESSAGE'};
            stompClient.current.send('/app/sendMessage', {}, JSON.stringify(chatMessage));
            setContent('');
        }
        else {
            console.log('Cannot send message: WebSocket is not connected or input is empty.');
        }
    }


    //Show Message
    const showMessage = (msge) => {
        const messageBody = JSON.parse(msge.body);

        setMessages((previousMessages) => {
            return [...previousMessages, messageBody];
        })

        if (messageBody.status === 'JOIN') {
            console.log(`${messageBody.sender} joined the chat.`);
        }
        else if (messageBody.status === 'LEAVE') {
            console.log(`${messageBody.sender} left the chat.`);
        }
    }


    useEffect(() => {
        connect();

        return () => {
            // Clean up WebSocket connection only if connected
            if (stompClient.current && connected && sender) {
                // Send LEAVE message when the user disconnects
                const leaveMessage = { sender, status: 'LEAVE' };
                stompClient.current.send('/app/sendMessage', {}, JSON.stringify(leaveMessage));

                stompClient.current.disconnect(() => {
                    console.log('Disconnected');
                });
            }
        };
    }, [connected]);

    // Scroll to the bottom whenever messages change
    useEffect(() => {
      // Scroll to the bottom of the messages container
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

    // useEffect(() => {
    //     setMessages([{
    //         sender: 'John',
    //         message: 'Hello'
    //     },
    //     {
    //         sender: 'Max',
    //         message: 'Hello John, How are you?'
    //     }
    //     ])

    // }, []);

    return (
        <div className='container'>
            <h2 className='text-center mt-3' style={{ color: 'red' }}>Chat Application - Real Time</h2>

            <div className='border border-rounded border-primary mt-3' style={{ height: '500px',scrollMarginTop:'overflow-scroll'}}>

                {messages.map((msg, index) => (
                    <div key={index} className='mt-3' style={{ fontSize: '20px', marginLeft: '10px' }}>
                        {msg.status === 'JOIN' && <div style={{ color: 'green' }}>{msg.sender} has joined the chat.</div>}
                        {msg.status === 'LEAVE' && <div style={{ color: 'red' }}>{msg.sender} has left the chat.</div>}
                        {msg.status === 'MESSAGE' && <div>{msg.sender}: {msg.content}</div>}
                    </div>
                ))}
            </div>

            <div className='mt-3'>
                <div className='input-group mb-3' style={{ height: '50px' }}>
                    <input type='text'
                        placeholder='Enter your name...'
                        name='sender'
                        value={sender}
                        className='form-control'
                        onChange={(e) => setSender(e.target.value)}
                    >
                    </input>
                </div>


                <div className='input-group mb-3' style={{ height: '50px' }}>
                    <input type='text'
                        placeholder='Type your message...'
                        name='content'
                        value={content}
                        className='form-control'
                        onChange={(e) => setContent(e.target.value)}
                    >
                    </input>
                    <button className='btn btn-primary' onClick={sendMessage} style={{ width: '100px' }}>Send</button>
                </div>
            </div>

        </div>
    )
}

export default ChatComponentAlter