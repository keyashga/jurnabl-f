// components/Public.js (Enhanced with real user data from database)
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Avatar,
  Text,
  VStack,
  HStack,
  Divider,
  Badge,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaBookOpen, FaHeart, FaEye, FaPen, FaFeatherAlt, FaUser, FaSync } from 'react-icons/fa';
import axios from 'axios';
import SendFriendRequest from './friendRequest';
import './css/public.css';

const Public = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedUsersLoading, setSuggestedUsersLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    console.log('Public component mounted with userId:', userId);
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }
        setLoading(true);
        console.log('Fetching user data for userId:', userId);
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        console.log('API Response:', response.data);
        
        if (response.data.success && response.data.user) {
          setUser(response.data.user);
          setError(null);
        } else {
          setError('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    } else {
      setError('No user ID provided');
      setLoading(false);
    }
  }, [userId]);

  // Fetch suggested users - UPDATED FUNCTION
  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSuggestedUsersLoading(false);
        return;
      }

      setSuggestedUsersLoading(true);
      
      // Use the new suggested users endpoint - increased limit to 12
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/search/suggested?limit=12`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Suggested users response:', response.data);
      
      if (response.data.success && response.data.users) {
        // Filter out the current user being viewed (extra safety)
        const filteredUsers = response.data.users.filter(u => u.id !== userId);
        setSuggestedUsers(filteredUsers); // Show all fetched users (up to 12)
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      // Don't show error for suggested users, just log it
    } finally {
      setSuggestedUsersLoading(false);
    }
  };

  // Fetch suggested users on component mount
  useEffect(() => {
    fetchSuggestedUsers();
  }, [userId]);

  // Handle refresh suggested users
  const handleRefreshSuggested = () => {
    fetchSuggestedUsers();
  };

  // Handle view profile click
  const handleViewProfile = (targetUserId) => {
    navigate(`/public/${targetUserId}`);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="public-container">
        <Container maxW="1200px" py={8}>
          <Grid templateColumns="1fr 2fr" gap={8} minH="80vh">
            <GridItem>
              <VStack spacing={6} align="stretch">
                <div className="profile-card loading">
                  <VStack spacing={4} align="center">
                    <SkeletonCircle size="120px" />
                    <SkeletonText mt={4} noOfLines={2} spacing={2} skeletonHeight="4" />
                    <HStack spacing={3}>
                      <Skeleton height="40px" width="100px" />
                      <Skeleton height="40px" width="120px" />
                    </HStack>
                  </VStack>
                </div>
              </VStack>
            </GridItem>
            <GridItem>
              <div className="content-area loading">
                <Text color="#92400e" fontSize="lg">
                  Loading diary pages...
                </Text>
              </div>
            </GridItem>
          </Grid>
        </Container>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="public-container">
        <Container maxW="1200px" py={8}>
          <Alert status="error" borderRadius="lg" className="error-alert">
            <AlertIcon color="#dc2626" />
            <Box>
              <AlertTitle className="error-title">Error loading profile!</AlertTitle>
              <AlertDescription className="error-description">{error}</AlertDescription>
            </Box>
          </Alert>
        </Container>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="public-container">
        <Container maxW="1200px" py={8}>
          <Alert status="warning" borderRadius="lg" className="warning-alert">
            <AlertIcon color="#d97706" />
            <Box>
              <AlertTitle className="warning-title">No user data found!</AlertTitle>
              <AlertDescription className="warning-description">The user profile could not be loaded.</AlertDescription>
            </Box>
          </Alert>
        </Container>
      </div>
    );
  }

  // Main component
  return (
    <div className="public-container">
      <Container maxW="1200px" py={8}>
        <Grid templateColumns="1fr 2fr" gap={8} minH="80vh">
          {/* Left Side - User Profile */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Profile Card */}
              <div className="profile-card">
                <VStack spacing={6} align="center">
                  {/* Avatar */}
                  <div className="avatar-container">
                    <Avatar
                      size="2xl"
                      name={user.name || user.fullName || 'Unknown User'}
                      src={user.profileImage || user.avatar || user.profilePicture}
                      className="user-avatar"
                    />
                    <div className="online-indicator" />
                  </div>

                  {/* User Info */}
                  <VStack spacing={2} align="center">
                    <Text className="user-name">
                      {user.name || user.fullName || 'Unknown User'}
                    </Text>
                    <Text className="username">
                      @{user.username || 'unknown'}
                    </Text>
                    
                    {/* Bio */}
                    {user.bio && (
                      <Text className="user-bio">
                        {user.bio}
                      </Text>
                    )}

                    {/* User Stats */}
                    <div className="user-stats">
                      <div className="stat-item">
                        <FaBookOpen className="stat-icon" />
                        <div className="stat-content">
                          <Text className="stat-number">
                            {user.journalCount || 0}
                          </Text>
                          <Text className="stat-label">Journals</Text>
                        </div>
                      </div>
                      
                      <div className="stat-item">
                        <FaHeart className="stat-icon" />
                        <div className="stat-content">
                          <Text className="stat-number">
                            {user.totalLikes || 0}
                          </Text>
                          <Text className="stat-label">Hearts</Text>
                        </div>
                      </div>
                      
                      <div className="stat-item">
                        <FaEye className="stat-icon" />
                        <div className="stat-content">
                          <Text className="stat-number">
                            {user.totalReads || 0}
                          </Text>
                          <Text className="stat-label">Reads</Text>
                        </div>
                      </div>
                      
                      <div className="stat-item">
                        <FaPen className="stat-icon" />
                        <div className="stat-content">
                          <Text className="stat-number">
                            {user.consistency || 0}%
                          </Text>
                          <Text className="stat-label">Consistency</Text>
                        </div>
                      </div>
                    </div>
                  </VStack>

                  <Divider className="profile-divider" />

                  {/* Action Buttons */}
                  <VStack spacing={3} w="full">
                    <SendFriendRequest 
                      targetUserId={userId} 
                      targetUserName={user.name || user.fullName || user.username}
                    />
                  </VStack>

                  {/* Additional Info */}
                  {(user.location || user.createdAt) && (
                    <>
                      <Divider className="profile-divider" />
                      <VStack spacing={2} align="start" w="full" className="additional-info">
                        {user.location && (
                          <HStack spacing={2}>
                            <FaMapMarkerAlt className="info-icon" />
                            <Text className="info-text">
                              {user.location}
                            </Text>
                          </HStack>
                        )}
                        
                        {user.createdAt && (
                          <HStack spacing={2}>
                            <FaCalendarAlt className="info-icon" />
                            <Text className="info-text">
                              Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'long',
                                year: 'numeric'
                              })}
                            </Text>
                          </HStack>
                        )}
                      </VStack>
                    </>
                  )}

                  {/* User Status Badge */}
                  <Badge className="status-badge">
                    Active Writer
                  </Badge>
                </VStack>
              </div>
            </VStack>
          </GridItem>

          {/* Right Side - Suggested Users */}
          <GridItem>
            <div className="suggested-users-container">
              <div className="suggested-users-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaFeatherAlt className="header-icon" />
                  <Text className="header-title">Fellow Writers</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    className="refresh-button"
                    onClick={handleRefreshSuggested}
                    disabled={suggestedUsersLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: suggestedUsersLoading ? 'not-allowed' : 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      opacity: suggestedUsersLoading ? 0.5 : 1
                    }}
                  >
                    <text>click here to refresh...</text>
                  </button>
                  
                </div>
              </div>
              
              <div className="suggested-users-grid">
                {suggestedUsersLoading ? (
                  // Loading skeleton for suggested users - increased to 8
                  Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="suggested-user-card">
                      <div className="suggested-user-header">
                        <SkeletonCircle size="48px" />
                        <div className="suggested-user-info">
                          <Skeleton height="16px" width="120px" mb={1} />
                          <Skeleton height="14px" width="80px" />
                        </div>
                      </div>
                      <SkeletonText mt={3} noOfLines={2} spacing={1} skeletonHeight="3" />
                      <Skeleton height="32px" width="100%" mt={3} />
                    </div>
                  ))
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((suggestedUser) => (
                    <div key={suggestedUser.id} className="suggested-user-card">
                      <div className="suggested-user-header">
                        <div className="suggested-avatar-container">
                          <Avatar
                            size="md"
                            name={suggestedUser.name || suggestedUser.fullName || suggestedUser.username}
                            src={suggestedUser.profileImage || suggestedUser.avatar || suggestedUser.profilePicture}
                            className="suggested-avatar"
                          />
                          <div className="suggested-online-indicator" />
                        </div>
                        <div className="suggested-user-info">
                          <Text className="suggested-user-name">
                            {suggestedUser.name || suggestedUser.fullName || 'Unknown User'}
                          </Text>
                          <Text className="suggested-username">
                            @{suggestedUser.username || 'unknown'}
                          </Text>
                        </div>
                      </div>
                      
                      <div className="suggested-user-stats">
                        <Text className="suggested-last-active">
                          Active recently
                        </Text>
                      </div>
                      
                      <button 
                        className="suggested-user-button"
                        onClick={() => handleViewProfile(suggestedUser.id)}
                      >
                        <FaUser className="button-icon" />
                        View Profile
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="no-suggestions">
                    <Text color="#92400e" textAlign="center">
                      No fellow writers found at the moment
                    </Text>
                    <button 
                      className="retry-button"
                      onClick={handleRefreshSuggested}
                      style={{
                        marginTop: '8px',
                        padding: '8px 16px',
                        background: '#92400e',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </div>
          </GridItem>
        </Grid>
      </Container>
    </div>
  );
};

export default Public;