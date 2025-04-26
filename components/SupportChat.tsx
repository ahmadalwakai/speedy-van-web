import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box, Button, Input, VStack, Text, HStack, Avatar, useColorModeValue,
  Heading, Icon, Progress, useToast
} from '@chakra-ui/react';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import axios from 'axios';
import { AttachmentIcon } from '@chakra-ui/icons';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  attachmentUrl?: string;
}

const SupportChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.700');
  const botMessageBg = useColorModeValue('blue.50', 'blue.900');
  const userMessageBg = useColorModeValue('green.100', 'green.900');

  const saveMessage = async (msg: Message) => {
    if (!sessionId) return;
    try {
      await addDoc(collection(db, 'chatSessions', sessionId, 'messages'), {
        ...msg,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const botReply = useCallback((text: string) => {
    const botMsg: Message = { id: Date.now().toString(), text, sender: 'bot' };
    saveMessage(botMsg);
    setMessages(prev => [...prev, botMsg]);
  }, [saveMessage]);

  const initChatSession = useCallback(async () => {
    try {
      const sessionRef = await addDoc(collection(db, 'chatSessions'), {
        startedAt: serverTimestamp(),
        status: 'active',
        anonymous: true
      });
      setSessionId(sessionRef.id);
      botReply(`👋 Hi! I'm **SpeedyBot** 🤖, your assistant. How can I help you today?\n\n💡 Common Questions:\n- How do I book a delivery?\n- What are your working hours?\n- How is the price calculated?`);
    } catch (error) {
      console.error("Chat initialization error:", error);
      toast({
        title: "Chat Unavailable",
        description: "Our chat service is currently unavailable. Please try again later or contact support directly.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsOpen(false);
    }
  }, [toast, botReply]);

  useEffect(() => {
    if (isOpen && !sessionId) {
      initChatSession();
    }
  }, [isOpen, initChatSession, sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !sessionId) return;
    const cleanedInput = input.toLowerCase().trim();

    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    await saveMessage(userMsg);
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    await processBotReply(cleanedInput);
  };

  const processBotReply = async (cleaned: string) => {
    const faqReplies: Record<string, string> = {
      'how do i book a delivery': '🚀 You can book via our website using the booking form or smart chat!',
      'what are your working hours': '⏰ We operate 24/7 to serve you anytime across the UK!',
      'how is the price calculated': '💡 Pricing depends on distance, item size, and number of workers.'
    };

    if (cleaned === 'agent') {
      botReply("✅ A human agent will be with you shortly...");
      await updateDoc(doc(db, 'chatSessions', sessionId!), { status: 'waiting_for_agent' });
      return;
    }

    if (faqReplies[cleaned]) {
      botReply(faqReplies[cleaned]);
    } else if (['start booking', 'get quote', 'contact support'].includes(cleaned)) {
      handleQuickActions(cleaned);
    } else {
      try {
        const res = await axios.post('/api/ai-chat', { message: cleaned });
        botReply(res.data.reply || "🤖 I'm still learning! You can email support@speedyvan.com.");
      } catch (error) {
        botReply("🤖 Sorry, I'm having trouble connecting to the AI service. Please try again or email support@speedyvan.com.");
      }
    }

    if (!['start booking', 'get quote', 'contact support', 'agent'].includes(cleaned)) {
      botReply("⚡ Quick Commands:\n- Start Booking\n- Get Quote\n- Contact Support");
    }
  };

  const handleQuickActions = (command: string) => {
    switch (command) {
      case 'start booking':
        botReply("🔗 Redirecting you to booking page...");
        window.location.href = '/book-order';
        break;
      case 'get quote':
        botReply("💡 To get a quote, start a booking and enter your details for an instant price.");
        break;
      case 'contact support':
        botReply("📞 You can reach us at support@speedyvan.com or call +44 7901 846297.");
        break;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !sessionId) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `chatAttachments/${sessionId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const userMsg: Message = { id: Date.now().toString(), text: '📎 Sent an attachment', sender: 'user', attachmentUrl: url };
      await saveMessage(userMsg);
      setMessages(prev => [...prev, userMsg]);
    } catch (error) {
      botReply("❌ Failed to upload attachment. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleEndChat = async () => {
    botReply("🙏 Thank you for chatting with SpeedyBot! Session closed.");
    if (sessionId) {
      try {
        await updateDoc(doc(db, 'chatSessions', sessionId), { 
          status: 'closed', 
          endedAt: serverTimestamp() 
        });
      } catch (error) {
        console.error("Error closing session:", error);
      }
    }
    setTimeout(() => {
      setIsOpen(false);
      setMessages([]);
      setSessionId(null);
      setIsMinimized(false);
    }, 1500);
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex={1000}>
      {!isOpen && (
        <Button 
          colorScheme="blue" 
          borderRadius="full" 
          size="lg" 
          onClick={() => setIsOpen(true)}
        >
          💬 Chat with SpeedyBot
        </Button>
      )}
      {isOpen && (
        <Box bg={bgColor} w={{ base: '90vw', md: '400px' }} h={isMinimized ? "60px" : "500px"} borderRadius="lg" boxShadow="lg" p={4} display="flex" flexDirection="column">
          <HStack justify="space-between" mb={2}>
            <Heading size="md">SpeedyBot 🤖</Heading>
            <HStack>
              <Button size="sm" variant="ghost" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? '🔼' : '🔽'}
              </Button>
              <Button size="sm" onClick={handleEndChat}>End</Button>
            </HStack>
          </HStack>
          {!isMinimized && (
            <>
              <Box flex="1" overflowY="auto" mb={4}>
                {messages.map((msg) => (
                  <HStack key={msg.id} justify={msg.sender === 'bot' ? 'flex-start' : 'flex-end'} mb={2}>
                    {msg.sender === 'bot' && <Avatar size="sm" name="SpeedyBot" src="/bot-icon.png" />}
                    <Box bg={msg.sender === 'bot' ? botMessageBg : userMessageBg} p={2} borderRadius="lg" maxW="70%">
                      <Text whiteSpace="pre-line">{msg.text}</Text>
                      {msg.attachmentUrl && (
                        <a href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">
                          <Text fontSize="sm" color="blue.300">📎 View Attachment</Text>
                        </a>
                      )}
                    </Box>
                  </HStack>
                ))}
                {uploading && <Progress size="xs" isIndeterminate colorScheme="blue" />}
                <div ref={messagesEndRef} />
              </Box>
              <HStack>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button as="label" cursor="pointer">
                  <Icon as={AttachmentIcon} />
                  <Input type="file" hidden onChange={handleFileUpload} />
                </Button>
                <Button colorScheme="blue" onClick={handleSend}>Send</Button>
              </HStack>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SupportChat;