// pages/Dictionary.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export default function Dictionary() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Synonym Dictionary
            </Typography>
            <Typography>
                This page will show the loaded synonym dictionary and allow inspection or editing in the future.
            </Typography>
        </Box>
    );
}
