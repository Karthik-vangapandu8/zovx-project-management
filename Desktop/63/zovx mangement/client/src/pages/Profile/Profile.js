import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';

const Profile = () => {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Manage your account settings and preferences
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            User Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This page will include:
            <br />• Personal information editing
            <br />• Password management
            <br />• Notification preferences
            <br />• Profile picture upload
            <br />• Activity history
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 