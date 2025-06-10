// components/NotificationsPopup.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Divider,
  Spinner,
  useToast,
  Badge,
  IconButton,
  Flex,
} from '@chakra-ui/react';
import { FaTimes, FaCheck, FaUserPlus, FaBell } from 'react-icons/fa';
import axios from 'axios';
import useUserStore from '../stores/userdetails';

const NotificationsPopup = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState(new Set());
  const popupRef = useRef(null);
  const toast = useToast();
  const userId = useUserStore((state) => state.userId); // Get userId from Zustand store
  const setUserId = useUserStore((state) => state.setUserId); // Function to set userId in Zustand store

  const fetchNotifications = async () => {
        console.log('Fetching notifications for user:', userId);
        if (!userId) return;

        setLoading(true);
        try {
          const token = localStorage.getItem('token');

          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/friend-requests/pending/`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // ✅ FIX HERE
          setNotifications(response.data.data);

        } catch (error) {
          console.error('Error fetching notifications:', error);
          toast({
            title: 'Error',
            description: 'Failed to load notifications',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };


  // Handle accepting friend request
  const handleAccept = async (requestId, fromUser) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/friend-requests/accept/${requestId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Remove the notification from the list
      setNotifications(prev => prev.filter(notif => notif._id !== requestId));
      
      toast({
        title: 'Friend Request Accepted',
        description: `You are now friends with ${fromUser.name}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle rejecting friend request
  const handleReject = async (requestId, fromUser) => {
    setProcessingIds(prev => new Set([...prev, requestId]));
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/friend-requests/reject/${requestId}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Remove the notification from the list
      setNotifications(prev => prev.filter(notif => notif._id !== requestId));
      
      toast({
        title: 'Friend Request Rejected',
        description: `Rejected friend request from ${fromUser.name}`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject friend request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  // Handle clicking outside to close popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchNotifications();
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, userId]);

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInHours = Math.floor((now - notifDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return notifDate.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="60px"
      right="20px"
      bg="white"
      borderRadius="lg"
      boxShadow="2xl"
      border="1px solid"
      borderColor="gray.200"
      width="380px"
      maxHeight="500px"
      zIndex="1000"
      ref={popupRef}
    >
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        p={4}
        borderBottom="1px solid"
        borderColor="gray.100"
      >
        <HStack>
          <Text fontSize="lg" fontWeight="bold" color="gray.800">
            Notifications
          </Text>
          {notifications.length > 0 && (
            <Badge colorScheme="blue" borderRadius="full">
              {notifications.length}
            </Badge>
          )}
        </HStack>
        <IconButton
          icon={<FaTimes />}
          size="sm"
          variant="ghost"
          onClick={onClose}
          aria-label="Close notifications"
        />
      </Flex>

      {/* Content */}
      <Box maxHeight="400px" overflowY="auto">
        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="lg" color="blue.500" />
          </Flex>
        ) : notifications.length === 0 ? (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="200px"
            p={6}
            color="gray.500"
          >
            <FaBell size={40} opacity={0.3} />
            <Text mt={3} textAlign="center">
              No new notifications
            </Text>
            <Text fontSize="sm" textAlign="center" mt={1}>
              Friend requests will appear here
            </Text>
          </Flex>
        ) : (
          <VStack spacing={0} align="stretch">
            {notifications.map((notification, index) => (
              <Box key={notification._id}>
                <Box p={4} _hover={{ bg: 'gray.50' }}>
                  <HStack spacing={3} align="start">
                    <Avatar
                      size="md"
                      name={notification.from.name}
                      src={notification.from.profileImage}
                    />
                    <VStack align="start" spacing={2} flex={1}>
                      <Box>
                        <HStack spacing={2} align="center">
                          <FaUserPlus color="#3182CE" size={14} />
                          <Text fontSize="sm" color="gray.600">
                            Friend Request
                          </Text>
                        </HStack>
                        <Text fontSize="sm" mt={1}>
                          <Text as="span" fontWeight="semibold">
                            {notification.from.name}
                          </Text>{' '}
                          wants to add you to their close circle
                        </Text>
                        <Text fontSize="xs" color="gray.500" mt={1}>
                          {getTimeAgo(notification.createdAt)}
                        </Text>
                      </Box>
                      
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme="blue"
                          leftIcon={<FaCheck />}
                          onClick={() => handleAccept(notification._id, notification.from)}
                          isLoading={processingIds.has(notification._id)}
                          loadingText="Accepting..."
                          disabled={processingIds.has(notification._id)}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<FaTimes />}
                          onClick={() => handleReject(notification._id, notification.from)}
                          isLoading={processingIds.has(notification._id)}
                          loadingText="Rejecting..."
                          disabled={processingIds.has(notification._id)}
                        >
                          Reject
                        </Button>
                      </HStack>
                    </VStack>
                  </HStack>
                </Box>
                {index < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
};

export default NotificationsPopup;