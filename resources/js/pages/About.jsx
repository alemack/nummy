// pages/About.jsx
import React from 'react';
import { Typography, Box } from '@mui/material';

export default function About() {
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                About This Project
            </Typography>
            <Typography>
                This system implements intelligent semantic search over scientific articles using NLP methods, query expansion, and lemmatization.
            </Typography>
        </Box>
    );
}
