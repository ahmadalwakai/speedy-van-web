import React from 'react';
import {
  Box,
  Heading,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  useColorModeValue,
  Container,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { FiHelpCircle, FiMapPin, FiDollarSign, FiSearch, FiMessageSquare } from 'react-icons/fi';
import NextLink from 'next/link';

const MotionBox = motion(Box);
const MotionAccordionPanel = motion(AccordionPanel);

const FAQ: React.FC = () => {
  const { t } = useTranslation('home');
  const shouldReduceMotion = useReducedMotion();

  const generalFaqs = [
    {
      question: t('faq1Question', { defaultValue: 'How do I book a delivery?' }),
      answer: t('faq1Answer', { defaultValue: 'Use our standard form or smart chat to book instantly.' }),
      icon: <FiHelpCircle />
    },
    {
      question: t('faq2Question', { defaultValue: 'What areas do you cover?' }),
      answer: t('faq2Answer', { defaultValue: 'We deliver across the entire UK.' }),
      icon: <FiMapPin />
    },
    {
      question: t('faq3Question', { defaultValue: 'How is the price calculated?' }),
      answer: t('faq3Answer', { defaultValue: 'Prices are based on distance, item size, quantity, and number of workers.' }),
      icon: <FiDollarSign />
    },
  ];

  const paymentFaqs = [
    {
      question: t('faq4Question', { defaultValue: 'What payment methods do you accept?' }),
      answer: t('faq4Answer', { defaultValue: 'We accept all major credit cards, PayPal, and bank transfers.' }),
      icon: <FiDollarSign />
    }
  ];

  const variants: Variants = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : { 
        hidden: { opacity: 0, y: 30 }, 
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { 
            duration: 0.6,
            staggerChildren: 0.1
          } 
        } 
      };

  const panelVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const expandedBg = useColorModeValue('blue.100', 'blue.600');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Implement search functionality
    console.log('Searching for:', e.target.value);
  };

  const openChat = () => {
    // Implement chat functionality
    console.log('Opening chat...');
  };

  return (
    <MotionBox
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      bg={bgColor}
      py={{ base: 12, md: 20 }}
      px={{ base: 4, md: 8 }}
    >
      <Container maxW="5xl">
        <Heading size="lg" textAlign="center" mb={4} color={headingColor}>
          {t('faqTitle', { defaultValue: 'Frequently Asked Questions' })}
        </Heading>
        <Text textAlign="center" color={textColor} mb={10}>
          {t('faqSubtitle', { defaultValue: 'Here are some common questions about our services.' })}
        </Text>

        <InputGroup mb={8} maxW="md" mx="auto">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input 
            placeholder={t('searchFAQ', { defaultValue: 'Search FAQs...' })}
            onChange={handleSearch}
          />
        </InputGroup>

        <Tabs variant="soft-rounded" colorScheme="blue" isFitted>
          <TabList mb={6}>
            <Tab>{t('general', { defaultValue: 'General' })}</Tab>
            <Tab>{t('payments', { defaultValue: 'Payments' })}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Accordion allowToggle>
                {generalFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    border="1px solid" 
                    borderColor={useColorModeValue('gray.200', 'gray.700')} 
                    borderRadius="md" 
                    mb={4}
                  >
                    <AccordionButton 
                      _hover={{ bg: hoverBg }}
                      _expanded={{ bg: expandedBg, color: 'white' }}
                      p={{ base: 4, md: 6 }}
                    >
                      <Box as="span" mr={3}>{faq.icon}</Box>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <MotionAccordionPanel 
                      pb={4} 
                      color={textColor}
                      variants={panelVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                      {index === 0 && (
                        <Box mt={2}>
                          <NextLink href="/pricing-policy" passHref>
                            <Text as="a" color="blue.400" fontSize="sm">
                              {t('viewPricingPolicy', { defaultValue: 'View Pricing Policy' })}
                            </Text>
                          </NextLink>
                        </Box>
                      )}
                    </MotionAccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabPanel>

            <TabPanel p={0}>
              <Accordion allowToggle>
                {paymentFaqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    border="1px solid" 
                    borderColor={useColorModeValue('gray.200', 'gray.700')} 
                    borderRadius="md" 
                    mb={4}
                  >
                    <AccordionButton 
                      _hover={{ bg: hoverBg }}
                      _expanded={{ bg: expandedBg, color: 'white' }}
                      p={{ base: 4, md: 6 }}
                    >
                      <Box as="span" mr={3}>{faq.icon}</Box>
                      <Box flex="1" textAlign="left" fontWeight="semibold">
                        {faq.question}
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <MotionAccordionPanel 
                      pb={4} 
                      color={textColor}
                      variants={panelVariants}
                      initial="hidden"
                      animate="visible"
                      transition={{ duration: 0.3 }}
                    >
                      {faq.answer}
                    </MotionAccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Box textAlign="center" mt={10}>
          <Text color={textColor} mb={4}>
            {t('faqMore', { defaultValue: "Didn't find what you're looking for?" })}
          </Text>
          <Button 
            colorScheme="blue" 
            variant="outline" 
            mr={4}
            as={NextLink}
            href="/contact"
          >
            {t('contactSupport', { defaultValue: "Contact Support" })}
          </Button>
          <Button 
            colorScheme="teal" 
            leftIcon={<FiMessageSquare />}
            onClick={openChat}
          >
            {t('askUsDirectly', { defaultValue: 'Ask Us Directly' })}
          </Button>
        </Box>
      </Container>
    </MotionBox>
  );
};

export default FAQ;