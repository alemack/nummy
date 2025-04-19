// components/ResultsList.jsx
import React, { useState, useMemo } from 'react';
import { Typography, Box, Pagination } from '@mui/material';
import LoaderSkeleton from './LoaderSkeleton';
import ResultCard from './ResultCard';

const RESULTS_PER_PAGE = 10;

export default function ResultsList({ loading, results, highlight, highlightTerms }) {
    const [page, setPage] = useState(1);

    const paginatedResults = useMemo(() => {
        const start = (page - 1) * RESULTS_PER_PAGE;
        return results.slice(start, start + RESULTS_PER_PAGE);
    }, [results, page]);

    const totalPages = Math.ceil(results.length / RESULTS_PER_PAGE);

    if (loading) {
        return (
            <>
                {Array.from({ length: 5 }).map((_, i) => (
                    <LoaderSkeleton key={i} />
                ))}
            </>
        );
    }

    if (results.length === 0) {
        return (
            <Typography align="center" color="text.secondary" mt={4}>
                Search results will appear here...
            </Typography>
        );
    }

    return (
        <>
            {paginatedResults.map((item, index) => (
                <ResultCard
                    key={index}
                    item={item}
                    highlight={highlight}
                    highlightTerms={highlightTerms}
                />
            ))}

            {totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, value) => setPage(value)}
                        color="primary"
                        shape="rounded"
                    />
                </Box>
            )}
        </>
    );
}
