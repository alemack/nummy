// src/pages/SystemLogs.jsx
import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    TextField,
    Button,
    Skeleton
} from '@mui/material';
import axios from 'axios';

export default function SystemLogs() {
    const [logs, setLogs]       = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [filter, setFilter]   = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/search-logs?limit=200');
            setLogs(res.data.logs);
        } catch (e) {
            setError('Не удалось загрузить логи поиска');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filtered = logs.filter(log =>
        log.query.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Search Query Logs
            </Typography>

            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <TextField
                    label="Поиск по запросу"
                    size="small"
                    value={filter}
                    onChange={e => setFilter(e.target.value)}
                    disabled={loading}
                />
                <Button variant="outlined" onClick={fetchLogs} disabled={loading}>
                    Refresh
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Time</TableCell>
                            <TableCell>Query</TableCell>
                            <TableCell>Expand</TableCell>
                            <TableCell>Lemmas</TableCell>
                            <TableCell align="right">Results</TableCell>
                            <TableCell align="right">Duration (s)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading
                            ? // пока грузим, отрисовываем 8 строк со скелетонами
                            Array.from({ length: 8 }).map((_, rowIdx) => (
                                <TableRow key={rowIdx}>
                                    <TableCell colSpan={6}>
                                        <Skeleton
                                            variant="rectangular"
                                            width="100%"
                                            height={20}
                                            animation="wave"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                            : filtered.map(log => (
                                <TableRow key={log._id}>
                                    <TableCell>
                                        {new Date(log.created_at).toLocaleString()}
                                    </TableCell>
                                    <TableCell>{log.query}</TableCell>
                                    <TableCell>{log.expanded ? '✔️' : '—'}</TableCell>
                                    <TableCell>{log.lemmas ? '✔️' : '—'}</TableCell>
                                    <TableCell align="right">{log.result_count}</TableCell>
                                    <TableCell align="right">{log.duration.toFixed(3)}</TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

