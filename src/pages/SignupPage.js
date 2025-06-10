import { Box, Button, Flex, Heading, Input, Link, Stack, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleSignup = async () => {
    if (!email.endsWith('@gmail.com')) {
      toast({
        title: 'Invalid Email',
        description: 'Please use a Gmail address (must end with @gmail.com)',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        name,
        username,
        email,
        password,
      });

      toast({
        title: 'Signup successful',
        description: 'Please login to continue.',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });

      navigate('/login');
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error?.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="md" w="sm">
        <Heading mb={6} textAlign="center">Sign Up</Heading>
        <Stack spacing={4}>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Box>
            <Input
              placeholder="Gmail (must end with @gmail.com)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            
          </Box>
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

          <Button colorScheme="blue" onClick={handleSignup}>Sign Up</Button>

          <Text textAlign="center">or</Text>

          <Button variant="outline" colorScheme="red" onClick={handleGoogleLogin}>
            Login with Google
          </Button>

          <Text textAlign="center">
            Already have an account?{' '}
            <Link color="blue.500" onClick={() => navigate('/login')}>
              Login
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}
