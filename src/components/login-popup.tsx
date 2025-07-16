import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Input,
  Button,
  Text,
  VStack,
  Checkbox,
  Dialog,
  useBreakpointValue
} from "@chakra-ui/react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { getPb } from "../pocketbaseUtils";

interface LoginPopupProps {
  onLoginSuccess: () => void;
}

const EMAIL_STORAGE_KEY = "calendo-remembered-email";

export default function LoginPopup({ onLoginSuccess }: LoginPopupProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const isMobile = useBreakpointValue({ base: true, md: false });
  const pb = getPb();

  // Load saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberEmail(true);
    }
  }, []);

  // Handle remember email checkbox change
  const handleRememberEmailChange = (checked: boolean) => {
    setRememberEmail(checked);
    if (!checked) {
      localStorage.removeItem(EMAIL_STORAGE_KEY);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await pb.collection("users").authWithPassword(formData.email, formData.password);
      if (pb.authStore.isValid) {
        // Save email if remember checkbox is checked
        if (rememberEmail) {
          localStorage.setItem(EMAIL_STORAGE_KEY, formData.email);
        }
        onLoginSuccess();
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const dialogSize = isMobile ? "full" : "md";

  return (
    <Dialog.Root open={true} size={dialogSize}>
      <Dialog.Positioner>
        <Dialog.Content
          maxW={isMobile ? "100vw" : "400px"}
          w={isMobile ? "100vw" : "400px"}
          h={isMobile ? "100vh" : "auto"}
          maxH={isMobile ? "100vh" : "auto"}
        >
          <Dialog.Header p={6} pb={0}>
            <Dialog.Title textAlign="center" color="gray.700">
              Calendo Login
            </Dialog.Title>
          </Dialog.Header>

          <Dialog.Body
            p={6}
            display="flex"
            flexDirection="column"
            justifyContent={isMobile ? "center" : "flex-start"}
            flex={isMobile ? "1" : "auto"}
          >
            <form onSubmit={handleSubmit}>
              <VStack gap={4} w="100%">
                <Box w="100%">
                  <Text mb={2} color="gray.600">
                    Email
                  </Text>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    borderRadius="lg"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    color="black"
                    borderColor={error ? "red.500" : "inherit"}
                    disabled={isLoading}
                    _hover={{
                      borderColor: error ? "red.600" : "inherit",
                    }}
                    _focus={{
                      borderColor: error ? "red.500" : "blue.500",
                      boxShadow: error ? "0 0 0 1px #E53E3E" : "0 0 0 1px #3182ce",
                    }}
                    required
                  />
                </Box>

                <Box w="100%">
                  <Text mb={2} color="gray.600">
                    Password
                  </Text>
                  <Flex position="relative" direction="column">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      borderRadius="lg"
                      value={formData.password}
                      color="black"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      borderColor={error ? "red.500" : "inherit"}
                      disabled={isLoading}
                      _hover={{
                        borderColor: error ? "red.600" : "inherit",
                      }}
                      _focus={{
                        borderColor: error ? "red.500" : "blue.500",
                        boxShadow: error ? "0 0 0 1px #E53E3E" : "0 0 0 1px #3182ce",
                      }}
                      required
                    />
                    <Button
                      position="absolute"
                      right={1}
                      top="50%"
                      transform="translateY(-50%)"
                      variant="ghost"
                      size="xs"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.400"
                      disabled={isLoading}
                      _hover={{ color: "gray.600" }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </Button>
                  </Flex>
                </Box>

                <Box w="100%">
                  <Checkbox.Root
                    checked={rememberEmail}
                    onCheckedChange={(details) => handleRememberEmailChange(Boolean(details.checked))}
                    disabled={isLoading}
                    colorScheme="blue"
                  >
                    <Checkbox.Control />
                    <Checkbox.Label>
                      <Text fontSize="sm" color="gray.600">
                        Remember my email
                      </Text>
                    </Checkbox.Label>
                  </Checkbox.Root>
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="full"
                  size="lg"
                  borderRadius="lg"
                  boxShadow="md"
                  loading={isLoading}
                  disabled={isLoading}
                  _hover={{
                    transform: isLoading ? "none" : "translateY(-1px)",
                    boxShadow: isLoading ? "md" : "lg",
                  }}
                >
                  <FiLock style={{ marginRight: "0.5rem" }} />
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>

                {error && (
                  <Text color="red.500" fontSize="sm" mt={2} textAlign="center">
                    {error}
                  </Text>
                )}
              </VStack>
            </form>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}