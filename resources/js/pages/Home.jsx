import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Home() {
    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Future metrics dashboard: user activity, search success rates, query statistics.
            </Typography>
        </Box>
    );
}
