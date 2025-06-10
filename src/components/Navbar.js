// components/Navbar.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Image,
  Text,
  Link as ChakraLink,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserFriends, FaGlobe, FaBookOpen, FaBell, FaUserCircle } from 'react-icons/fa';
import SearchBar from './SearchBar';
import NotificationsPopup from './Notifications';
import axios from 'axios';
import useUserStore from '../stores/userdetails';

const Navbar = () => { // Add userId as prop
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const userId = useUserStore((state) => state.userId); // Get userId from Zustand store

  const navItems = [
    { label: 'My Friends', icon: FaUserFriends, path: '/close-circle' },
    { label: 'My Diary', icon: FaBookOpen, path: '/my-diary' },
    { 
      label: 'Notifications', 
      icon: FaBell, 
      path: '/notifications',
      isNotification: true,
      onClick: () => setIsNotificationsOpen(!isNotificationsOpen)
    },
    { label: 'Me', icon: FaUserCircle, path: '/me' },
  ];

  // Fetch notification count
  const fetchNotificationCount = async () => {
    if (!userId) return;
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/friend-requests/pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Handle the response structure from your backend
      const notifications = response.data.success ? response.data.data : response.data;
      setNotificationCount((notifications || []).length);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  // Fetch notification count on component mount and periodically
  useEffect(() => {
    fetchNotificationCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);
    
    return () => clearInterval(interval);
  }, [userId]);

  // Update notification count when notifications popup closes
  const handleNotificationsClose = () => {
    setIsNotificationsOpen(false);
    fetchNotificationCount(); // Refresh count after closing
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <>
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
      >
        <Flex maxW="1200px" mx="auto" align="center" justify="space-between">
          {/* Logo and Search */}
          <Flex align="center" gap={4}>
            <Link to="/close-circle">
              <Image
                src="/3.png"
                boxSize="34px"
                alt="App logo"
                _hover={{
                  transform: 'scale(1.2)',
                  transition: 'transform 0.3s ease-in-out',
                }}
                transition="transform 0.3s ease-in-out"
              />
            </Link>
            <SearchBar width="250px" />
          </Flex>

          {/* Navigation Icons */}
          <Flex gap={6}>
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

      {/* Notifications Popup */}
      <NotificationsPopup
        isOpen={isNotificationsOpen}
        onClose={handleNotificationsClose}
      />
    </>
  );
};

export default Navbar;