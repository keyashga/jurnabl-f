import {
  Box, Button, FormControl, FormLabel, Input, Text, VStack, Heading, useToast,
} from '@chakra-ui/react'
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const { token } = useParams()
  const toast = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/reset-password/${token}`, {
        password,
      })
      toast({ status: 'success', title: 'Password reset successful' })
      navigate('/login')
    } catch (err) {
      toast({ status: 'error', title: err.response?.data?.message || 'Reset failed' })
    }
  }

  return (
    <Box maxW="md" mx="auto" mt={20} p={6} bg="white" boxShadow="md" borderRadius="md">
      <Heading mb={4}>Reset Password</Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">Reset Password</Button>
        </VStack>
      </form>
    </Box>
  )
}
