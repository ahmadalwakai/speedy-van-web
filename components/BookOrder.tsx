import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Select,
  Checkbox,
  useToast,
  useColorModeValue,
  Heading,
  FormErrorMessage,
  SimpleGrid,
  Textarea,
  Stepper,
  Step,
  StepIndicator,
  StepStatus,
  StepTitle,
  StepDescription,
  StepSeparator,
  Flex,
} from '@chakra-ui/react';
import { useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { FiArrowLeft, FiPhone, FiPackage } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone';
import logger from '@/services/logger';
import { v4 as uuidv4 } from 'uuid';
import { loadStripe } from '@stripe/stripe-js';
import { OrderStatusBadge } from './OrderStatus';
import debounce from 'lodash/debounce';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// حل مشكلة useLayoutEffect في SSR
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

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
  status: string;
  coupon?: string;
}

const handleError = (toast: any, logger: any, title: string, description: string, status: 'error' | 'warning' = 'error') => {
  logger.error(`${title}: ${description}`);
  toast({
    title,
    description,
    status,
    duration: 5000,
    isClosable: true,
  });
};

const ItemsList: React.FC<{
  items: Item[];
  errors: any;
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  setValue: any;
  t: any;
}> = ({ items, errors, setItems, setValue, t }) => {
  const handleAddItem = () => {
    const newItems = [...items, { type: '', size: '', quantity: 1 }];
    setItems(newItems);
    setValue('items', newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    setValue('items', newItems);
  };

  const handleItemChange = (index: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    setValue('items', newItems);
  };

  return (
    <Box w="full">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        {t('order:items')}
      </Text>
      {items.map((item, index) => (
        <SimpleGrid key={index} columns={{ base: 1, md: 4 }} spacing={4} mb={4}>
          <FormControl isInvalid={!!errors.items?.[index]?.type}>
            <FormLabel>{t('order:itemType')}</FormLabel>
            <Select
              value={item.type}
              onChange={(e) => handleItemChange(index, 'type', e.target.value)}
              placeholder={t('order:itemTypePlaceholder')}
              aria-label={t('order:itemType')}
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
            <FormErrorMessage>{errors.items?.[index]?.type?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.items?.[index]?.size}>
            <FormLabel>{t('order:itemSize')}</FormLabel>
            <Select
              value={item.size}
              onChange={(e) => handleItemChange(index, 'size', e.target.value)}
              placeholder={t('order:itemSizePlaceholder')}
              aria-label={t('order:itemSize')}
            >
              <option value="small">{t('order:small')}</option>
              <option value="medium">{t('order:medium')}</option>
              <option value="large">{t('order:large')}</option>
              <option value="x-large">{t('order:xLarge')}</option>
            </Select>
            <FormErrorMessage>{errors.items?.[index]?.size?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.items?.[index]?.quantity}>
            <FormLabel>{t('order:quantity')}</FormLabel>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
              min={1}
              aria-label={t('order:quantity')}
            />
            <FormErrorMessage>{errors.items?.[index]?.quantity?.message}</FormErrorMessage>
          </FormControl>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={() => handleRemoveItem(index)}
            mt={8}
            aria-label={t('order:remove')}
          >
            {t('order:remove')}
          </Button>
        </SimpleGrid>
      ))}
      <Button
        colorScheme="blue"
        leftIcon={<FiPackage />}
        onClick={handleAddItem}
        aria-label={t('order:addItem')}
      >
        {t('order:addItem')}
      </Button>
    </Box>
  );
};

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const calculatePrice = async ({ distance, items, workers }: { distance: number; items: Item[]; workers: number }) => {
  const basePrice = 20;
  const distanceCost = distance * 0.5;
  
  const itemCost = items.reduce((total, item) => {
    const itemPrices: Record<string, Record<string, number>> = {
      chair: { small: 5, medium: 10, large: 15, 'x-large': 20 },
      bed: { small: 20, medium: 30, large: 40, 'x-large': 50 },
      box: { small: 5, medium: 10, large: 15, 'x-large': 20 },
      fridge: { small: 30, medium: 40, large: 50, 'x-large': 60 },
      washingMachine: { small: 25, medium: 35, large: 45, 'x-large': 55 },
      tv: { small: 15, medium: 25, large: 35, 'x-large': 45 },
      fan: { small: 5, medium: 10, large: 15, 'x-large': 20 },
      sofa: { small: 30, medium: 45, large: 60, 'x-large': 75 }
    };
    
    const price = itemPrices[item.type]?.[item.size] || 0;
    return total + (price * item.quantity);
  }, 0);

  const workerCost = workers > 1 ? (workers - 1) * 20 : 0;

  const total = basePrice + distanceCost + itemCost + workerCost;

  return {
    total,
    details: {
      basePrice,
      distanceCost,
      itemCost,
      workerCost
    }
  };
};

const BookOrder: React.FC = () => {
  const { t } = useTranslation(['common', 'order']);
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState<{ total: number; details: any }>({ total: 0, details: null });
  const [items, setItems] = useState<Item[]>([{ type: '', size: '', quantity: 1 }]);
  const [images, setImages] = useState<File[]>([]);
  const [orderId] = useState(uuidv4());
  const [orderStatus, setOrderStatus] = useState('pending');
  const [coupon, setCoupon] = useState('');
  const [currentStep, setCurrentStep] = useState(0);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const bgColor = useColorModeValue('white', 'gray.700');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY!,
    libraries: ['places', 'geometry'],
  });

  const steps = [
    { title: t('order:personalInfo'), description: t('order:personalInfoDesc') },
    { title: t('order:addresses'), description: t('order:addressesDesc') },
    { title: t('order:items'), description: t('order:itemsDesc') },
    { title: t('order:payment'), description: t('order:paymentDesc') },
  ];

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxFiles: 5,
    onDrop: (acceptedFiles) => {
      setImages((prev) => [...prev, ...acceptedFiles]);
      setValue('images', [...images, ...acceptedFiles]);
    },
  });

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
    status: yup.string().default('pending'),
    coupon: yup.string().optional(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
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
      status: 'pending',
      coupon: '',
    },
  });

  const pickupAddress = watch('pickupAddress');
  const dropoffAddress = watch('dropoffAddress');
  const workers = watch('workers');

  // استخدمنا useIsomorphicLayoutEffect بدلاً من useEffect للتعامل مع Google Maps
  useIsomorphicLayoutEffect(() => {
    if (!isLoaded || !pickupInputRef.current || !dropoffInputRef.current) return;

    const pickupAutocomplete = new google.maps.places.Autocomplete(pickupInputRef.current, {
      componentRestrictions: { country: 'uk' },
      fields: ['formatted_address', 'geometry'],
    });

    const dropoffAutocomplete = new google.maps.places.Autocomplete(dropoffInputRef.current, {
      componentRestrictions: { country: 'uk' },
      fields: ['formatted_address', 'geometry'],
    });

    pickupAutocomplete.addListener('place_changed', () => {
      const place = pickupAutocomplete.getPlace();
      if (place?.formatted_address) {
        setValue('pickupAddress', place.formatted_address);
      }
    });

    dropoffAutocomplete.addListener('place_changed', () => {
      const place = dropoffAutocomplete.getPlace();
      if (place?.formatted_address) {
        setValue('dropoffAddress', place.formatted_address);
      }
    });

    return () => {
      google.maps.event.clearInstanceListeners(pickupAutocomplete);
      google.maps.event.clearInstanceListeners(dropoffAutocomplete);
    };
  }, [isLoaded, setValue]);

  const calculateDistance = async (origin: string, destination: string) => {
    if (!isLoaded) {
      throw new Error('Google Maps API not loaded');
    }

    const service = new google.maps.DistanceMatrixService();
    return new Promise<number>((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK) {
            const distance = response?.rows[0]?.elements[0]?.distance?.value;
            if (distance) {
              resolve(distance / 1000); // Convert meters to kilometers
            } else {
              reject(new Error('No distance found'));
            }
          } else {
            reject(new Error(`Distance Matrix Service failed: ${status}`));
          }
        }
      );
    });
  };

  const debouncedSaveDraft = useMemo(
    () =>
      debounce((data: FormData) => {
        localStorage.setItem('draftOrder', JSON.stringify(data));
      }, 500),
    []
  );

  useEffect(() => {
    const draft = localStorage.getItem('draftOrder');
    if (draft) {
      const parsed = JSON.parse(draft);
      reset(parsed);
      setItems(parsed.items || [{ type: '', size: '', quantity: 1 }]);
    }
  }, [reset]);

  useEffect(() => {
    const formData = watch();
    debouncedSaveDraft(formData);
    return () => debouncedSaveDraft.cancel();
  }, [watch, debouncedSaveDraft]);

  const calculateDistanceAndPrice = useMemo(() => debounce(async () => {
    try {
      if (!isLoaded || !pickupAddress || !dropoffAddress) {
        if (!pickupAddress || !dropoffAddress) {
          handleError(toast, logger, t('order:priceCalculationWarning'), t('order:missingAddresses'), 'warning');
        }
        setTotalPrice({ total: 0, details: null });
        return;
      }

      const hasValidItem = items.some(item => item.type && item.size);
      if (!hasValidItem) {
        handleError(toast, logger, t('order:priceCalculationWarning'), t('order:noValidItems'), 'warning');
        setTotalPrice({ total: 0, details: null });
        return;
      }

      logger.info('Initiating distance calculation', { pickupAddress, dropoffAddress });

      const distance = await calculateDistance(pickupAddress, dropoffAddress);
      if (typeof distance !== 'number' || distance <= 0) {
        logger.error('Invalid distance value received', { distance });
        throw new Error('Invalid distance value calculated');
      }

      logger.info('Distance calculated successfully:', { distance: `${distance} km` });

      const validItems = items.filter(item => item.type && item.size);
      logger.info('Calculating price with:', { distance, validItems, workers });
      const price = await calculatePrice({ distance, items: validItems, workers });
      if (!price || !price.total || price.total <= 0) {
        logger.error('Invalid price returned from calculatePrice:', { price });
        throw new Error('Invalid price calculated');
      }
      logger.info('Price calculated successfully:', { price });

      setTotalPrice(price);
    } catch (error: any) {
      handleError(toast, logger, t('order:errorMessage'), t('order:priceCalculationError', { error: error.message }));
      setTotalPrice({ total: 0, details: null });
    }
  }, 500), [pickupAddress, dropoffAddress, items, workers, toast, t, isLoaded]);

  useEffect(() => {
    logger.info('Triggering price calculation', { pickupAddress, dropoffAddress, items, workers });
    calculateDistanceAndPrice();
    return () => calculateDistanceAndPrice.cancel();
  }, [calculateDistanceAndPrice]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const orderData = {
        ...data,
        totalPrice: totalPrice.total,
        locale: router.locale,
        items,
        images: images.map(file => file.name),
        status: 'pending',
        orderId,
      };

      logger.info('Submitting order:', { orderData, totalPrice });

      if (!totalPrice.total || totalPrice.total <= 0) {
        throw new Error('Invalid total price. Please ensure a valid price is calculated.');
      }

      localStorage.setItem('lastOrder', JSON.stringify(orderData));
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe not initialized. Please check STRIPE_PUBLIC_KEY.');
      }

      logger.info('Sending request to create-checkout-session', { amount: totalPrice.total * 100 });
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(totalPrice.total * 100),
          currency: 'gbp',
          orderData,
        }),
      });

      const session = await response.json();
      if (!response.ok) {
        logger.error('Failed to create checkout session:', { status: response.status, session });
        throw new Error(session.message || 'Failed to create checkout session');
      }

      logger.info('Checkout session created:', { sessionId: session.id });
      const result = await stripe.redirectToCheckout({ sessionId: session.id });
      if (result.error) {
        throw new Error(result.error.message);
      }

      setOrderStatus('paid');

      await Promise.all([
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        }),
        fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        }),
      ]);

      router.push('/rating');
    } catch (error: any) {
      handleError(toast, logger, t('order:errorMessage'), t('order:submissionError', { error: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    try {
      const response = await fetch('/api/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coupon }),
      });
      const result = await response.json();
      if (result.valid) {
        setTotalPrice((prev) => ({
          total: prev.total * (1 - result.discount),
          details: prev.details,
        }));
        setValue('coupon', coupon);
        toast({ title: t('order:couponApplied'), status: 'success', duration: 3000 });
      } else {
        toast({ title: t('order:invalidCoupon'), status: 'error', duration: 3000 });
      }
    } catch (error: any) {
      handleError(toast, logger, t('order:couponError'), error.message);
    }
  };

  return (
    <Box minH="100vh" p={4} bg={bgColor} dir={router.locale === 'ar' ? 'rtl' : 'ltr'} aria-label="Delivery booking form">
      <Button
        as="button"
        href="tel:+447901846297"
        colorScheme="blue"
        leftIcon={<FiPhone />}
        mb={4}
        aria-label={t('common:contactUs')}
      >
        {t('common:contactUs')}
      </Button>
      <Button
        as="button"
        onClick={() => router.push('/')}
        variant="outline"
        colorScheme="blue"
        mb={4}
        alignSelf={router.locale === 'ar' ? 'flex-end' : 'flex-start'}
        aria-label={t('common:back')}
      >
        {t('common:back')}
      </Button>
      <VStack spacing={8} maxW="3xl" mx="auto">
        <Heading size="lg" color="text.primary">
          {t('order:bookOrderTitle')}
        </Heading>
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            {t('order:orderStatus')}
          </Text>
          <OrderStatusBadge status={orderStatus} />
        </Box>
        <Stepper index={currentStep} mb={6} aria-label="Form navigation steps">
          {steps.map((step, index) => (
            <Step key={index}>
              <StepIndicator>
                <StepStatus
                  complete={<Text>✓</Text>}
                  incomplete={<Text>{index + 1}</Text>}
                  active={<Text>{index + 1}</Text>}
                />
              </StepIndicator>
              <Box flexShrink={0}>
                <StepTitle>{step.title}</StepTitle>
                <StepDescription>{step.description}</StepDescription>
              </Box>
              <StepSeparator />
            </Step>
          ))}
        </Stepper>
        <Box w="full" bg={bgColor} borderRadius="lg" boxShadow="md" p={6}>
          <form onSubmit={handleSubmit(onSubmit)} aria-label="Delivery booking form">
            <VStack spacing={6}>
              {currentStep === 0 && (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <FormControl isInvalid={!!errors.firstName}>
                    <FormLabel>{t('order:firstName')}</FormLabel>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => <Input {...field} aria-label={t('order:firstName')} />}
                    />
                    <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.lastName}>
                    <FormLabel>{t('order:lastName')}</FormLabel>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => <Input {...field} aria-label={t('order:lastName')} />}
                    />
                    <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.phoneNumber}>
                    <FormLabel>{t('order:phoneNumber')}</FormLabel>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      render={({ field }) => <Input {...field} aria-label={t('order:phoneNumber')} />}
                    />
                    <FormErrorMessage>{errors.phoneNumber?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel>{t('order:email')}</FormLabel>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => <Input {...field} aria-label={t('order:email')} />}
                    />
                    <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                  </FormControl>
                </SimpleGrid>
              )}
              {currentStep === 1 && (
                <>
                  <FormControl isInvalid={!!errors.pickupAddress}>
                    <FormLabel>{t('order:pickupAddress')}</FormLabel>
                    <Controller
                      name="pickupAddress"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          ref={(e) => {
                            pickupInputRef.current = e;
                            field.ref(e);
                          }}
                          placeholder={t('order:enterPickupAddressManually')}
                          aria-label={t('order:pickupAddress')}
                        />
                      )}
                    />
                    <FormErrorMessage>{errors.pickupAddress?.message}</FormErrorMessage>
                  </FormControl>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl isInvalid={!!errors.pickupFloor}>
                      <FormLabel>{t('order:pickupFloor')}</FormLabel>
                      <Controller
                        name="pickupFloor"
                        control={control}
                        render={({ field }) => <Input {...field} aria-label={t('order:pickupFloor')} />}
                      />
                      <FormErrorMessage>{errors.pickupFloor?.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('order:pickupLift')}</FormLabel>
                      <Controller
                        name="pickupLift"
                        control={control}
                        render={({ field }) => <Checkbox {...field} isChecked={field.value} aria-label={t('order:pickupLift')} />}
                      />
                    </FormControl>
                  </SimpleGrid>
                  <FormControl isInvalid={!!errors.dropoffAddress}>
                    <FormLabel>{t('order:dropoffAddress')}</FormLabel>
                    <Controller
                      name="dropoffAddress"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          ref={(e) => {
                            dropoffInputRef.current = e;
                            field.ref(e);
                          }}
                          placeholder={t('order:enterDropoffAddressManually')}
                          aria-label={t('order:dropoffAddress')}
                        />
                      )}
                    />
                    <FormErrorMessage>{errors.dropoffAddress?.message}</FormErrorMessage>
                  </FormControl>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                    <FormControl isInvalid={!!errors.dropoffFloor}>
                      <FormLabel>{t('order:dropoffFloor')}</FormLabel>
                      <Controller
                        name="dropoffFloor"
                        control={control}
                        render={({ field }) => <Input {...field} aria-label={t('order:dropoffFloor')} />}
                      />
                      <FormErrorMessage>{errors.dropoffFloor?.message}</FormErrorMessage>
                    </FormControl>
                    <FormControl>
                      <FormLabel>{t('order:dropoffLift')}</FormLabel>
                      <Controller
                        name="dropoffLift"
                        control={control}
                        render={({ field }) => <Checkbox {...field} isChecked={field.value} aria-label={t('order:dropoffLift')} />}
                      />
                    </FormControl>
                  </SimpleGrid>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <FormControl isInvalid={!!errors.serviceType}>
                    <FormLabel>{t('order:serviceType')}</FormLabel>
                    <Controller
                      name="serviceType"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder={t('order:serviceTypePlaceholder')} aria-label={t('order:serviceType')}>
                          <option value="manWithVan">{t('order:manWithVan')}</option>
                          <option value="twoMenWithVan">{t('order:twoMenWithVan')}</option>
                        </Select>
                      )}
                    />
                    <FormErrorMessage>{errors.serviceType?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.workers}>
                    <FormLabel>{t('order:workers')}</FormLabel>
                    <Controller
                      name="workers"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} placeholder={t('order:workersPlaceholder')} aria-label={t('order:workers')}>
                          <option value={1}>1 {t('order:worker')}</option>
                          <option value={2}>2 {t('order:workers')}</option>
                        </Select>
                      )}
                    />
                    <FormErrorMessage>{errors.workers?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={!!errors.pickupDateTime}>
                    <FormLabel>{t('order:pickupDateTime')}</FormLabel>
                    <Box border="1px solid" borderColor="gray.200" borderRadius="md" p={2} minH="40px">
                      <Controller
                        name="pickupDateTime"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value ? new Date(field.value) : null}
                            onChange={(date) => field.onChange(date?.toISOString())}
                            showTimeSelect
                            dateFormat="Pp"
                            minDate={new Date()}
                            placeholderText={t('order:selectDateTime')}
                            className="chakra-input"
                            wrapperClassName="date-picker-wrapper"
                            aria-label={t('order:pickupDateTime')}
                          />
                        )}
                      />
                    </Box>
                    <FormErrorMessage>{errors.pickupDateTime?.message}</FormErrorMessage>
                  </FormControl>
                  <FormControl>
                    <FormLabel>{t('order:description')}</FormLabel>
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => <Textarea {...field} aria-label={t('order:description')} />}
                    />
                  </FormControl>
                  <ItemsList items={items} errors={errors} setItems={setItems} setValue={setValue} t={t} />
                  <FormControl>
                    <FormLabel>{t('order:images')}</FormLabel>
                    <Box {...getRootProps()} p={4} border="2px dashed" borderColor="gray.300" borderRadius="lg" textAlign="center" aria-label={t('order:images')}>
                      <input {...getInputProps()} />
                      <Text>{t('order:dropImages')}</Text>
                    </Box>
                    {images.length > 0 && (
                      <VStack mt={4} align="start">
                        {images.map((file, index) => (
                          <Text key={index}>{file.name}</Text>
                        ))}
                      </VStack>
                    )}
                  </FormControl>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <FormControl>
                    <FormLabel>{t('order:coupon')}</FormLabel>
                    <Input value={coupon} onChange={(e) => setCoupon(e.target.value)} aria-label={t('order:coupon')} />
                    <Button mt={2} onClick={handleApplyCoupon} aria-label={t('order:applyCoupon')}>
                      {t('order:applyCoupon')}
                    </Button>
                  </FormControl>
                  <Box w="full" textAlign="center">
                    <Text fontSize="xl" fontWeight="bold" color="text.primary" mb={4}>
                      {t('order:totalPrice')}: £{(totalPrice.total || 0).toFixed(2)}
                    </Text>
                    {totalPrice.details && (
                      <VStack mb={4}>
                        <Text>Base Price: £{(totalPrice.details.basePrice || 0).toFixed(2)}</Text>
                        <Text>Distance Cost: £{(totalPrice.details.distanceCost || 0).toFixed(2)}</Text>
                        <Text>Item Cost: £{(totalPrice.details.itemCost || 0).toFixed(2)}</Text>
                        <Text>Worker Cost: £{(totalPrice.details.workerCost || 0).toFixed(2)}</Text>
                      </VStack>
                    )}
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      isDisabled={isLoading || totalPrice.total === 0}
                      isLoading={isLoading}
                      loadingText={t('order:processing')}
                      aria-label={t('order:proceedToPayment')}
                    >
                      {t('order:proceedToPayment')}
                    </Button>
                    <Button
                      onClick={() => reset()}
                      colorScheme="gray"
                      variant="outline"
                      size="lg"
                      mt={4}
                      aria-label={t('order:resetForm')}
                    >
                      {t('order:resetForm')}
                    </Button>
                  </Box>
                </>
              )}
              <Flex w="full" justify="space-between">
                <Button
                  onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                  isDisabled={currentStep === 0}
                  aria-label={t('order:previous')}
                >
                  {t('order:previous')}
                </Button>
                <Button
                  onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
                  isDisabled={currentStep === steps.length - 1}
                  colorScheme="blue"
                  aria-label={t('order:next')}
                >
                  {t('order:next')}
                </Button>
              </Flex>
            </VStack>
          </form>
        </Box>
      </VStack>
    </Box>
  );
};

export default BookOrder;