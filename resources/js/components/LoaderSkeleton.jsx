// LoaderSkeleton.jsx
import React from 'react';
import { Box, Card, CardContent, Skeleton } from '@mui/material';

export default function LoaderSkeleton({ count = 5 }) {
    return (
        <Box mt={2}>
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                        <Skeleton variant="text" height={30} width="60%" />
                        <Skeleton variant="text" height={20} width="30%" />
                        <Skeleton variant="rectangular" height={80} />
                        <Box mt={2}>
                            <Skeleton variant="rectangular" height={30} width="40%" />
                        </Box>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
}
