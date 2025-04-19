import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  HStack,
  Icon,
  useColorModeValue,
  useDisclosure,
  Heading,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { MessageSquareIcon, SendIcon } from './Icons';

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
}

const SupportChat: React.FC = () => {
  const { t } = useTranslation(['common']);
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: t('common:supportWelcome', { defaultValue: 'How can I assist you today?' }), sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const botMessageBg = useColorModeValue('blue.100', 'blue.900');
  const userMessageBg = useColorModeValue('green.100', 'green.900');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: botResponse, sender: 'bot' }]);
    }, 500);
  };

  const generateBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return t('common:supportPrice', {
        defaultValue: 'Our prices depend on distance, item size, quantity, and workers. Start a booking to get a quote!',
      });
    }
    if (lowerInput.includes('delivery') || lowerInput.includes('service')) {
      return t('common:supportDelivery', {
        defaultValue: 'We offer fast delivery across the UK with options for 1 or 2 workers. Book now to choose your service!',
      });
    }
    if (lowerInput.includes('contact') || lowerInput.includes('support')) {
      return t('common:supportContact', {
        defaultValue: 'You can contact us at support@speedyvan.com or call +44 7901 846297.',
      });
    }
    return t('common:supportDefault', {
      defaultValue: "I'm here to help! Could you please clarify your question?",
    });
  };

  return (
    <Box position="fixed" bottom="20px" right="20px" zIndex={1000}>
      {!isOpen && (
        <Button
          colorScheme="primary"
          borderRadius="full"
          size="lg"
          onClick={onToggle}
          leftIcon={<Icon as={MessageSquareIcon} />}
        >
          {t('common:supportChat', { defaultValue: 'Chat with Support' })}
        </Button>
      )}
      {isOpen && (
        <Box
          bg={bgColor}
          w={{ base: '90vw', md: '400px' }}
          h="500px"
          borderRadius="lg"
          boxShadow="lg"
          p={4}
          display="flex"
          flexDirection="column"
        >
          <HStack justify="space-between" mb={4}>
            <Heading size="md">{t('common:supportChat', { defaultValue: 'Support Chat' })}</Heading>
            <Button size="sm" onClick={onClose}>
              {t('common:close', { defaultValue: 'Close' })}
            </Button>
          </HStack>
          <Box flex="1" overflowY="auto" mb={4}>
            {messages.map((msg) => (
              <HStack
                key={msg.id}
                justify={msg.sender === 'bot' ? 'flex-start' : 'flex-end'}
                mb={2}
              >
                <Box
                  bg={msg.sender === 'bot' ? botMessageBg : userMessageBg}
                  color={msg.sender === 'bot' ? 'blue.800' : 'green.800'}
                  p={2}
                  borderRadius="lg"
                  maxW="70%"
                >
                  <Text>{msg.text}</Text>
                </Box>
              </HStack>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          <HStack>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('common:typeMessage', { defaultValue: 'Type your message...' })}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button colorScheme="primary" onClick={handleSend}>
              <Icon as={SendIcon} />
            </Button>
          </HStack>
        </Box>
      )}
    </Box>
  );
};

export default SupportChat;
