// components/SearchControls.jsx
import React from 'react';
import { Checkbox, FormControlLabel, Box } from '@mui/material';
import { Sparkles, Languages, Search } from 'lucide-react';

export default function SearchControls({ expand, setExpand, useLemmas, setUseLemmas, highlight, setHighlight }) {
    return (
        <Box mt={2} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
                control={<Checkbox checked={expand} onChange={() => setExpand(!expand)} />}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Sparkles size={16} />
                        Expand query (auto-suggestions)
                    </Box>
                }
            />
            <FormControlLabel
                control={<Checkbox checked={useLemmas} onChange={() => setUseLemmas(!useLemmas)} />}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Languages size={16} />
                        Use Lemmatization (semantic search)
                    </Box>
                }
            />
            <FormControlLabel
                control={<Checkbox checked={highlight} onChange={() => setHighlight(!highlight)} />}
                label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Search size={16} />
                        Highlight matches
                    </Box>
                }
            />
        </Box>
    );
}
