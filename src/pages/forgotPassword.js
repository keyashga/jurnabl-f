import {
  Box, Button, FormControl, FormLabel, Input, Text, VStack, Heading, useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import axios from 'axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const toast = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/forgot-password`, { email })
      toast({ status: 'success', title: 'Reset link sent to your email' })
    } catch (err) {
      toast({ status: 'error', title: err.response?.data?.message || 'Error sending email' })
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={20} p={6} bg="white" boxShadow="md" borderRadius="md">
      <Heading mb={4}>Forgot Password</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Email address</FormLabel>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">Send Reset Link</Button>
        </VStack>
      </form>
    </Box>
  )
}
