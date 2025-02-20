import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Flex, Input, Button, Heading, Text, Stack, Separator } from "@chakra-ui/react";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { getPb } from "../pocketbaseUtils";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const pb = getPb();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await pb.collection("users").authWithPassword(formData.email, formData.password);
      if (pb.authStore.isValid) {
        navigate("/");
      }
    } catch (error) {
      setError("Invalid email or password. Please try again.");
      console.log(error);
    }
  };

  return (
    <Flex h="100vh" w="100vw" bg="gray.50" align="center" justify="center" p={4}>
      <Box bg="white" p={8} borderRadius="xl" boxShadow="xl" w="100%" maxW="md">
        <Heading as="h1" size="xl" mb={8} textAlign="center" color="gray.700">
          Calendo Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <Stack>
            <Box>
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
            <Box mb="2">
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
                  color="gray.200"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
              </Flex>
            </Box>
            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              size="lg"
              borderRadius="lg"
              boxShadow="md"
              _hover={{
                transform: "translateY(-1px)",
                boxShadow: "lg",
              }}
            >
              <FiLock />
              Sign In
            </Button>
            {error && (
              <Text color="red.500" fontSize="sm" mt={1} textAlign={"center"}>
                {error}
              </Text>
            )}
          </Stack>
        </form>
        <Separator marginY={4} />
        <Text mt={6} textAlign="center" color="gray.600">
          Registration opens soon...
        </Text>
      </Box>
    </Flex>
  );
}
