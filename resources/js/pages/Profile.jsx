// pages/Profile.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Profile() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                User Profile
            </Typography>
            <Typography>
                This page will contain user-specific settings, activity, and profile information.
            </Typography>
        </Box>
    );
}
