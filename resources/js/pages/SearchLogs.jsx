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
    Skeleton,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

export default function SystemLogs() {
    const [logs, setLogs]       = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);
    const [filter, setFilter]   = useState('');
    const [summary, setSummary] = useState(null);
    const [summaryError, setSummaryError] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    // Новые состояния для сводки по последним 10 уникальным запросам
    const [perQuery, setPerQuery] = useState([]);
    const [loadingPerQuery, setLoadingPerQuery] = useState(false);
    const [errorPerQuery, setErrorPerQuery] = useState(null);

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

    const fetchSummary = async () => {
        setLoadingSummary(true);
        setSummaryError(null);
        try {
            const res = await axios.get('/api/search-logs-summary');
            setSummary(res.data);
        } catch (e) {
            setSummaryError('Не удалось получить метрики по логам');
        } finally {
            setLoadingSummary(false);
        }
    };

    // Новый API для уникальных запросов
    const fetchPerQuerySummary = async () => {
        setLoadingPerQuery(true);
        setErrorPerQuery(null);
        try {
            const res = await axios.get('/api/search-logs-summary-per-query');
            setPerQuery(res.data.queries || []);
        } catch (e) {
            setErrorPerQuery('Не удалось получить сводку по уникальным запросам');
        } finally {
            setLoadingPerQuery(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchSummary();
        fetchPerQuerySummary();
    }, []);

    const filtered = logs.filter(log =>
        log.query.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Search Query Logs
            </Typography>

            {/* Summary block */}
            <Box mb={3}>
                <Typography variant="h5" gutterBottom>
                    Статистика по логам поиска
                </Typography>
                {summaryError && (
                    <Alert severity="error" sx={{ mb: 2 }}>{summaryError}</Alert>
                )}
                {loadingSummary ? (
                    <Skeleton width={600} height={60} />
                ) : summary ? (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Всего запросов:</strong> {summary.total} &nbsp;&nbsp;
                            <strong>Среднее число найденных:</strong> {summary.avgResults} &nbsp;&nbsp;
                            <strong>Среднее время (сек):</strong> {summary.avgTime}
                        </Typography>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Режим</TableCell>
                                        <TableCell align="right">Запросов</TableCell>
                                        <TableCell align="right">Средний результат</TableCell>
                                        <TableCell align="right">Среднее время</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(summary.modes).map(([label, val]) => (
                                        <TableRow key={label}>
                                            <TableCell>{label}</TableCell>
                                            <TableCell align="right">{val.count}</TableCell>
                                            <TableCell align="right">{val.avgResults}</TableCell>
                                            <TableCell align="right">{val.avgTime}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                ) : null}
            </Box>

            {/* Новый блок по уникальным запросам — с Accordion */}
            <Box mb={3}>
                <Typography variant="h5" gutterBottom>
                    Сравнение режимов для последних 10 уникальных запросов
                </Typography>
                {errorPerQuery && (
                    <Alert severity="error" sx={{ mb: 2 }}>{errorPerQuery}</Alert>
                )}
                {loadingPerQuery ? (
                    <Skeleton width={900} height={80} />
                ) : perQuery.length > 0 ? (
                    <Paper sx={{ p: 2, mb: 2 }}>
                        {perQuery.map((item, idx) => (
                            <Accordion key={item.query} sx={{ mb: 1 }} defaultExpanded={idx === 0}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="subtitle1">
                                        <strong>Запрос:</strong>{' '}
                                        <span style={{fontFamily: "monospace"}}>{item.query}</span>
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Режим</TableCell>
                                                    <TableCell align="right">Кол-во</TableCell>
                                                    <TableCell align="right">Средний результат</TableCell>
                                                    <TableCell align="right">Медиана результата</TableCell>
                                                    <TableCell align="right">Среднее время</TableCell>
                                                    <TableCell align="right">Медиана времени</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {Object.entries(item.modes).map(([mode, val]) => (
                                                    <TableRow key={mode}>
                                                        <TableCell>{mode}</TableCell>
                                                        <TableCell align="right">{val.count}</TableCell>
                                                        <TableCell align="right">{val.avgResults}</TableCell>
                                                        <TableCell align="right">{val.medResults}</TableCell>
                                                        <TableCell align="right">{val.avgTime}</TableCell>
                                                        <TableCell align="right">{val.medTime}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Paper>
                ) : null}
            </Box>

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
                            ? Array.from({ length: 8 }).map((_, rowIdx) => (
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
