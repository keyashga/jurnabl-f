// components/SendFriendRequest.js
import React, { useState, useEffect } from 'react';
import {
  Button,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FaHeart, FaUserCheck, FaClock } from 'react-icons/fa';
import axios from 'axios';

const SendFriendRequest = ({ targetUserId, targetUserName }) => {
  const [requestStatus, setRequestStatus] = useState('none'); // 'none', 'pending', 'sent', 'accepted'
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const toast = useToast();

  // Check existing friend request status
  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !targetUserId) {
          setCheckingStatus(false);
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/friend-requests/status/${targetUserId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setRequestStatus(response.data.status);
        }
      } catch (error) {
        console.error('Error checking friend request status:', error);
        // If there's an error, assume no request exists
        setRequestStatus('none');
      } finally {
        setCheckingStatus(false);
      }
    };

    if (targetUserId) {
      checkFriendRequestStatus();
    }
  }, [targetUserId]);

  // Send friend request
  const handleSendFriendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to send friend requests',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setLoading(true);

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/friend-requests/send`,
        {
          to: targetUserId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRequestStatus('pending');
        toast({
          title: 'Friend request sent!',
          description: `Your friend request has been sent to ${targetUserName || 'the user'}`,
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      let errorMessage = 'Failed to send friend request';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cancel friend request
  const handleCancelFriendRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      setLoading(true);

      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/friend-requests/cancel/${targetUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setRequestStatus('none');
        toast({
          title: 'Friend request cancelled',
          description: 'Your friend request has been cancelled',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel friend request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking status
  if (checkingStatus) {
    return (
      <Button
        variant="outline"
        colorScheme="orange"
        size="md"
        w="full"
        borderRadius="lg"
        disabled
      >
        <Spinner size="sm" />
      </Button>
    );
  }

  // Render button based on current status
  const renderButton = () => {
    switch (requestStatus) {
      case 'pending':
        return (
          <Button
            leftIcon={<FaClock />}
            variant="outline"
            colorScheme="yellow"
            size="md"
            w="full"
            borderRadius="lg"
            onClick={handleCancelFriendRequest}
            isLoading={loading}
            loadingText="Cancelling..."
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
              bg: 'yellow.50',
              borderColor: 'yellow.300',
            }}
            transition="all 0.2s ease-in-out"
          >
            Request Pending
          </Button>
        );

      case 'accepted':
        return (
          <Button
            leftIcon={<FaUserCheck />}
            variant="solid"
            colorScheme="green"
            size="md"
            w="full"
            borderRadius="lg"
            disabled
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
            }}
            transition="all 0.2s ease-in-out"
          >
            Friends
          </Button>
        );

      case 'rejected':
        return (
          <Button
            leftIcon={<FaHeart />}
            variant="outline"
            colorScheme="red"
            size="md"
            w="full"
            borderRadius="lg"
            onClick={handleSendFriendRequest}
            isLoading={loading}
            loadingText="Sending..."
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
              bg: 'red.50',
              borderColor: 'red.300',
            }}
            transition="all 0.2s ease-in-out"
          >
            Send Friend Request
          </Button>
        );

      default: // 'none'
        return (
          <Button
            leftIcon={<FaHeart />}
            variant="outline"
            colorScheme="orange"
            size="md"
            w="full"
            borderRadius="lg"
            onClick={handleSendFriendRequest}
            isLoading={loading}
            loadingText="Sending..."
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'md',
              bg: 'orange.50',
              borderColor: 'orange.300',
            }}
            transition="all 0.2s ease-in-out"
          >
            Send Friend Request
          </Button>
        );
    }
  };

  return renderButton();
};

export default SendFriendRequest;