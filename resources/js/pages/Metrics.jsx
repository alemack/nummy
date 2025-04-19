// pages/Metrics.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Metrics() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Metrics Dashboard
            </Typography>
            <Typography>
                This page will display user search metrics, success rates, and query graphs.
            </Typography>
        </Box>
    );
}
