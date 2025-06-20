import { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
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
  Grid,
  GridItem,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  useToast,
  Spinner
} from '@chakra-ui/react';
import { 
  FaHeart, 
  FaEye, 
  FaCalendarCheck, 
  FaUsers, 
  FaUserPlus,
  FaMapMarkerAlt,
  FaEdit,
  FaBookOpen,
  FaUser,
  FaClock,
  FaFeatherAlt,
  FaSave,
  FaTimes,
  FaSignOutAlt,
} from 'react-icons/fa';
import './css/myprofile.css'
import axios from 'axios';
import Community from './me/community';
import JournalPDFDownload from './pdfdownload';

const UserProfile = () => {
  const [currentid,setCurrentid]=useState('');
  const [currentusername,setCurrentusername]=useState('');
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const [userData, setUserData] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    profileImage: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const toast = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/api/myprofile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUserData(data);
        setCurrentid(data._id);
        setCurrentusername(data.username);
        // Initialize edit form with current data
        setEditFormData({
          name: data.name || '',
          username: data.username || '',
          bio: data.bio || '',
          location: data.location || '',
          profileImage: data.profileImage || ''
        });
        setPreviewImage(data.profileImage || null);
        setImageFile(null);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            window.location.href = '/login';  // Navigate to login
      }
    };

    fetchUserData();
  }, [toast]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      setImageFile(file);
      // Clear the URL field when uploading a file
      setEditFormData(prev => ({
        ...prev,
        profileImage: ''
      }));
    }
  };

  const handleRemoveImage = () => {
    setPreviewImage(null);
    setImageFile(null);
    setEditFormData(prev => ({
      ...prev,
      profileImage: ''
    }));
    const fileInput = document.querySelector('.photo-input');
    if (fileInput) fileInput.value = '';
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // If user enters a URL, clear the uploaded image
    if (field === 'profileImage' && value.trim()) {
      setPreviewImage(value);
      setImageFile(null);
      const fileInput = document.querySelector('.photo-input');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setIsUpdating(true);
    try {
      let updatedData = { ...editFormData };
      
      // If there's an image file to upload, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const imageResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/upload/profile-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        updatedData.profileImage = imageResponse.data.imageUrl;
      }
      
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/myprofile`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update local userData with the response
      setUserData(data);
      
      toast({
        title: "Success!",
        description: "Your profile has been updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      
      onEditClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditOpen = () => {
    // Reset form data to current userData when opening modal
    setEditFormData({
      name: userData.name || '',
      username: userData.username || '',
      bio: userData.bio || '',
      location: userData.location || '',
      profileImage: userData.profileImage || ''
    });
    setPreviewImage(userData.profileImage || null);
    setImageFile(null);
    onEditOpen();
  };

  if (!userData) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner size="xl" color="#1e40af" />
        <Text ml={4} color="#1e40af">Loading your profile...</Text>
      </Flex>
    );
  }

  const handleLogout = () => {
  // Clear auth token or user data from localStorage or your auth context
  localStorage.removeItem('token'); // or whatever key you're using

  // Redirect to login or home page
  window.location.href = '/login'; // or use useNavigate from react-router-dom
};


  return (
    <>
      <div className="profile-container-mp">
        <div className="profile-main-mp">
          {/* Left Sidebar - Stats */}
          <div className="stats-sidebar-mp">
              {/* <div className="diary-card-mp">
                <div className="notebook-lines-mp"></div>
                <div className="margin-line-mp"></div>
                <div className="card-content-mp">
                  <Text className="stat-number-mp">
                    {userData.totalReads === 0 ? '✨' : Math.round(userData.totalReads / 2).toLocaleString()}
                  </Text>
                  <Text className="stat-label-mp">
                    {userData.totalReads === 0 ? 'Your first story awaits readers' : 'Interactions made through stories'}
                  </Text>
                </div>
              </div>
            <div className="diary-card-mp">
              <div className="notebook-lines-mp"></div>
              <div className="margin-line-mp"></div>
              <div className="card-content-mp">
                <Text className="stat-number-mp">
                  {userData.totalLikes === 0 ? '💝' : userData.totalLikes.toLocaleString()}
                </Text>
                <Text className="stat-label-mp">
                  {userData.totalLikes === 0 ? 'Share your story to touch hearts' : 'People loved your words'}
                </Text>
              </div>
            </div> */}

            {/* Writing Consistency
            <div className="diary-card-mp">
              <div className="notebook-lines-mp"></div>
              <div className="margin-line-mp"></div>
              <div className="card-content-mp">
                <Text className="stat-number-mp">
                  {userData.consistency === 0 ? '✍️' : `${userData.consistency}%`}
                </Text>
                <Text className="stat-label-mp">
                  {userData.consistency === 0 ? 'Start your writing streak today' : 'Consistency'}
                </Text>
                <Text className="stat-help-mp">
                  {userData.consistency === 0 ? 'Write something, anything!' : 'Keep the ink flowing'}
                </Text>
              </div>
            </div> */}
          <Community />
          {/* Feedback Link (minimal design) */}
            <a
              href="https://forms.gle/dmeBC6Gr8jdhjwP47"
              target="_blank" // Opens the link in a new tab
              rel="noopener noreferrer" // Recommended for security when using target="_blank"
              style={{
                display: 'block', // Makes it occupy its own line
                marginTop: '16px', // Adds some space from the element above
                padding: '8px 12px',
                 // Very light blue background
                color: '#1e40af', // Darker blue text color
                border: '1px solid #bfdbfe', // Light blue border
                borderRadius: '0.375rem', // Rounded corners
                textAlign: 'center',
                textDecoration: 'none', // Remove underline
                fontSize: '0.875rem', // Smaller font size
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#dbeafe'; // Lighter blue on hover
                e.currentTarget.style.borderColor = '#93c5fd';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderColor = '#bfdbfe';
              }}
            >
              Give Feedback
            </a>
      </div>

          {/* Right Side - User Profile */}
          <div className="profile-card-mp">
            <div className="notebook-lines-mp"></div>
            <div className="margin-line-mp"></div>
            <div className="profile-content-mp">
              {/* Profile Header */}
              <VStack align="center" spacing={4} mb={6}>
                <Avatar size="2xl" src={userData.profileImage} className="profile-avatar-mp" />
                <Box textAlign="center">
                  <Text className="profile-name-mp">{userData.name}</Text>
                  <Text className="profile-username-mp">@{userData.username}</Text>
                </Box>
              </VStack>

              {/* Meta Information */}
              <VStack align="flex-start" spacing={2} mb={6}>
                {userData.location && (
                  <div className="profile-meta-mp">
                    <FaMapMarkerAlt size={14} />
                    <Text>{userData.location}</Text>
                  </div>
                )}
                <div className="profile-meta-mp">
                  <FaClock size={14} />
                  <Text>
                    Writing since {new Date(userData.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                </div>
              </VStack>

              {/* Bio */}
              <Box mb={6}>
                <Text fontSize="1.125rem" fontWeight="500" color="#1e3a8a" mb={3}>About My Journey</Text>
                <Text className="profile-bio-mp">{userData.bio || "No bio added yet. Share your writing journey with others!"}</Text>
              </Box>

              

              {/* Writing Milestones */}
              <Box>
                <Text fontSize="1.125rem" fontWeight="500" color="#1e3a8a" mb={4}>Writing Milestones</Text>
                <Grid templateColumns="repeat(auto-fit, minmax(120px, 1fr))" gap={4}>
                  <Box textAlign="center" p={4} bg="rgba(59, 130, 246, 0.05)" borderRadius="0.375rem" border="1px solid rgba(59, 130, 246, 0.1)">
                    <Text fontSize="1.5rem" fontWeight="bold" color="#1e40af">
                      {userData.totalReads === 0 ? '✨' : userData.totalReads.toLocaleString()}
                    </Text>
                    <Text fontSize="0.8rem" color="rgba(30, 64, 175, 0.7)">
                      {userData.totalReads === 0 ? 'Start sharing...' : 'Total Reads'}
                    </Text>
                  </Box>
                  <Box textAlign="center" p={4} bg="rgba(59, 130, 246, 0.05)" borderRadius="0.375rem" border="1px solid rgba(59, 130, 246, 0.1)">
                    <Text fontSize="1.5rem" fontWeight="bold" color="#1e40af">
                      {userData.totalLikes === 0 ? '✨' : userData.totalLikes.toLocaleString()}
                    </Text>
                    <Text fontSize="0.8rem" color="rgba(30, 64, 175, 0.7)">
                      {userData.totalLikes === 0 ? 'Hearts Coming' : 'Hearts'}
                    </Text>
                  </Box>
                  {/* <Box textAlign="center" p={4} bg="rgba(59, 130, 246, 0.05)" borderRadius="0.375rem" border="1px solid rgba(59, 130, 246, 0.1)">
                    <Text fontSize="1.5rem" fontWeight="bold" color="#1e40af">
                      {userData.consistency === 0 ? '✨' : `${userData.consistency}%`}
                    </Text>
                    <Text fontSize="0.8rem" color="rgba(30, 64, 175, 0.7)">
                      {userData.consistency === 0 ? 'Start writing to know about your consistency' : 'Consistency'}
                    </Text>
                  </Box> */}
                  
                </Grid>
                <JournalPDFDownload 
                  userId={currentid}
                  userName={currentusername}
                  visibilityOptions={[
                    { value: 'private', icon: '🔒', label: 'Private' },
                    { value: 'close-circle', icon: '👥', label: 'Close Circle' }
                  ]}
                />
              </Box>
              {/* Action Buttons */}
              <Box mb={6}>
                <button className="journal-button-mp" onClick={handleEditOpen}>
                  <FaEdit size={14} />
                  Edit Profile
                </button>
              </Box>
              <Box>
                <button className="journal-button-mp logout-button-mp" onClick={handleLogout}>
                  <FaSignOutAlt size={14} />
                  Logout
                </button>
              </Box>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
          <ModalOverlay bg="rgba(59, 130, 246, 0.1)" />
          <ModalContent bg="linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)" border="1px solid rgba(59, 130, 246, 0.1)">
            <ModalHeader color="#1e3a8a" fontFamily="Georgia, serif">
              <HStack>
                <FaEdit />
                <Text>Edit Your Journal Profile</Text>
              </HStack>
            </ModalHeader>
            <ModalCloseButton color="#1e40af" />
            <ModalBody pb={6}>
              <VStack spacing={4}>
                {/* Profile Image Section */}
                <FormControl>
                  <FormLabel color="#1e3a8a" fontWeight="500">Profile Image</FormLabel>
                  
                  {/* Current/Preview Image */}
                  <Flex direction="column" align="center" mb={4}>
                    <Avatar 
                      size="xl" 
                      src={previewImage || userData.profileImage} 
                      mb={3}
                      border="2px solid rgba(59, 130, 246, 0.2)"
                    />
                    
                    {/* Upload Button */}
                    <HStack spacing={2} mb={3}>
                      <Button
                        as="label"
                        htmlFor="profile-image-upload"
                        size="sm"
                        bg="#1e40af"
                        color="white"
                        _hover={{ bg: "#1e3a8a" }}
                        cursor="pointer"
                      >
                        Upload New Image
                      </Button>
                      {(previewImage || imageFile) && (
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="rgba(239, 68, 68, 0.5)"
                          color="#dc2626"
                          _hover={{ bg: "rgba(239, 68, 68, 0.05)" }}
                          onClick={handleRemoveImage}
                        >
                          Remove
                        </Button>
                      )}
                    </HStack>
                    
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="photo-input-mp"
                      style={{ display: 'none' }}
                    />
                    
                    <Text fontSize="xs" color="rgba(30, 64, 175, 0.6)" textAlign="center">
                      Upload an image or use URL below
                    </Text>
                  </Flex>

                  {/* URL Input as Alternative */}
                  <Box>
                    <Text fontSize="sm" color="#1e3a8a" mb={2}>Or paste image URL:</Text>
                    <Input
                      value={editFormData.profileImage}
                      onChange={(e) => handleEditInputChange('profileImage', e.target.value)}
                      placeholder="https://example.com/your-image.jpg"
                      borderColor="rgba(59, 130, 246, 0.3)"
                      _focus={{ borderColor: "#1e40af", boxShadow: "0 0 0 1px #1e40af" }}
                      size="sm"
                    />
                  </Box>
                </FormControl>

                {/* Name */}
                <FormControl>
                  <FormLabel color="#1e3a8a" fontWeight="500">Name</FormLabel>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => handleEditInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    borderColor="rgba(59, 130, 246, 0.3)"
                    _focus={{ borderColor: "#1e40af", boxShadow: "0 0 0 1px #1e40af" }}
                  />
                </FormControl>

                {/* Username */}
                <FormControl>
                  <FormLabel color="#1e3a8a" fontWeight="500">Username</FormLabel>
                  <Input
                    value={editFormData.username}
                    onChange={(e) => handleEditInputChange('username', e.target.value)}
                    placeholder="your_username"
                    borderColor="rgba(59, 130, 246, 0.3)"
                    _focus={{ borderColor: "#1e40af", boxShadow: "0 0 0 1px #1e40af" }}
                  />
                </FormControl>

                {/* Location */}
                <FormControl>
                  <FormLabel color="#1e3a8a" fontWeight="500">Location</FormLabel>
                  <Input
                    value={editFormData.location}
                    onChange={(e) => handleEditInputChange('location', e.target.value)}
                    placeholder="Your city, country"
                    borderColor="rgba(59, 130, 246, 0.3)"
                    _focus={{ borderColor: "#1e40af", boxShadow: "0 0 0 1px #1e40af" }}
                  />
                </FormControl>

                {/* Bio */}
                <FormControl>
                  <FormLabel color="#1e3a8a" fontWeight="500">About Your Journey</FormLabel>
                  <Textarea
                    value={editFormData.bio}
                    onChange={(e) => handleEditInputChange('bio', e.target.value)}
                    placeholder="Share your writing journey, inspirations, or what drives your creativity..."
                    rows={4}
                    maxLength={500}
                    borderColor="rgba(59, 130, 246, 0.3)"
                    _focus={{ borderColor: "#1e40af", boxShadow: "0 0 0 1px #1e40af" }}
                  />
                  <Text fontSize="sm" color="rgba(30, 64, 175, 0.6)" mt={1}>
                    {editFormData.bio.length}/500 characters
                  </Text>
                </FormControl>

                {/* Action Buttons */}
                <HStack spacing={3} width="100%" justify="flex-end" mt={6}>
                  <Button
                    variant="outline"
                    borderColor="rgba(59, 130, 246, 0.3)"
                    color="#1e40af"
                    _hover={{ bg: "rgba(59, 130, 246, 0.05)" }}
                    onClick={onEditClose}
                    leftIcon={<FaTimes />}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg="#1e40af"
                    color="white"
                    _hover={{ bg: "#1e3a8a" }}
                    onClick={handleSaveProfile}
                    isLoading={isUpdating}
                    loadingText="Saving..."
                    leftIcon={<FaSave />}
                  >
                    Save Changes
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </>
  );
};

export default UserProfile;