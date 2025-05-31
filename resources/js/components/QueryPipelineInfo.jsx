import React, { useState, useMemo } from 'react';
import { Box, Typography, Chip, Stack, IconButton, Collapse, Tooltip } from '@mui/material';
import { ChevronRight, ChevronDown, Info } from 'lucide-react';

// Группировка терминов по имени
function groupTermsWithWeights(expandedTerms) {
    const grouped = {};
    for (const t of expandedTerms) {
        const term = t.term ?? t;
        const weight = t.weight ?? null;
        if (!grouped[term]) {
            grouped[term] = { weights: [], count: 0 };
        }
        if (weight !== null) grouped[term].weights.push(weight);
        grouped[term].count += 1;
    }
    return grouped;
}

export default function QueryPipelineInfo({ query, normalizedTerms, expandedTerms, expand, useLemmas }) {
    const [open, setOpen] = useState(false);

    const groupedExpanded = useMemo(() => groupTermsWithWeights(expandedTerms), [expandedTerms]);

    if (!query.trim()) return null;

    return (
        <Box mt={2} sx={{ p: 2, background: 'rgba(0,0,0,0.05)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
                <IconButton size="small">
                    {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </IconButton>
                <Typography variant="subtitle2">
                    Query processing steps
                </Typography>
                <Tooltip title="Click to expand/collapse details" arrow>
                    <Info size={16} style={{ marginLeft: 4, color: "#888" }} />
                </Tooltip>
            </Box>
            <Collapse in={open}>
                <Stack spacing={1} mt={1}>
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            <b>Original query:</b> <span style={{ fontFamily: "monospace" }}>{query}</span>
                        </Typography>
                    </Box>
                    {useLemmas && (
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                <b>After lemmatization:</b>
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                {normalizedTerms.length
                                    ? normalizedTerms.map((term, i) => (
                                        <Chip key={i} label={term} size="small" color="info" />
                                    ))
                                    : <Typography variant="caption" color="text.disabled">No lemmatized terms</Typography>}
                            </Stack>
                        </Box>
                    )}
                    {expand && (
                        <Box>
                            <Typography variant="body2" color="text.secondary">
                                <b>After expansion (with synonyms):</b>
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {Object.entries(groupedExpanded).length > 0
                                    ? Object.entries(groupedExpanded).map(([term, info], i) => (
                                        <Chip
                                            key={i}
                                            label={
                                                <>
                                                    {term}
                                                    {' '}
                                                    {info.weights.length > 0 && (
                                                        <span style={{ fontSize: '0.75em', opacity: 0.7 }}>
                                                            (w:
                                                            {info.weights.map(w => w.toFixed(3)).join(',')}
                                                            {info.count > 1 ? `, ×${info.count}` : ''}
                                                            )
                                                        </span>
                                                    )}
                                                </>
                                            }
                                            size="small"
                                            color="secondary"
                                        />
                                    ))
                                    : <Typography variant="caption" color="text.disabled">No expanded terms</Typography>}
                            </Stack>
                        </Box>
                    )}
                </Stack>
            </Collapse>
        </Box>
    );
}
