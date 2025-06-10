import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Avatar,
  Button,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
  Spinner,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  IconButton,
  Badge
} from '@chakra-ui/react';
import {
  FaUsers,
  FaUserMinus,
  FaHeart,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTrash
} from 'react-icons/fa';
import axios from 'axios';


// Updated UserCard component with diary theme classes
const UserCard = ({ user, onRemove, removeType, isRemoving }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const cancelRef = React.useRef();

  const handleRemove = () => {
    onRemove(user.id, removeType);
    setShowConfirm(false);
  };

  const getRemoveText = () => {
    switch (removeType) {
      case 'follower':
        return 'Remove Follower';
      case 'following':
        return 'Unfollow';
      case 'closefriend':
        return 'Remove from Close Friends';
      default:
        return 'Remove';
    }
  };

  const getConfirmText = () => {
    switch (removeType) {
      case 'follower':
        return `Are you sure you want to remove ${user.name} from your followers? They will no longer see your updates in their feed.`;
      case 'following':
        return `Are you sure you want to unfollow ${user.name}? You will no longer see their updates in your feed.`;
      case 'closefriend':
        return `Are you sure you want to remove ${user.name} from your close friends circle?`;
      default:
        return 'Are you sure you want to remove this user?';
    }
  };

  return (
    <>
      <Box
        className="diary-user-card"
        p={4}
      >
        <Flex align="center" justify="space-between">
          <Flex align="center" gap={4} flex={1}>
            <Avatar size="md" src={user.profileImage} name={user.name} />
            <Box flex={1}>
              <Text className="diary-user-name" fontSize="1rem" mb={1}>
                {user.name}
              </Text>
              <Text className="diary-user-username" fontSize="0.875rem" mb={2}>
                @{user.username}
              </Text>
              <HStack spacing={3} className="diary-user-meta">
                {user.location && (
                  <HStack spacing={1}>
                    <FaMapMarkerAlt size={10} />
                    <Text>{user.location}</Text>
                  </HStack>
                )}
                <HStack spacing={1}>
                  <FaCalendarAlt size={10} />
                  <Text>
                    Joined {new Date(user.memberSince).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Text>
                </HStack>
              </HStack>
            </Box>
          </Flex>
          <IconButton
            className="diary-remove-btn"
            size="sm"
            variant="ghost"
            icon={<FaUserMinus />}
            onClick={() => setShowConfirm(true)}
            isLoading={isRemoving}
            aria-label={getRemoveText()}
          />
        </Flex>
      </Box>

      <AlertDialog
        isOpen={showConfirm}
        leastDestructiveRef={cancelRef}
        onClose={() => setShowConfirm(false)}
      >
        <AlertDialogOverlay className="diary-modal-overlay">
          <AlertDialogContent className="diary-modal-content">
            <AlertDialogHeader className="diary-modal-header" fontSize="lg" fontWeight="bold">
              {getRemoveText()}
            </AlertDialogHeader>
            <AlertDialogBody className="diary-modal-body">
              {getConfirmText()}
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setShowConfirm(false)}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleRemove} 
                ml={3}
                isLoading={isRemoving}
              >
                {getRemoveText()}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

const Community = () => {
  const { isOpen: isCloseFriendsOpen, onOpen: onCloseFriendsOpen, onClose: onCloseFriendsClose } = useDisclosure();

  const [communityStats, setCommunityStats] = useState({
    closeFriends: 0
  });

  const [closeFriends, setCloseFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [removingUser, setRemovingUser] = useState(null);

  const toast = useToast();

  // Fetch community stats
  useEffect(() => {
    const fetchCommunityStats = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/myprofile/community/count`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        setCommunityStats({
          closeFriends: data.closeFriends
        });
      } catch (error) {
        console.error("Failed to fetch community stats:", error);
        toast({
          title: "Error",
          description: "Failed to load community stats",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchCommunityStats();
  }, [toast]);



  const fetchCloseFriends = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/myprofile/community/closefriends`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setCloseFriends(data.closeFriends);
    } catch (error) {
      console.error("Failed to fetch close friends:", error);
      toast({
        title: "Error",
        description: "Failed to load close friends",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async (userId, type) => {
    setRemovingUser(userId);
    try {
      let endpoint = '';
      let successMessage = '';
      
      switch (type) {
        case 'follower':
          endpoint = `/api/myprofile/community/followers/${userId}`;
          successMessage = 'Follower removed successfully';
          break;
        case 'following':
          endpoint = `/api/myprofile/community/following/${userId}`;
          successMessage = 'User unfollowed successfully';
          break;
        case 'closefriend':
          endpoint = `/api/myprofile/community/closefriends/${userId}`;
          successMessage = 'Removed from close friends successfully';
          break;
        default:
          throw new Error('Invalid remove type');
      }

      await axios.delete(
        `${process.env.REACT_APP_API_URL}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (type === 'closefriend') {
        setCloseFriends(prev => prev.filter(user => user.id !== userId));
        setCommunityStats(prev => ({ ...prev, closeFriends: prev.closeFriends - 1 }));
      }

      toast({
        title: "Success",
        description: successMessage,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

    } catch (error) {
      console.error(`Failed to remove user:`, error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove user",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setRemovingUser(null);
    }
  };

  const handleCloseFriendsOpen = () => {
    fetchCloseFriends();
    onCloseFriendsOpen();
  };

  return (
    <>
      {/* Community Stats Card */}
<div 
  style={{
    fontFamily: "'Georgia', 'Times New Roman', serif",
    background: '#fefefe',
    borderRadius: '12px',
    border: '1px solid rgba(139, 69, 19, 0.15)',
    boxShadow: '0 2px 8px rgba(139, 69, 19, 0.08)',
    padding: '24px',
    maxWidth: '320px',
    margin: '0 auto',
    transition: 'all 0.2s ease'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 69, 19, 0.12)';
    e.currentTarget.style.transform = 'translateY(-1px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 69, 19, 0.08)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  {/* Header */}
  <div 
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '20px',
      color: '#5d4037'
    }}
  >
    <FaUsers size={18} />
    <h2 
      style={{
        fontSize: '1.1rem',
        fontWeight: '500',
        margin: 0,
        color: '#5d4037'
      }}
    >
      Community
    </h2>
  </div>

  {/* Friends List Card */}
  <div 
    onClick={handleCloseFriendsOpen}
    style={{
      background: '#f8f6f0',
      border: '1px solid rgba(139, 69, 19, 0.1)',
      borderRadius: '8px',
      padding: '18px',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#f5f2ea';
      e.currentTarget.style.borderColor = 'rgba(139, 69, 19, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#f8f6f0';
      e.currentTarget.style.borderColor = 'rgba(139, 69, 19, 0.1)';
    }}
  >
    <div 
      style={{
        color: '#6b5b73',
        fontSize: '0.95rem',
        marginBottom: '8px',
        fontWeight: '400'
      }}
    >
      My Friends List
    </div>
    
    <span 
      style={{
        color: '#8b4513',
        fontSize: '1.8rem',
        fontWeight: '600',
        display: 'block',
        lineHeight: '1'
      }}
    >
      {communityStats.closeFriends.toLocaleString()}
    </span>
  </div>
</div>

      {/* Close Friends Modal */}
      <Modal isOpen={isCloseFriendsOpen} onClose={onCloseFriendsClose} size="xl">
        <ModalOverlay className="diary-modal-overlay" />
        <ModalContent className="diary-modal-content">
          <ModalHeader className="diary-modal-header">
            <HStack>
              <FaUsers />
              <Text>My Friends</Text>
              <span className="diary-badge">
                {communityStats.closeFriends}
              </span>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody className="diary-modal-body" maxH="60vh" overflowY="auto">
            {loading ? (
              <div className="diary-loading">
                <Spinner size="lg" />
                <span className="diary-loading-text">Loading My friends...</span>
              </div>
            ) : closeFriends.length === 0 ? (
              <div className="diary-empty-state">
                <div className="diary-empty-icon">
                  <FaUsers size={48} />
                </div>
                <div className="diary-empty-title">
                  No friends are added yet
                </div>
                <div className="diary-empty-subtitle">
                  Add special people to your inner circle!
                </div>
              </div>
            ) : (
              closeFriends.map(user => (
                <UserCard 
                  key={user.id} 
                  user={user} 
                  onRemove={handleRemoveUser}
                  removeType="closefriend"
                  isRemoving={removingUser === user.id}
                />
              ))
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Community;