// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    List,
    ListItem,
    ListItemText,
    Skeleton,
    Button,
    TextField,
    Card,
    CardMedia,
    CardContent,
    CardActionArea,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

export default function Home() {
    const [stats, setStats] = useState(null);
    const [newsQuery, setNewsQuery] = useState('non-relational databases');
    const [articles, setArticles] = useState(null);

    useEffect(() => {
        axios.get('/api/dashboard-stats')
            .then(({ data }) => setStats(data))
            .catch(() => setStats(null));
        fetchNews(newsQuery);
    }, []);

    const fetchNews = q => {
        setArticles(null);
        axios.get('/api/news', { params: { query: q, limit: 5 } })
            .then(({ data }) => setArticles(data.articles || []))
            .catch(() => setArticles([]));
    };

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>Dashboard</Typography>

            {(stats)
                ? <Grid container spacing={3} mb={4}>
                    {[
                        { label: 'Всего запросов', value: stats.totalQueries },
                        { label: 'Средний результат', value: stats.avgResults },
                        { label: 'Среднее время (с)', value: stats.avgTime },
                        { label: 'Успешность (%)', value: `${stats.successRatePct}%` }
                    ].map((item, idx) => (
                        <Grid item xs={12} md={3} key={idx}>
                            <Paper sx={{ p:2, textAlign:'center' }} elevation={3}>
                                <Typography variant="subtitle2" color="text.secondary">{item.label}</Typography>
                                <Typography variant="h3" sx={{ mt:1 }}>{item.value}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
                : <Skeleton variant="rectangular" width="100%" height={120} sx={{ mb:4 }} />
            }

            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h5">Топ-5 запросов</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {stats?.topQueries?.length
                        ? <List dense>
                            {stats.topQueries.map((q, i) => (
                                <ListItem key={i} divider>
                                    <ListItemText primary={q.query} secondary={`Запросов: ${q.count}`} />
                                </ListItem>
                            ))}
                        </List>
                        : <Typography variant="body2" color="text.secondary">Нет данных для топ-запросов</Typography>
                    }
                </AccordionDetails>
            </Accordion>

            <Accordion sx={{ mt:3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h5">Новости</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            fullWidth
                            size="small"
                            value={newsQuery}
                            onChange={e => setNewsQuery(e.target.value)}
                            placeholder="Тематика новостей"
                        />
                        <Button variant="contained" onClick={() => fetchNews(newsQuery)}>Поиск</Button>
                    </Box>
                    {articles===null
                        ? <Skeleton variant="rectangular" width="100%" height={200}/>
                        : articles.length
                            ? <Grid container spacing={2}>
                                {articles.map((art, idx) => (
                                    <Grid item xs={12} md={6} lg={4} key={idx}>
                                        <Card sx={{ height:'100%' }} elevation={2}>
                                            <CardActionArea href={art.url} target="_blank">
                                                {art.urlToImage && (
                                                    <CardMedia component="img" height="140" image={art.urlToImage} alt={art.title}/>
                                                )}
                                                <CardContent>
                                                    <Typography variant="subtitle1" noWrap>{art.title}</Typography>
                                                    <Typography variant="caption" color="text.secondary" noWrap>{art.source.name} · {new Date(art.publishedAt).toLocaleDateString()}</Typography>
                                                </CardContent>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                            : <Typography variant="body2" color="text.secondary">Не найдено новостей</Typography>
                    }
                </AccordionDetails>
            </Accordion>
        </Box>
    );
}
