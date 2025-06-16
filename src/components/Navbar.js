import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  Link as ChakraLink,
  Badge,
  useColorModeValue,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaUserFriends,
  FaBookOpen,
  FaBell,
  FaUserCircle,
  FaSearch,
} from 'react-icons/fa';
import SearchBar from './SearchBar';
import NotificationsPopup from './Notifications';
import axios from 'axios';
import useUserStore from '../stores/userdetails';

const Navbar = () => {
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = useUserStore((state) => state.userId);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const navItems = [
    { label: 'My Friends', icon: FaUserFriends, path: '/close-circle' },
    { label: 'My Diary', icon: FaBookOpen, path: '/my-diary' },
    {
      label: 'Notifications',
      icon: FaBell,
      path: '/notifications',
      isNotification: true,
      onClick: () => setIsNotificationsOpen(!isNotificationsOpen),
    },
    { label: 'Me', icon: FaUserCircle, path: '/me' },
  ];

  const fetchNotificationCount = async () => {
    if (!userId) return;

    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `${
          process.env.REACT_APP_API_URL || 'http://localhost:5000'
        }/api/friend-requests/pending`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const notifications = response.data.success
        ? response.data.data
        : response.data;
      setNotificationCount((notifications || []).length);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false);
    fetchNotificationCount();
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <>
      {/* Desktop Navbar - Top */}
      <Box
        bg={bgColor}
        boxShadow="sm"
        px={4}
        py={2}
        position="sticky"
        top={0}
        zIndex={100}
        borderBottom="1px solid"
        borderColor={borderColor}
        display={{ base: 'none', md: 'block' }}
      >
        <Flex
          maxW="1200px"
          mx="auto"
          align="center"
          justify="space-between"
        >
          {/* Logo */}
          <Link to="/close-circle">
            <Image
              src="/ff.png"
              boxSize="34px"
              alt="App logo"
              _hover={{
                transform: 'scale(1.2)',
                transition: 'transform 0.3s ease-in-out',
              }}
              transition="transform 0.3s ease-in-out"
            />
          </Link>

          {/* Desktop Search Bar */}
          <SearchBar width="250px" />

          {/* Desktop Navigation Icons */}
          <Flex gap={6} align="center">
            {navItems.map(({ label, icon: Icon, path, isNotification, onClick }) => (
              <Box key={label} position="relative">
                <ChakraLink
                  as={isNotification ? 'button' : Link}
                  to={!isNotification ? path : undefined}
                  onClick={isNotification ? onClick : undefined}
                  textAlign="center"
                  color={location.pathname === path ? 'blue.600' : 'gray.600'}
                  _hover={{
                    textDecoration: 'none',
                    color: 'blue.700',
                    transform: 'scale(1.1)',
                  }}
                  transition="all 0.3s ease-in-out"
                  cursor="pointer"
                  bg="transparent"
                  border="none"
                  outline="none"
                  _focus={{ boxShadow: 'none' }}
                >
                  <Flex direction="column" align="center" fontSize="sm" position="relative">
                    <Box position="relative">
                      <Icon size={20} />
                      {isNotification && notificationCount > 0 && (
                        <Badge
                          colorScheme="red"
                          borderRadius="full"
                          fontSize="xs"
                          position="absolute"
                          top="-8px"
                          right="-8px"
                          minW="18px"
                          h="18px"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          {notificationCount > 99 ? '99+' : notificationCount}
                        </Badge>
                      )}
                    </Box>
                    <Text mt={1}>{label}</Text>
                  </Flex>
                </ChakraLink>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>

      {/* Mobile Navbar - Bottom */}
      <Box
        bg={bgColor}
        boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
        px={2}
        py={2}
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={100}
        borderTop="1px solid"
        borderColor={borderColor}
        display={{ base: 'block', md: 'none' }}
        // Add safe area padding for phones with home indicators
        pb={{ base: 'env(safe-area-inset-bottom, 8px)' }}
      >
        <Flex
          maxW="100%"
          mx="auto"
          align="center"
          justify="space-around"
        >
          {/* Mobile Search Icon */}
          <Box textAlign="center">
            <IconButton
              icon={<FaSearch />}
              aria-label="Search"
              onClick={onOpen}
              variant="ghost"
              fontSize="20px"
              size="sm"
              color="gray.600"
              _hover={{
                color: 'blue.700',
                transform: 'scale(1.1)',
              }}
              transition="all 0.3s ease-in-out"
            />
          </Box>
          
          {/* Mobile Navigation Items */}
          {navItems.map(({ label, icon: Icon, path, isNotification, onClick }) => (
            <Box key={label} position="relative" textAlign="center">
              <ChakraLink
                as={isNotification ? 'button' : Link}
                to={!isNotification ? path : undefined}
                onClick={isNotification ? onClick : undefined}
                color={location.pathname === path ? 'blue.600' : 'gray.600'}
                _hover={{
                  textDecoration: 'none',
                  color: 'blue.700',
                  transform: 'scale(1.1)',
                }}
                transition="all 0.3s ease-in-out"
                cursor="pointer"
                bg="transparent"
                border="none"
                outline="none"
                _focus={{ boxShadow: 'none' }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                minW="60px"
                py={1}
              >
                <Box position="relative">
                  <Icon size={22} />
                  {isNotification && notificationCount > 0 && (
                    <Badge
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="xs"
                      position="absolute"
                      top="-8px"
                      right="-8px"
                      minW="18px"
                      h="18px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      {notificationCount > 99 ? '99+' : notificationCount}
                    </Badge>
                  )}
                </Box>
              </ChakraLink>
            </Box>
          ))}
        </Flex>
      </Box>

      {/* Add bottom padding to body content on mobile to prevent navbar overlap */}
      <Box 
        display={{ base: 'block', md: 'none' }} 
        h="80px" 
        w="full" 
        position="fixed" 
        bottom={0} 
        pointerEvents="none"
      />

      {/* Notifications Popup */}
      <NotificationsPopup isOpen={isNotificationsOpen} onClose={handleNotificationsClose} />

      {/* Search Modal for mobile */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Search</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4}>
            <SearchBar width="100%" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Navbar;