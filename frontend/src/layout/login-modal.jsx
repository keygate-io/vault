import { Button, VStack, Text, HStack, Separator } from '@chakra-ui/react'
import { FcGoogle } from 'react-icons/fc'
import { FaApple } from 'react-icons/fa'
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogTitle,
  DialogTrigger,
  DialogCloseTrigger,
} from '../components/ui/dialog'
import { useColorModeValue } from '@/components/ui/color-mode'

export function LoginModal({ children }) {
  const bgColor = useColorModeValue('white', 'gray.900') // Darker background for dark mode
  const borderColor = useColorModeValue('gray.200', 'gray.800')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const subtleTextColor = useColorModeValue('gray.500', 'gray.400')

  return (
    <DialogRoot zIndex={30000000}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        bg={bgColor}
        maxW="400px"
        mx="auto"
        borderRadius="2xl" // Slightly rounded corners for a modern look
        boxShadow="lg" // Subtle shadow for depth
        border="1px"
        borderColor={borderColor}
        zIndex={30000000}
      >
        {/* Header */}
        <DialogHeader>
          <DialogTitle
            textAlign="center"
            fontSize="2xl"
            fontWeight="semibold" // Use semibold instead of bold for a cleaner look
            color={textColor}
          >
            Sign In
          </DialogTitle>
          <DialogCloseTrigger />
        </DialogHeader>

        {/* Body */}
        <DialogBody pb={6}>
          <VStack spacing={6} align="stretch">
            {/* Description */}
            <Text
              textAlign="center"
              fontSize="sm"
              color={subtleTextColor}
              lineHeight="1.5"
            >
              Choose your preferred sign-in method
            </Text>

            {/* Buttons */}
            <VStack spacing={4}>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  /* TODO: Implement Google sign in */
                }}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
                borderColor={borderColor}
                color={textColor}
              >
                <FcGoogle size={20} />
                Continue with Google
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  /* TODO: Implement Apple sign in */
                }}
                _hover={{ bg: useColorModeValue('gray.100', 'gray.800') }}
                borderColor={borderColor}
                color={textColor}
              >
                <FaApple size={20} />
                Continue with Apple
              </Button>
            </VStack>

            {/* Separator */}
            <HStack spacing={4} justify="center" mt={4}>
              <Separator borderColor={borderColor} />
              <Text fontSize="xs" color={subtleTextColor}>
                or
              </Text>
              <Separator borderColor={borderColor} />
            </HStack>

            {/* Footer */}
            <Text
              fontSize="xs"
              color={subtleTextColor}
              textAlign="center"
              mt={4}
            >
              By continuing, you agree to our{' '}
              <Text as="span" color={useColorModeValue('blue.600', 'blue.400')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text as="span" color={useColorModeValue('blue.600', 'blue.400')}>
                Privacy Policy
              </Text>
            </Text>
          </VStack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  )
}