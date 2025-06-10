import {
  Box,
  Text,
  Heading,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import {
  FaPenFancy,
  FaBookReader,
  FaHeart,
  FaUserFriends,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const userName = 'Writer'; // Replace with actual user name
  const navigate = useNavigate();

  return (
    <Box minH="100vh" bgGradient="linear(to-br, purple.600, purple.800)" py={12} px={6}>
      <VStack spacing={8} align="center" textAlign="center">
        <Heading size="2xl" color="white">
          Welcome back, {userName}! ✨
        </Heading>

        <Text fontSize="lg" color="purple.100" maxW="2xl">
          Your diary entries are stored securely and are never shared without your permission. 
          Write with confidence — your thoughts are safe with us.
        </Text>

        {/* Go to My Diary Button */}
        <Button
          colorScheme="whiteAlpha"
          variant="outline"
          size="lg"
          onClick={() => navigate('/my-diary')}
        >
          Go to My Diary
        </Button>

        <Box w="full" maxW="5xl">
          <Heading size="lg" color="white" mb={4}>
            How to Get Started
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <UsageCard
              icon={FaPenFancy}
              title="Write Your Story"
              description="My Diary > Start writing your thoughts, experiences, and dreams. Every word counts!"
            />
            <UsageCard
              icon={FaBookReader}
              title="Read what your Peers Write"
              description="My friends > Explore stories from fellow writers. Get inspired and find your voice."
            />
            <UsageCard
              icon={FaHeart}
              title="React & Encourage"
              description="Send hearts to stories you love...."
            />
            <UsageCard
              icon={FaUserFriends}
              title="Connect with Friends"
              description="Search for friends in the search bar > Become friends to share your writing journey."
            />
          </SimpleGrid>
        </Box>
      </VStack>
    </Box>
  );
}

function UsageCard({ icon, title, description }) {
  return (
    <Box
      bg="whiteAlpha.100"
      border="1px solid"
      borderColor="whiteAlpha.300"
      borderRadius="xl"
      p={6}
      _hover={{ bg: 'whiteAlpha.200', transform: 'translateY(-2px)', boxShadow: 'lg' }}
      transition="0.3s ease"
    >
      <HStack spacing={4}>
        <Icon as={icon} boxSize={8} color="white" />
        <VStack align="start" spacing={1}>
          <Text fontSize="xl" fontWeight="bold" color="white">
            {title}
          </Text>
          <Text fontSize="sm" color="purple.100">
            {description}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}
