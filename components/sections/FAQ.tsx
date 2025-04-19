import React from 'react';
import { Box, Heading, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { motion, useReducedMotion } from 'framer-motion';

const FAQ: React.FC = () => {
  const { t } = useTranslation(['home']);
  const shouldReduceMotion = useReducedMotion();

  const faqs = [
    {
      question: t('home:faq1Question', { defaultValue: 'How do I book a delivery?' }),
      answer: t('home:faq1Answer', { defaultValue: 'Use our standard form or smart chat to book instantly.' }),
    },
    {
      question: t('home:faq2Question', { defaultValue: 'What areas do you cover?' }),
      answer: t('home:faq2Answer', { defaultValue: 'We deliver across the entire UK.' }),
    },
    {
      question: t('home:faq3Question', { defaultValue: 'How is the price calculated?' }),
      answer: t('home:faq3Answer', { defaultValue: 'Prices are based on distance, item size, quantity, and number of workers.' }),
    },
  ];

  const variants = shouldReduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
      };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={variants}
      style={{ scrollSnapAlign: 'start' }}
    >
      <Box py={{ base: 12, md: 20 }} px={{ base: 4, md: 8 }}>
        <Heading size="lg" textAlign="center" mb={10} color="text.primary">
          {t('home:faqTitle', { defaultValue: 'Frequently Asked Questions' })}
        </Heading>
        <Accordion allowToggle maxW="3xl" mx="auto">
          {faqs.map((faq, index) => (
            <AccordionItem key={index}>
              <AccordionButton>
                <Box flex="1" textAlign="left" color="text.primary">
                  {faq.question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4} color="text.secondary">
                {faq.answer}
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>
    </motion.div>
  );
};

export default FAQ;