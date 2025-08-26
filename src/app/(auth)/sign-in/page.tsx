import { SignIn } from '@clerk/nextjs';
import { Container, Box, Typography } from '@mui/material';

export default function SignInPage() {
  return (
    <Container maxWidth="sm" className="py-8">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="calc(100vh - 200px)"
        gap={4}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          textAlign="center"
          className="text-gray-800 mb-4"
        >
          Welcome Back
        </Typography>
        <Typography 
          variant="body1" 
          textAlign="center"
          className="text-gray-600 mb-6"
        >
          Sign in to your E-Commerce AI account
        </Typography>
        <SignIn 
          appearance={{
            elements: {
              card: "shadow-lg border-0",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            }
          }}
        />
      </Box>
    </Container>
  );
}