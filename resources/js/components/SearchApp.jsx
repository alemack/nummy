import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button } from '@mui/material';

import SearchControls from './SearchControls';
import QuerySummary from './QuerySummary';
import ResultsList from './ResultsList';
import LoaderSkeleton from './LoaderSkeleton';
import QueryPipelineInfo from './QueryPipelineInfo';
import SampleQueries from './SampleQueries';

export default function SearchApp() {
    const [query, setQuery] = useState('');
    const [expand, setExpand] = useState(true);
    const [useLemmas, setUseLemmas] = useState(true);
    const [highlight, setHighlight] = useState(false);
    const [results, setResults] = useState([]);
    const [expandedTerms, setExpandedTerms] = useState([]);
    const [normalizedTerms, setNormalizedTerms] = useState([]);
    const [articlesCount, setArticlesCount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [duration, setDuration] = useState(null);
    const [page, setPage] = useState(1);
    const [suggestedKeywords, setSuggestedKeywords] = useState([]);
    const [keywordsLoading, setKeywordsLoading] = useState(false);
    const [keywordsError, setKeywordsError] = useState('');

    const handleSuggestKeywords = async () => {
        if (!query.trim()) return;
        setKeywordsLoading(true);
        setSuggestedKeywords([]);
        setKeywordsError('');
        try {
            const resp = await axios.post('http://127.0.0.1:8000/api/suggest-keywords', { topic: query });
            setSuggestedKeywords(resp.data.keywords ?? []);
        } catch (e) {
            setKeywordsError('Ошибка получения ключевых слов');
            setSuggestedKeywords([]);
        } finally {
            setKeywordsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setResults([]);
        setExpandedTerms([]);
        setNormalizedTerms([]);
        setArticlesCount(null);
        setDuration(null);

        try {
            const response = await axios.get('http://127.0.0.1:8000/api/search', {
                params: { q: query, expand, lemmas: useLemmas }
            });

            const data = response.data;

            setResults(data.results || []);
            setExpandedTerms(data.expanded_terms ?? []);
            setNormalizedTerms(data.normalized_terms ?? []);
            setArticlesCount(data.results?.length ?? 0);
            setDuration(data.duration ?? null);
            setPage(1);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setArticlesCount(0);
            setDuration(null);
        } finally {
            setLoading(false);
        }
    };

    const highlightTerms = expandedTerms.map(t => t.term ?? t);

    return (
        <>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                <TextField
                    fullWidth
                    label="Enter search query"
                    variant="outlined"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Button
                    variant="outlined"
                    onClick={handleSuggestKeywords}
                    disabled={!query.trim() || keywordsLoading}
                >
                    {keywordsLoading ? "Подбор..." : "Suggest keywords"}
                </Button>
            </Box>

            {suggestedKeywords.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {suggestedKeywords.map((word, i) => (
                        <Button
                            key={i}
                            variant="contained"
                            size="small"
                            onClick={() => setQuery(word)}
                        >
                            {word}
                        </Button>
                    ))}
                </Box>
            )}

            {keywordsError && (
                <Typography color="error" sx={{ mb: 2 }}>{keywordsError}</Typography>
            )}

            <SampleQueries onSelect={val => setQuery(val)} />

            <SearchControls
                expand={expand}
                setExpand={setExpand}
                useLemmas={useLemmas}
                setUseLemmas={setUseLemmas}
                highlight={highlight}
                setHighlight={setHighlight}
            />

            <Box mt={2} textAlign="center">
                <Button variant="contained" onClick={handleSearch} size="large">
                    Search
                </Button>
            </Box>

            <QueryPipelineInfo
                query={query}
                normalizedTerms={normalizedTerms}
                expandedTerms={expandedTerms}
                expand={expand}
                useLemmas={useLemmas}
            />

            <QuerySummary
                articlesCount={articlesCount}
                duration={duration}
                loading={loading}
            />

            <Box mt={2}>
                {loading ? (
                    <LoaderSkeleton />
                ) : (
                    <ResultsList
                        results={results}
                        highlight={highlight}
                        highlightTerms={highlightTerms}
                    />
                )}
            </Box>
        </>
    );
}


