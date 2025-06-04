import React from 'react';
import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';

const ProjectDetails = () => {
  const { id } = useParams();

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Project Details
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Detailed view for project ID: {id}
      </Typography>
      <Typography variant="body2" sx={{ mt: 2 }}>
        This page will show comprehensive project details, tasks, team members, timeline, and analytics.
      </Typography>
    </Box>
  );
};

export default ProjectDetails; 