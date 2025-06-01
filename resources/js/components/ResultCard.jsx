import React from 'react';
import { Card, CardContent, Typography, Stack, Chip, Button, Box } from '@mui/material';
import highlightText from "@/utils/highlightText.jsx";
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

export default function ResultCard({ item, highlight, highlightTerms }) {
    const navigate = useNavigate();

    // Обработка клика — переход на детальную страницу
    const handleClick = (e) => {
        e.stopPropagation();
        // ObjectId в Mongo может быть как строкой, так и объектом: {_id: { $oid: "..." }}
        const id = item._id?.$oid || item._id;
        navigate(`/article/${id}`);
    };

    return (
        <Card variant="outlined" sx={{ mb: 3, cursor: 'pointer' }} onClick={handleClick}>
            <CardContent>
                {/* Заголовок */}
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {highlight ? highlightText(item.title, highlightTerms) : item.title}
                </Typography>
                {/* Категория и дата */}
                <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                    {item.primary_category && (
                        <Chip label={item.primary_category} color="info" size="small" />
                    )}
                    <Typography variant="caption" color="text.secondary">
                        {item.date && dayjs(item.date).format('YYYY-MM-DD')}
                    </Typography>
                </Stack>
                {/* Авторы */}
                {item.authors && item.authors.length > 0 && (
                    <Typography variant="body2" color="text.secondary" mb={1} noWrap>
                        {item.authors.join(', ')}
                    </Typography>
                )}
                {/* Abstract */}
                <Typography variant="body2" mt={1} mb={1}>
                    {highlight ? highlightText(item.abstract, highlightTerms) : item.abstract}
                </Typography>
                {/* Теги */}
                {item.tags?.length > 0 && (
                    <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
                        {item.tags.map((tag, i) => (
                            <Chip
                                key={i}
                                label={highlight ? highlightText(tag, highlightTerms) : tag}
                                color="secondary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Stack>
                )}
                {/* Score и Подробнее */}
                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary">
                        Relevance: {item.score}
                    </Typography>
                    <Button
                        variant="text"
                        size="small"
                        onClick={handleClick}
                        sx={{ fontWeight: 600 }}
                    >
                        Подробнее
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );
}
