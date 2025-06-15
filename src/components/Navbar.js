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
      <Box
        bg={bgColor}
        boxShadow="sm"
        px={{ base: 2, md: 4 }}
        py={2}
        position="sticky"
        top={0}
        zIndex={100}
        borderBottom="1px solid"
        borderColor={borderColor}
      >
        <Flex
          maxW="1200px"
          mx="auto"
          align="center"
          justify={{ base: 'center', md: 'space-between' }}
        >
          {/* Logo - Hidden on mobile */}
          <Link to="/close-circle" display={{ base: 'none', md: 'block' }}>
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
          <Box display={{ base: 'none', md: 'block' }}>
            <SearchBar width="250px" />
          </Box>

          {/* Navigation Icons + Mobile Search */}
          <Flex 
            gap={{ base: 4, md: 6 }} 
            align="center" 
            justify={{ base: 'space-around', md: 'flex-end' }}
            flex={{ base: 1, md: 'none' }}
          >
            {/* Mobile Search Icon */}
            <IconButton
              icon={<FaSearch />}
              display={{ base: 'inline-flex', md: 'none' }}
              aria-label="Search"
              onClick={onOpen}
              variant="ghost"
              fontSize="20px"
              size="sm"
            />
            
            {/* Navigation Items */}
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
                  <Flex 
                    direction="column" 
                    align="center" 
                    fontSize={{ base: 'xs', md: 'sm' }} 
                    position="relative"
                  >
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
                    {/* Hide text labels on mobile screens */}
                    <Text mt={1} display={{ base: 'none', md: 'block' }}>
                      {label}
                    </Text>
                  </Flex>
                </ChakraLink>
              </Box>
            ))}
          </Flex>
        </Flex>
      </Box>

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