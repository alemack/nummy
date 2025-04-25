// src/pages/SystemLogs.jsx
import React, { useEffect, useState, useRef } from 'react';
import {
    Box,
    Typography,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Button,
    Collapse,
    IconButton,
    CircularProgress
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert } from '@mui/material';
import axios from 'axios';

export default function SystemLogs() {
    const [logs, setLogs] = useState([]);
    const [levelFilter, setLevelFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const resp = await axios.get('/api/logs'); // ваш контроллер
            setLogs(resp.data.logs);
        } catch (e) {
            setError('Не удалось загрузить логи');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        // авто-обновление раз в 30 секунд
        intervalRef.current = setInterval(fetchLogs, 30000);
        return () => clearInterval(intervalRef.current);
    }, []);

    // применяем фильтры
    const filtered = logs.filter(log => {
        if (levelFilter !== 'all' && log.level !== levelFilter) return false;
        if (search && !log.message.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                System Logs
            </Typography>

            <Box display="flex" alignItems="center" mb={2} gap={2}>
                <FormControl size="small">
                    <InputLabel>Level</InputLabel>
                    <Select
                        value={levelFilter}
                        label="Level"
                        onChange={e => setLevelFilter(e.target.value)}
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="info">Info</MenuItem>
                        <MenuItem value="warning">Warning</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                    </Select>
                </FormControl>

                <TextField
                    size="small"
                    label="Search message"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchLogs}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={18} /> : 'Refresh'}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell width="15%">Time</TableCell>
                            <TableCell width="10%">Level</TableCell>
                            <TableCell>Message</TableCell>
                            <TableCell width="5%"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((log, idx) => (
                            <LogRow key={idx} log={log} />
                        ))}
                        {filtered.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Нет записей</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

function LogRow({ log }) {
    const [open, setOpen] = useState(false);
    const colorMap = {
        info: 'info.main',
        warning: 'warning.main',
        error: 'error.main'
    };

    return (
        <>
            <TableRow>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                    <Typography sx={{ color: colorMap[log.level] || 'text.primary' }}>
                        {log.level.toUpperCase()}
                    </Typography>
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                    {log.details && (
                        <IconButton size="small" onClick={() => setOpen(o => !o)}>
                            {open ? '−' : '+'}
                        </IconButton>
                    )}
                </TableCell>
            </TableRow>
            {log.details && (
                <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box p={2} bgcolor="background.paper" fontFamily="monospace" fontSize={12}>
                                {log.details}
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}
