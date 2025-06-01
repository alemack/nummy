import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Paper, Chip, Stack, Divider, Link, CircularProgress, Grid, IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import dayjs from 'dayjs';

export default function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`http://127.0.0.1:8000/api/article/${id}`)
            .then(resp => setArticle(resp.data))
            .catch(() => setArticle(null))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading)
        return <CircularProgress sx={{ mt: 8, mx: 'auto', display: 'block' }} />;
    if (!article)
        return <Typography color="error" align="center" sx={{ mt: 8 }}>Статья не найдена</Typography>;

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
            <Paper sx={{ p: { xs: 2, sm: 4 } }}>
                <Box mb={2} display="flex" alignItems="center" gap={1}>
                    <IconButton onClick={() => navigate(-1)} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        Назад к поиску
                    </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold" mb={2}>{article.title}</Typography>

                <Stack direction="row" spacing={2} mb={2} alignItems="center" flexWrap="wrap">
                    {article.primary_category && (
                        <Chip label={article.primary_category} color="info" />
                    )}
                    {article.date && (
                        <Typography color="text.secondary">
                            {dayjs(article.date).format('YYYY-MM-DD')}
                        </Typography>
                    )}
                    {article.lang && (
                        <Chip label={article.lang.toUpperCase()} size="small" variant="outlined" />
                    )}
                    {article.arxiv_id && (
                        <Link
                            href={`https://arxiv.org/abs/${article.arxiv_id.replace('arXiv:', '')}`}
                            target="_blank"
                            underline="hover"
                            sx={{ ml: 1 }}
                        >
                            {`arXiv:${article.arxiv_id.replace('arXiv:', '')}`}
                        </Link>
                    )}
                </Stack>

                {article.authors && article.authors.length > 0 && (
                    <Typography variant="subtitle1" color="text.secondary" mb={1}>
                        <b>Авторы:</b> {article.authors.join(', ')}
                    </Typography>
                )}
                {article.affiliations && article.affiliations.length > 0 && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        <b>Аффилиации:</b> {article.affiliations.join('; ')}
                    </Typography>
                )}
                {article.journal_ref && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        <b>Журнал:</b> {article.journal_ref}
                    </Typography>
                )}
                {article.comment && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                        <b>Комментарий:</b> {article.comment}
                    </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Typography variant="body1" mb={3}>{article.abstract}</Typography>

                {/* Categories/tags */}
                <Stack direction="row" spacing={1} mb={2} flexWrap="wrap">
                    {article.categories?.map(cat =>
                        <Chip key={cat} label={cat} size="small" color="info" variant="outlined" />
                    )}
                    {article.tags?.map(tag =>
                        <Chip key={tag} label={tag} size="small" color="secondary" variant="outlined" />
                    )}
                </Stack>

                <Grid container spacing={2} sx={{ mt: 2 }} alignItems="center">
                    {article.doi && (
                        <Grid item>
                            <Link
                                href={`https://doi.org/${article.doi}`}
                                target="_blank"
                                rel="noopener"
                                underline="hover"
                            >
                                DOI: {article.doi}
                            </Link>
                        </Grid>
                    )}
                    {article.pdf_url && (
                        <Grid item>
                            <Link href={article.pdf_url} target="_blank" rel="noopener" underline="hover">
                                📄 Скачать PDF
                            </Link>
                        </Grid>
                    )}
                    {article.updated && (
                        <Grid item>
                            <Typography variant="caption" color="text.secondary">
                                Обновлено: {dayjs(article.updated).format('YYYY-MM-DD')}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Box>
    );
}
