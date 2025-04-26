import React, { useEffect, useState } from 'react';
import {
  Box, Heading, Text, Button, Spinner, Avatar, Input, VStack, HStack, useToast, Flex, Divider
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CustomerPortal: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const toast = useToast();
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userInfo = userSnap.data();
        setUserData(userInfo);
        setName(userInfo.name || '');
        setPhone(userInfo.phone || '');

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', currentUser.uid));
        const ordersSnap = await getDocs(q);
        const ordersList = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setOrders(ordersList);
      }
      setLoading(false);
    };

    fetchData();
  }, [auth.currentUser, router]);

  const handleSave = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, { name, phone });
      toast({ title: 'Profile updated', status: 'success', duration: 3000 });
      setEditing(false);
    } catch (error) {
      toast({ title: 'Error updating profile', status: 'error', duration: 3000 });
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <Flex minH="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box maxW="4xl" mx="auto" p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="md">Customer Portal</Heading>
        <Button colorScheme="red" onClick={handleLogout}>Logout</Button>
      </Flex>

      <Box mb={8} p={4} borderWidth={1} borderRadius="md">
        <HStack spacing={4}>
          <Avatar name={name} />
          <VStack align="start">
            {editing ? (
              <>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
                <Button size="sm" colorScheme="green" onClick={handleSave}>Save</Button>
              </>
            ) : (
              <>
                <Text><b>Name:</b> {name}</Text>
                <Text><b>Phone:</b> {phone || 'N/A'}</Text>
                <Button size="sm" onClick={() => setEditing(true)}>Edit Profile</Button>
              </>
            )}
          </VStack>
        </HStack>
      </Box>

      <Box>
        <Heading size="sm" mb={4}>Your Orders</Heading>
        {orders.length === 0 ? (
          <Text>No orders found.</Text>
        ) : (
          orders.map(order => (
            <Box key={order.id} p={4} mb={3} borderWidth={1} borderRadius="md">
              <Text><b>Order ID:</b> {order.id}</Text>
              <Text><b>Status:</b> {order.status}</Text>
              <Text><b>Date:</b> {new Date(order.createdAt?.seconds * 1000).toLocaleDateString()}</Text>
            </Box>
          ))
        )}
      </Box>

      <Divider my={6} />

      <Box p={4} borderWidth={1} borderRadius="md">
        <Heading size="sm" mb={2}>Notifications</Heading>
        <Text>Coming soon...</Text>
      </Box>
    </Box>
  );
};

export default CustomerPortal;