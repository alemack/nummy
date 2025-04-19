// QuerySummary.jsx
import React from 'react';
import { Box, Alert, Typography } from '@mui/material';

export default function QuerySummary({ articlesCount, duration, loading }) {
    if (loading || articlesCount === null) return null;

    return (
        <>
            <Box mt={3}>
                <Alert
                    severity={articlesCount > 0 ? 'info' : 'warning'}
                    sx={{ fontSize: '1rem', fontWeight: 'bold' }}
                >
                    {articlesCount > 0
                        ? `Found ${articlesCount} articles matching your query.`
                        : 'No articles found for your query.'}
                </Alert>
            </Box>

            {duration !== null && (
                <Typography variant="body2" color="text.secondary" align="center" mt={1}>
                    Search completed in <strong>{duration}</strong> seconds.
                </Typography>
            )}
        </>
    );
}
