// src/pages/Dictionary.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    IconButton,
    Button,
    Stack,
    CircularProgress,
    Skeleton
} from '@mui/material';
import { Save, Edit, Cancel, Add } from '@mui/icons-material';
import axios from 'axios';

export default function Dictionary() {
    const [dict, setDict] = useState(null);
    const [editing, setEditing] = useState({}); // { term: [ [syn, weight], ... ] }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDict();
    }, []);

    const fetchDict = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/synonyms');
            if (res.data.status === 'success') {
                setDict(res.data.synonyms);
            } else {
                setError(res.data.message || 'Не удалось загрузить словарь');
            }
        } catch (e) {
            setError('Ошибка при запросе к серверу');
        } finally {
            setLoading(false);
        }
    };

    const startEdit = term => {
        setEditing(ed => ({
            ...ed,
            [term]: dict[term].map(([s,w]) => [s, w])
        }));
    };

    const cancelEdit = term => {
        setEditing(ed => {
            const nxt = { ...ed };
            delete nxt[term];
            return nxt;
        });
    };

    const saveTerm = async term => {
        try {
            const syns = editing[term];
            await axios.put(`/api/synonyms/${encodeURIComponent(term)}`, { synonyms: syns });
            setDict(d => ({ ...d, [term]: syns }));
            cancelEdit(term);
        } catch (e) {
            alert('Не удалось сохранить: ' + (e.response?.data?.message || e.message));
        }
    };

    const updateSyn = (term, idx, field, value) => {
        setEditing(ed => {
            const arr = ed[term].slice();
            arr[idx][field === 'syn' ? 0 : 1] =
                field === 'weight' ? parseFloat(value) || 0 : value;
            return { ...ed, [term]: arr };
        });
    };

    const addRow = term => {
        setEditing(ed => ({
            ...ed,
            [term]: [...ed[term], ['', 0]]
        }));
    };

    // Рендер "скелетон"-таблицы на время загрузки
    const renderSkeleton = () => (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {['Term','Synonym','Weight','Actions'].map((h) => (
                            <TableCell key={h}><Skeleton width={h === 'Term' ? 100 : 60} /></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <TableRow key={idx}>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton /></TableCell>
                            <TableCell><Skeleton width={40} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Synonym Dictionary
            </Typography>

            {loading && <CircularProgress sx={{ mt: 2 }} />}

            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

            {!loading && !dict && !error && (
                <Typography>Нет данных для отображения.</Typography>
            )}

            {!loading && dict && (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Term</TableCell>
                                <TableCell>Synonym</TableCell>
                                <TableCell align="right">Weight</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.entries(dict).map(([term, syns]) => {
                                const isEditing = editing.hasOwnProperty(term);
                                const rows = isEditing ? editing[term] : syns;
                                return rows.map(([syn, w], idx) => (
                                    <TableRow key={`${term}-${idx}`}>
                                        {idx === 0 && (
                                            <TableCell rowSpan={rows.length} sx={{ fontWeight: 'bold' }}>
                                                {term}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {isEditing
                                                ? (
                                                    <TextField
                                                        size="small"
                                                        value={syn}
                                                        onChange={e => updateSyn(term, idx, 'syn', e.target.value)}
                                                    />
                                                )
                                                : (syn || <em>—</em>)
                                            }
                                        </TableCell>
                                        <TableCell align="right">
                                            {isEditing
                                                ? (
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ step: 0.01 }}
                                                        value={w}
                                                        onChange={e => updateSyn(term, idx, 'weight', e.target.value)}
                                                    />
                                                )
                                                : w.toFixed(4)
                                            }
                                        </TableCell>
                                        {idx === 0 && (
                                            <TableCell rowSpan={rows.length} align="center">
                                                {isEditing ? (
                                                    <Stack direction="row" spacing={1} justifyContent="center">
                                                        <IconButton size="small" color="primary" onClick={() => saveTerm(term)}>
                                                            <Save />
                                                        </IconButton>
                                                        <IconButton size="small" color="inherit" onClick={() => cancelEdit(term)}>
                                                            <Cancel />
                                                        </IconButton>
                                                        <IconButton size="small" color="secondary" onClick={() => addRow(term)}>
                                                            <Add />
                                                        </IconButton>
                                                    </Stack>
                                                ) : (
                                                    <IconButton size="small" onClick={() => startEdit(term)}>
                                                        <Edit />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ));
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Если изначально dict ещё не пришёл, но loading уже false */}
            {loading && renderSkeleton()}
        </Box>
    );
}
