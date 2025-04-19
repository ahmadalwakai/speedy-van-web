import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  FormControl,
  Input,
  VStack,
  Text,
  HStack,
  Select,
  Textarea,
  Checkbox,
  Icon,
  useToast,
  useColorModeValue,
  Heading,
  FormErrorMessage,
} from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiSend, FiMapPin, FiTruck, FiCalendar, FiDollarSign, FiInfo, FiPackage, FiArrowLeft, FiPhone } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import logger from '@/services/logger';
import { v4 as uuidv4 } from 'uuid';
import { loadStripe } from '@stripe/stripe-js';
import { calculatePrice, calculateDistance } from '@/utils/pricing';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

interface Item {
  type: string;
  size: string;
  quantity: number;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  pickupAddress: string;
  pickupFloor: string;
  pickupLift: boolean;
  dropoffAddress: string;
  dropoffFloor: string;
  dropoffLift: boolean;
  serviceType: string;
  description?: string;
  pickupDateTime: string;
  items: Item[];
  workers: number;
  images: File[];
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  field?: keyof FormData | `items.${number}.${string}` | 'images' | 'workers';
  value?: any;
}

const ChatOrder: React.FC = () => {
  const { t } = useTranslation(['common', 'order']);
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [items, setItems] = useState<Item[]>([{ type: '', size: '', quantity: 1 }]);
  const [images, setImages] = useState<File[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    { id: uuidv4(), text: t('order:chatFirstNamePrompt', { defaultValue: "What's your first name?" }), sender: 'bot', field: 'firstName' },
  ]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [orderId] = useState(uuidv4());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue('white', 'gray.700');
  const botMessageBg = useColorModeValue('blue.100', 'blue.900');
  const userMessageBg = useColorModeValue('green.100', 'green.900');

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setImages((prev) => [...prev, ...acceptedFiles]);
      handleUserInput(acceptedFiles.map((file) => file.name).join(', '), 'images');
    },
  });

  const fields = [
    { name: 'firstName', prompt: t('order:chatFirstNamePrompt', { defaultValue: "What's your first name?" }) },
    { name: 'lastName', prompt: t('order:chatLastNamePrompt', { defaultValue: "What's your last name?" }) },
    { name: 'phoneNumber', prompt: t('order:chatPhoneNumberPrompt', { defaultValue: "What's your phone number?" }) },
    { name: 'email', prompt: t('order:chatEmailPrompt', { defaultValue: "What's your email address?" }) },
    { name: 'pickupAddress', prompt: t('order:chatPickupAddressPrompt', { defaultValue: "What's the pickup address?" }) },
    { name: 'pickupFloor', prompt: t('order:chatPickupFloorPrompt', { defaultValue: "Which floor is the pickup on?" }) },
    { name: 'pickupLift', prompt: t('order:chatPickupLiftPrompt', { defaultValue: "Is there a lift available at pickup?" }) },
    { name: 'dropoffAddress', prompt: t('order:chatDropoffAddressPrompt', { defaultValue: "What's the dropoff address?" }) },
    { name: 'dropoffFloor', prompt: t('order:chatDropoffFloorPrompt', { defaultValue: "Which floor is the dropoff on?" }) },
    { name: 'dropoffLift', prompt: t('order:chatDropoffLiftPrompt', { defaultValue: "Is there a lift available at dropoff?" }) },
    { name: 'serviceType', prompt: t('order:chatServiceTypePrompt', { defaultValue: "What type of service do you need?" }) },
    { name: 'pickupDateTime', prompt: t('order:chatPickupDateTimePrompt', { defaultValue: "When should we pick up?" }) },
    { name: 'workers', prompt: t('order:chatWorkersPrompt', { defaultValue: "How many workers do you need?" }) },
    { name: 'description', prompt: t('order:chatDescriptionPrompt', { defaultValue: "Any additional details?" }) },
    { name: 'items.0.type', prompt: t('order:chatItemTypePrompt', { defaultValue: "What item would you like to add?" }) },
    { name: 'items.0.size', prompt: t('order:chatItemSizePrompt', { defaultValue: "What's the size of the item?" }) },
    { name: 'items.0.quantity', prompt: t('order:chatItemQuantityPrompt', { defaultValue: "How many of this item?" }) },
    { name: 'images', prompt: t('order:chatImagesPrompt', { defaultValue: "Please upload images of the items (optional)." }) },
  ];

  const schema = yup.object().shape({
    firstName: yup
      .string()
      .matches(/^[A-Za-z\s]+$/, t('order:invalidFirstName'))
      .min(2, t('order:firstNameMin'))
      .max(50, t('order:firstNameMax'))
      .required(t('order:firstNameRequired')),
    lastName: yup
      .string()
      .matches(/^[A-Za-z\s]+$/, t('order:invalidLastName'))
      .min(2, t('order:lastNameMin'))
      .max(50, t('order:lastNameMax'))
      .required(t('order:lastNameRequired')),
    phoneNumber: yup
      .string()
      .matches(/^(\+44|0)7\d{9}$/, t('order:invalidPhoneNumber'))
      .required(t('order:phoneNumberRequired')),
    email: yup
      .string()
      .email(t('order:invalidEmail'))
      .required(t('order:emailRequired')),
    pickupAddress: yup.string().required(t('order:pickupAddressRequired')),
    pickupFloor: yup.string().required(t('order:pickupFloorRequired')),
    pickupLift: yup.boolean().default(false),
    dropoffAddress: yup.string().required(t('order:dropoffAddressRequired')),
    dropoffFloor: yup.string().required(t('order:dropoffFloorRequired')),
    dropoffLift: yup.boolean().default(false),
    serviceType: yup.string().required(t('order:serviceTypeRequired')),
    description: yup.string().optional(),
    pickupDateTime: yup.string().required(t('order:pickupDateTimeRequired')),
    workers: yup.number().min(1, t('order:workersMin')).required(t('order:workersRequired')),
    items: yup
      .array()
      .of(
        yup.object().shape({
          type: yup.string().required(t('order:itemTypeRequired')),
          size: yup.string().required(t('order:itemSizeRequired')),
          quantity: yup.number().min(1, t('order:quantityMin')).required(t('order:quantityRequired')),
        })
      )
      .min(1, t('order:itemsRequired')),
    images: yup.array().of(yup.mixed()).optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    getValues,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      pickupAddress: '',
      pickupFloor: '',
      pickupLift: false,
      dropoffAddress: '',
      dropoffFloor: '',
      dropoffLift: false,
      serviceType: '',
      description: '',
      pickupDateTime: '',
      items: [{ type: '', size: '', quantity: 1 }],
      workers: 1,
      images: [],
    },
  });

  const formItems = watch('items') || [];
  const pickupAddress = watch('pickupAddress');
  const dropoffAddress = watch('dropoffAddress');
  const workers = watch('workers');

  // إعداد التعبئة التلقائية للعناوين باستخدام Google Places API
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google) {
      const pickupInput = document.getElementById('pickupAddress') as HTMLInputElement;
      const dropoffInput = document.getElementById('dropoffAddress') as HTMLInputElement;

      const autocompletePickup = new window.google.maps.places.Autocomplete(pickupInput, {
        types: ['address'],
        componentRestrictions: { country: 'uk' },
      });
      const autocompleteDropoff = new window.google.maps.places.Autocomplete(dropoffInput, {
        types: ['address'],
        componentRestrictions: { country: 'uk' },
      });

      autocompletePickup.addListener('place_changed', () => {
        const place = autocompletePickup.getPlace();
        if (place.formatted_address) {
          setValue('pickupAddress', place.formatted_address);
          handleUserInput(place.formatted_address, 'pickupAddress');
        }
      });

      autocompleteDropoff.addListener('place_changed', () => {
        const place = autocompleteDropoff.getPlace();
        if (place.formatted_address) {
          setValue('dropoffAddress', place.formatted_address);
          handleUserInput(place.formatted_address, 'dropoffAddress');
        }
      });
    }
  }, [setValue]);

  // حساب السعر التقريبي
  useEffect(() => {
    const calculate = async () => {
      try {
        if (pickupAddress && dropoffAddress && formItems.every(item => item.type && item.size)) {
          const distance = await calculateDistance(pickupAddress, dropoffAddress);
          const price = await calculatePrice({ distance, items: formItems, workers });
          setTotalPrice(price);
        } else {
          setTotalPrice(0);
        }
      } catch (error) {
        console.error('Error in price calculation:', error);
        toast({
          title: t('order:errorMessage'),
          description: 'Failed to calculate price.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    calculate();
  }, [pickupAddress, dropoffAddress, formItems, workers, toast, t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserInput = async (value: any, field: keyof FormData | `items.${number}.${string}` | 'images' | 'workers') => {
    try {
      if (field.includes('items')) {
        const [_, index, subField] = field.split('.');
        const newItems = [...items];
        newItems[Number(index)] = { ...newItems[Number(index)], [subField]: subField === 'quantity' ? Number(value) : value };
        setItems(newItems);
        setValue(`items.${index}.${subField}` as any, subField === 'quantity' ? Number(value) : value);
      } else if (field === 'images') {
        setValue('images', images);
      } else {
        setValue(field as keyof FormData, value);
      }

      setMessages((prev) => [
        ...prev,
        { id: uuidv4(), text: String(value), sender: 'user', field, value },
      ]);

      const fieldErrors = await (async () => {
        if (field.includes('items')) {
          return (errors.items?.[Number(field.split('.')[1])]?.[field.split('.')[2] as keyof Item] as FieldError)?.message;
        }
        return (errors[field as keyof FormData] as FieldError)?.message;
      })();

      if (fieldErrors) {
        setMessages((prev) => [
          ...prev,
          { id: uuidv4(), text: fieldErrors, sender: 'bot', field },
        ]);
        return;
      }

      if (currentFieldIndex < fields.length - 1) {
        const nextField = fields[currentFieldIndex + 1];
        setMessages((prev) => [
          ...prev,
          { id: uuidv4(), text: nextField.prompt, sender: 'bot', field: nextField.name },
        ]);
        setCurrentFieldIndex(currentFieldIndex + 1);
      } else if (field === `items.${items.length - 1}.quantity`) {
        const newItems = [...items, { type: '', size: '', quantity: 1 }];
        setItems(newItems);
        setValue('items', newItems);
        setMessages((prev) => [
          ...prev,
          { id: uuidv4(), text: t('order:chatAddAnotherItem', { defaultValue: "Would you like to add another item?" }), sender: 'bot' },
        ]);
      }
    } catch (error) {
      console.error('Error handling input:', error);
      toast({
        title: t('order:errorMessage'),
        description: 'Failed to process input.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddAnotherItem = () => {
    const newIndex = items.length - 1;
    setMessages((prev) => [
      ...prev,
      { id: uuidv4(), text: t('order:chatItemTypePrompt'), sender: 'bot', field: `items.${newIndex}.type` },
    ]);
    setCurrentFieldIndex(fields.findIndex(f => f.name === `items.${newIndex}.type`));
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized');
      }

      const data = getValues();
      const orderData = {
        ...data,
        totalPrice,
        locale: router.locale,
        items,
        images: images.map(file => file.name),
      };

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalPrice * 100,
          currency: 'gbp',
          orderData,
        }),
      });

      const session = await response.json();
      if (!response.ok) {
        throw new Error(session.message || 'Failed to create checkout session');
      }

      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      logger.error(`Payment error: ${(error as Error).message}`);
      toast({
        title: t('order:paymentError'),
        description: (error as Error).message || 'Payment failed. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const orderData = {
        ...data,
        totalPrice,
        locale: router.locale,
        items,
        images: images.map(file => file.name),
      };
      console.log('Order submitted:', orderData);
      logger.info('Order submitted:', orderData);

      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      await handlePayment();

      // إرسال تأكيدات
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      // إعادة توجيه إلى صفحة التقييم
      router.push('/rating');
    } catch (error) {
      console.error('Order submission error:', error);
      logger.error(`Order error: ${(error as Error).message}`);
      toast({
        title: t('order:errorMessage'),
        description: 'Failed to submit order.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };

  // التعامل مع الأسئلة العامة
  const handleGeneralQuestion = (input: string) => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('price') || lowerInput.includes('cost')) {
      return t('order:supportPrice', {
        defaultValue: 'Our prices depend on distance, item size, quantity, and workers. Continue with your booking to get a quote!',
      });
    }
    if (lowerInput.includes('delivery') || lowerInput.includes('service')) {
      return t('order:supportDelivery', {
        defaultValue: 'We offer fast delivery across the UK with options for 1 or 2 workers. Continue to choose your service!',
      });
    }
    if (lowerInput.includes('contact') || lowerInput.includes('support')) {
      return t('order:supportContact', {
        defaultValue: 'You can contact us at support@speedyvan.com or call +44 7901 846297.',
      });
    }
    return t('order:supportDefault', {
      defaultValue: "I'm here to help! Could you please clarify your question or continue with the booking?",
    });
  };

  return (
    <Box minH="100vh" p={4} bg={bgColor} dir={router.locale === 'ar' ? 'rtl' : 'ltr'}>
      <Button
        as="a"
        href="tel:+447901846297"
        colorScheme="blue"
        leftIcon={<FiPhone />}
        mb={4}
      >
        {t('common:contactUs', { defaultValue: 'Contact Us on 07901846297' })}
      </Button>
      <Button
        leftIcon={<FiArrowLeft />}
        onClick={() => router.push('/')}
        variant="outline"
        colorScheme="blue"
        mb={4}
        alignSelf={router.locale === 'ar' ? 'flex-end' : 'flex-start'}
      >
        {t('common:back', { defaultValue: 'Back' })}
      </Button>
      <VStack spacing={8} maxW="md" mx="auto">
        <Heading size="lg" color="text.primary">
          {t('order:chatOrderTitle', { defaultValue: 'Chat to Book Your Delivery' })}
        </Heading>
        <Box
          w="full"
          h="60vh"
          bg={bgColor}
          borderRadius="lg"
          boxShadow="md"
          p={4}
          overflowY="auto"
          css={{
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: '#f1f1f1' },
            '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '4px' },
          }}
        >
          {messages.map((msg) => (
            <HStack
              key={msg.id}
              justify={msg.sender === 'bot' ? 'flex-start' : 'flex-end'}
              mb={4}
            >
              <Box
                bg={msg.sender === 'bot' ? botMessageBg : userMessageBg}
                color={msg.sender === 'bot' ? 'blue.800' : 'green.800'}
                p={3}
                borderRadius="lg"
                maxW="70%"
              >
                <Text>{msg.text}</Text>
              </Box>
            </HStack>
          ))}
          <div ref={messagesEndRef} />
        </Box>
        {currentFieldIndex < fields.length && (
          <FormControl isInvalid={!!errors[fields[currentFieldIndex].name as keyof FormData]}>
            {fields[currentFieldIndex].name.includes('items') ? (
              fields[currentFieldIndex].name.includes('.type') ? (
                <Select
                  placeholder={t('order:itemTypePlaceholder')}
                  onChange={(e) => handleUserInput(e.target.value, fields[currentFieldIndex].name as `items.${number}.${string}`)}
                  bg="white"
                  borderRadius="lg"
                >
                  <option value="chair">{t('order:chair')}</option>
                  <option value="bed">{t('order:bed')}</option>
                  <option value="box">{t('order:box')}</option>
                  <option value="fridge">{t('order:fridge')}</option>
                  <option value="washingMachine">{t('order:washingMachine')}</option>
                  <option value="tv">{t('order:tv')}</option>
                  <option value="fan">{t('order:fan')}</option>
                  <option value="sofa">{t('order:sofa')}</option>
                </Select>
              ) : fields[currentFieldIndex].name.includes('.size') ? (
                <Select
                  placeholder={t('order:itemSizePlaceholder')}
                  onChange={(e) => handleUserInput(e.target.value, fields[currentFieldIndex].name as `items.${number}.${string}`)}
                  bg="white"
                  borderRadius="lg"
                >
                  <option value="small">{t('order:small')}</option>
                  <option value="medium">{t('order:medium')}</option>
                  <option value="large">{t('order:large')}</option>
                  <option value="x-large">{t('order:xLarge')}</option>
                </Select>
              ) : (
                <Input
                  type="number"
                  placeholder={t('order:quantityPlaceholder')}
                  min={1}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleUserInput(e.currentTarget.value, fields[currentFieldIndex].name as `items.${number}.${string}`);
                    }
                  }}
                  bg="white"
                  borderRadius="lg"
                />
              )
            ) : fields[currentFieldIndex].name === 'pickupLift' || fields[currentFieldIndex].name === 'dropoffLift' ? (
              <Checkbox
                onChange={(e) => handleUserInput(e.target.checked, fields[currentFieldIndex].name as keyof FormData)}
                colorScheme="blue"
              >
                {t('order:liftYes')}
              </Checkbox>
            ) : fields[currentFieldIndex].name === 'serviceType' ? (
              <Select
                placeholder={t('order:serviceTypePlaceholder')}
                onChange={(e) => handleUserInput(e.target.value, fields[currentFieldIndex].name as keyof FormData)}
                bg="white"
                borderRadius="lg"
              >
                <option value="manWithVan">{t('order:manWithVan')}</option>
                <option value="twoMenWithVan">{t('order:twoMenWithVan')}</option>
              </Select>
            ) : fields[currentFieldIndex].name === 'pickupDateTime' ? (
              <Input
                type="datetime-local"
                onChange={(e) => handleUserInput(e.target.value, fields[currentFieldIndex].name as keyof FormData)}
                min={new Date().toISOString().slice(0, 16)}
                bg="white"
                borderRadius="lg"
              />
            ) : fields[currentFieldIndex].name === 'description' ? (
              <Textarea
                placeholder={t('order:descriptionPlaceholder')}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleUserInput(e.currentTarget.value, fields[currentFieldIndex].name as keyof FormData);
                  }
                }}
                bg="white"
                borderRadius="lg"
              />
            ) : fields[currentFieldIndex].name === 'images' ? (
              <Box {...getRootProps()} p={4} border="2px dashed" borderColor="gray.300" borderRadius="lg" textAlign="center">
                <input {...getInputProps()} />
                <Text>{t('order:dropImages', { defaultValue: 'Drag & drop images here, or click to select files' })}</Text>
              </Box>
            ) : fields[currentFieldIndex].name === 'workers' ? (
              <Select
                placeholder={t('order:workersPlaceholder', { defaultValue: 'Select number of workers' })}
                onChange={(e) => handleUserInput(Number(e.target.value), 'workers')}
                bg="white"
                borderRadius="lg"
              >
                <option value={1}>1 {t('order:worker')}</option>
                <option value={2}>2 {t('order:workers')}</option>
              </Select>
            ) : (
              <Input
                id={fields[currentFieldIndex].name}
                placeholder={t(`order:${fields[currentFieldIndex].name}Placeholder`)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleUserInput(e.currentTarget.value, fields[currentFieldIndex].name as keyof FormData);
                  }
                }}
                bg="white"
                borderRadius="lg"
              />
            )}
            <FormErrorMessage>{(errors[fields[currentFieldIndex].name as keyof FormData] as FieldError)?.message}</FormErrorMessage>
          </FormControl>
        )}
        {currentFieldIndex >= fields.length && (
          <>
            <Button
              colorScheme="blue"
              leftIcon={<FiPackage />}
              onClick={handleAddAnotherItem}
            >
              {t('order:addItem')}
            </Button>
            <Box w="full" textAlign="center">
              <Text fontSize="xl" fontWeight="bold" color="text.primary" mb={4}>
                {t('order:totalPrice')}: £{totalPrice.toFixed(2)}
              </Text>
              <Button
                colorScheme="blue"
                size="lg"
                onClick={handleSubmit(onSubmit)}
                isDisabled={isLoading || totalPrice === 0}
                isLoading={isLoading}
                loadingText={t('order:processing')}
              >
                {t('order:proceedToPayment')}
              </Button>
            </Box>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ChatOrder;