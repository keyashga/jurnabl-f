import { Box, Button, Flex, Heading, Input, Link, Stack, Text, useToast } from '@chakra-ui/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, { username, password });
      localStorage.setItem('token', data.token);
      toast({ title: 'Login successful', status: 'success', duration: 2000 });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error?.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/google`;
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box bg="white" p={8} rounded="md" shadow="md" w="sm">
        <Heading mb={6} textAlign="center">Login</Heading>
        <Stack spacing={4}>
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          
          <Text
            fontSize="sm"
            color="blue.500"
            mt={1}
            textAlign="right"
            cursor="pointer"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot password?
          </Text>

          <Button colorScheme="blue" onClick={handleLogin}>Login</Button>

          <Text textAlign="center">or</Text>

          <Button variant="outline" colorScheme="red" onClick={handleGoogleLogin}>
            Login with Google
          </Button>

          <Text textAlign="center">
            Don't have an account?{' '}
            <Link color="blue.500" onClick={() => navigate('/signup')}>
              Sign Up
            </Link>
          </Text>
        </Stack>
      </Box>
    </Flex>
  );
}
