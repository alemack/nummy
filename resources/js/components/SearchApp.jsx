import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Container,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Chip,
    Card,
    CardContent,
    Stack,
    CssBaseline,
    createTheme,
    ThemeProvider,
    IconButton,
    Alert,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Search, AutoAwesome, Language } from '@mui/icons-material';

const highlightText = (text, terms) => {
    if (!terms || terms.length === 0) return text;

    const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return parts.map((part, i) =>
        pattern.test(part) ? (
            <span key={i} style={{ backgroundColor: 'yellow' }}>{part}</span>
        ) : (
            part
        )
    );
};

export default function SearchApp() {
    const [query, setQuery] = useState('');
    const [expand, setExpand] = useState(true);
    const [useLemmas, setUseLemmas] = useState(true);
    const [highlight, setHighlight] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [results, setResults] = useState([]);
    const [expandedTerms, setExpandedTerms] = useState([]);
    const [normalizedTerms, setNormalizedTerms] = useState([]);
    const [articlesCount, setArticlesCount] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) return;

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/search', {
                params: { q: query, expand, lemmas: useLemmas }
            });

            setResults(response.data.results);
            setExpandedTerms(response.data.expanded_terms ?? []);
            setNormalizedTerms(response.data.normalized_terms ?? []);
            setArticlesCount(response.data.results.length);
        } catch (error) {
            console.error('Search error:', error);
        }

    };

    const highlightTerms = expandedTerms.map(t => t.term ?? t);

    const theme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            background: {
                default: darkMode ? grey[900] : '#fff',
            }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="md" sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h4" align="left" gutterBottom fontWeight="bold">
                        Intellectual Search
                    </Typography>
                    <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                        {darkMode ? <Brightness7 /> : <Brightness4 />}
                    </IconButton>
                </Box>

                {/* Slogan */}
                <Box mt={2} mb={4} sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary' }}>
                    <Typography variant="h6">
                        "Explore Smarter, Not Just Faster"
                    </Typography>
                </Box>

                <Box mt={4}>
                    <TextField
                        fullWidth
                        label="Enter search query"
                        variant="outlined"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </Box>

                <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                        control={<Checkbox checked={expand} onChange={() => setExpand(!expand)} />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AutoAwesome fontSize="small" />
                                Expand query (auto-suggestions)
                            </Box>
                        }
                    />
                    <FormControlLabel
                        control={<Checkbox checked={useLemmas} onChange={() => setUseLemmas(!useLemmas)} />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Language fontSize="small" />
                                Use Lemmatization (semantic search)
                            </Box>
                        }
                    />
                    <FormControlLabel
                        control={<Checkbox checked={highlight} onChange={() => setHighlight(!highlight)} />}
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Search fontSize="small" />
                                Highlight matches
                            </Box>
                        }
                    />
                </Box>

                <Box mt={2} textAlign="center">
                    <Button variant="contained" onClick={handleSearch} size="large">
                        Search
                    </Button>
                </Box>

                {/* Results Count */}
                {articlesCount !== null && (
                    <Box mt={3}>
                        <Alert severity="info" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                            {articlesCount > 0
                                ? `Found ${articlesCount} articles matching your query.`
                                : 'No articles found for your query.'}
                        </Alert>
                    </Box>
                )}

                {/* Normalized Terms */}
                {normalizedTerms.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Normalized Query:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                            {normalizedTerms.map((term, idx) => (
                                <Chip key={idx} label={term} variant="outlined" />
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Expanded Terms */}
                {expandedTerms.length > 0 && (
                    <Box mt={4}>
                        <Typography variant="subtitle1" color="text.secondary">
                            Expanded Query:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                            {expandedTerms.map((item, idx) => {
                                const term = typeof item === 'string' ? item : item.term;
                                const weight = typeof item === 'string' ? null : item.weight;
                                const alpha = weight != null ? Math.max(0.2, weight) : 0.2;
                                const backgroundColor = `rgba(33, 150, 243, ${alpha})`;
                                const textColor = weight != null && weight < 0.6 ? 'black' : 'white';

                                return (
                                    <Chip
                                        key={idx}
                                        label={weight != null ? `${term} (${weight.toFixed(2)})` : term}
                                        variant="filled"
                                        sx={{
                                            backgroundColor: weight != null ? backgroundColor : 'transparent',
                                            color: weight != null ? textColor : 'default',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                );
                            })}
                        </Stack>
                    </Box>
                )}

                {/* Results */}
                <Box mt={2}>
                    {results.length > 0 ? (
                        results.map((item, index) => (
                            <Card key={index} variant="outlined" sx={{ mb: 3 }}>
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
                        ))
                    ) : (
                        <Typography align="center" color="text.secondary" mt={4}>
                            Search results will appear here...
                        </Typography>
                    )}
                </Box>
            </Container>
        </ThemeProvider>
    );
}
