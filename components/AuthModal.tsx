import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalCloseButton, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import dynamic from 'next/dynamic';

const LoginForm = dynamic(() => import('@/components/forms/LoginForm'));
const RegisterForm = dynamic(() => import('@/components/forms/RegisterForm'));

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent p={4}>
        <ModalCloseButton />
        <Tabs isFitted variant="enclosed">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Register</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LoginForm onSuccess={onClose} />
            </TabPanel>
            <TabPanel>
              <RegisterForm onSuccess={onClose} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;