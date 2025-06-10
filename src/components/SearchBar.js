// components/SearchBar.js
import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Text,
  Avatar,
  useDisclosure,
  useOutsideClick,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// API function to search users using axios
const searchUsers = async (query) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search`, {
      params: { q: query },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    return response.data.users || [];
  } catch (error) {
    console.error('Error searching users:', error.response?.data || error.message);
    return [];
  }
};

const SearchBar = ({ width = "250px" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef();
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useOutsideClick({
    ref: searchRef,
    handler: () => setIsOpen(false),
  });

  // Search users with debouncing
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
      setIsOpen(false);
      return;
    }

    // Debounce the API call
    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const users = await searchUsers(searchQuery.trim());
        setFilteredUsers(users);
        setIsOpen(users.length > 0);
      } catch (error) {
        console.error('Search error:', error);
        setFilteredUsers([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleUserSelect = (user) => {
    setSearchQuery('');
    setIsOpen(false);
    navigate(`/public/${user._id || user.id}`); // Use _id for MongoDB or id as fallback
  };

  const handleInputFocus = () => {
    if (filteredUsers.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <Box position="relative" ref={searchRef} w={width}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="orange.400" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search your for friends..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={handleInputFocus}
          borderRadius="lg"
          bg="white"
          border="2px solid"
          borderColor="orange.200"
          _hover={{
            borderColor: 'orange.300',
          }}
          _focus={{
            borderColor: 'orange.400',
            boxShadow: '0 0 0 1px var(--chakra-colors-orange-400)',
            bg: 'white',
          }}
          _placeholder={{
            color: 'gray.500',
          }}
          fontSize="sm"
        />
      </InputGroup>

      {/* Search Results Dropdown */}
      {isOpen && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          bg="white"
          border="2px solid"
          borderColor="orange.200"
          borderRadius="lg"
          boxShadow="lg"
          zIndex={1000}
          mt={1}
          maxH="300px"
          overflowY="auto"
        >
          <VStack spacing={0} align="stretch">
            {isLoading ? (
              <Box px={4} py={6} textAlign="center">
                <Text color="orange.500" fontSize="sm">
                  Searching...
                </Text>
              </Box>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Box
                  key={user._id || user.id}
                  px={4}
                  py={3}
                  cursor="pointer"
                  _hover={{
                    bg: 'orange.50',
                    borderLeft: '4px solid',
                    borderLeftColor: 'orange.400',
                  }}
                  transition="all 0.2s ease-in-out"
                  onClick={() => handleUserSelect(user)}
                >
                  <HStack spacing={3}>
                    <Avatar
                      size="sm"
                      name={user.fullName || user.name}
                      src={user.avatar || user.profilePicture}
                      bg="orange.100"
                      color="orange.600"
                    />
                    <VStack align="start" spacing={0} flex={1}>
                      <Text
                        fontWeight="semibold"
                        fontSize="sm"
                        color="gray.800"
                        lineHeight="short"
                      >
                        @{user.username}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.600"
                        lineHeight="short"
                      >
                        {user.fullName || user.name}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              ))
            ) : (
              <Box px={4} py={6} textAlign="center">
                <Text color="gray.500" fontSize="sm">
                  No users found
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;