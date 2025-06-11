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
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }
        setLoading(true);
        
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        
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
          {/* Horizontal Profile Loading */}
          <div className="profile-card-horizontal loading">
            <div className="profile-left">
              <SkeletonCircle size="120px" />
            </div>
            <div className="profile-center">
              <SkeletonText mt={4} noOfLines={3} spacing={2} skeletonHeight="4" />
            </div>
            <div className="profile-right">
              <Skeleton height="40px" width="100px" mb={2} />
              <Skeleton height="40px" width="120px" />
            </div>
          </div>
          
          {/* Suggested Users Loading */}
          <div className="suggested-users-container">
            <div className="suggested-users-header">
              <Text color="#92400e" fontSize="lg">
                Loading fellow writers...
              </Text>
            </div>
          </div>
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
        {/* Horizontal User Profile Card */}
        <div className="profile-card-horizontal">
          <div className="profile-left">
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
          </div>

          <div className="profile-center">
            {/* User Info */}
            <VStack spacing={2} align="start">
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

              {/* Additional Info */}
              <HStack spacing={4} className="additional-info-horizontal">
                {user.location && (
                  <HStack spacing={1}>
                    <FaMapMarkerAlt className="info-icon" />
                    <Text className="info-text">
                      {user.location}
                    </Text>
                  </HStack>
                )}
                
                {user.createdAt && (
                  <HStack spacing={1}>
                    <FaCalendarAlt className="info-icon" />
                    <Text className="info-text">
                      Joined {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric'
                      })}
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </div>

          <div className="profile-right">
            {/* User Stats */}
            <div className="user-stats-horizontal">
              <div className="stat-item-horizontal">
                <FaBookOpen className="stat-icon" />
                <div className="stat-content">
                  <Text className="stat-number">
                    {user.journalCount || 0}
                  </Text>
                  <Text className="stat-label">Journals</Text>
                </div>
              </div>
              
              <div className="stat-item-horizontal">
                <FaHeart className="stat-icon" />
                <div className="stat-content">
                  <Text className="stat-number">
                    {user.totalLikes || 0}
                  </Text>
                  <Text className="stat-label">Hearts</Text>
                </div>
              </div>
              
              <div className="stat-item-horizontal">
                <FaEye className="stat-icon" />
                <div className="stat-content">
                  <Text className="stat-number">
                    {user.totalReads || 0}
                  </Text>
                  <Text className="stat-label">Reads</Text>
                </div>
              </div>
              
              <div className="stat-item-horizontal">
                <FaPen className="stat-icon" />
                <div className="stat-content">
                  <Text className="stat-number">
                    {user.consistency || 0}%
                  </Text>
                  <Text className="stat-label">Consistency</Text>
                </div>
              </div>
            </div>

            {/* Action Buttons and Badge */}
            <VStack spacing={3} align="stretch" className="profile-actions">
              <SendFriendRequest 
                targetUserId={userId} 
                targetUserName={user.name || user.fullName || user.username}
              />
              
              {/* User Status Badge */}
              <Badge className="status-badge">
                Active Writer
              </Badge>
            </VStack>
          </div>
        </div>

        {/* Suggested Users Section */}
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
      </Container>
    </div>
  );
};

export default Public;