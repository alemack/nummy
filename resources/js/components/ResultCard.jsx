// ResultCard.jsx
import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';
import highlightText from "@/utils/highlightText.jsx";

export default function ResultCard({ item, highlight, highlightTerms }) {
    return (
        <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" fontWeight="bold">
                    {highlight ? highlightText(item.title, highlightTerms) : item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Relevance: {item.score}
                </Typography>
                <Typography variant="body2" mt={2}>
                    {highlight ? highlightText(item.abstract, highlightTerms) : item.abstract}
                </Typography>
                {item.tags?.length > 0 && (
                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                        {item.tags.map((tag, i) => (
                            <Chip
                                key={i}
                                label={highlight ? highlightText(tag, highlightTerms) : tag}
                                color="secondary"
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}
