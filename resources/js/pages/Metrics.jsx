import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Skeleton,
    Stack,
    CircularProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Легенда для таблиц
function TableLegend() {
    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
                Обозначения:
            </Typography>
            <Typography variant="body2">
                <strong>Low</strong> — минимальное значение,&nbsp;
                <strong>Q1</strong> — первый квартиль,&nbsp;
                <strong>Q3</strong> — третий квартиль,&nbsp;
                <strong>High</strong> — максимальное значение.
            </Typography>
        </Paper>
    );
}

export default function Metrics() {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);
    const [distributions, setDistributions] = useState(null);
    const [distLoading, setDistLoading] = useState(true);

    // Подгружаем распределения из metrics-data
    useEffect(() => {
        axios.get('/api/metrics-data')
            .then(({ data }) => {
                if (data.status === 'success') {
                    setDistributions(data.data.distributions);
                } else {
                    console.error('Error loading distributions', data);
                }
            })
            .catch(console.error)
            .finally(() => setDistLoading(false));
    }, []);

    const handleRunEvaluation = async (force = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = '/api/run-evaluation' + (force ? '?force=1' : '');
            const { data } = await axios.get(url);
            if (data.status === 'success') {
                setMetrics(data.metrics);
            } else {
                setError(data.message || 'Неизвестная ошибка');
            }
        } catch (err) {
            setError('Не удалось выполнить запрос к серверу');
        } finally {
            setLoading(false);
        }
    };

    // Группируем метрики по префиксу
    const groupKeys = (dists) => {
        const groups = {};
        Object.entries(dists).forEach(([metric, vals]) => {
            const [prefix] = metric.split('_');
            if (!groups[prefix]) groups[prefix] = [];
            groups[prefix].push({ metric, ...vals });
        });
        return groups;
    };

    return (
        <Box p={4} bgcolor="background.default">
            <Typography variant="h4" gutterBottom>Search Evaluation Metrics</Typography>

            {/* Распределения */}
            <Typography variant="h5" gutterBottom>Сводные распределения</Typography>
            {distLoading ? (
                <Box textAlign="center" my={4}><CircularProgress/></Box>
            ) : distributions ? (
                <>
                    <TableLegend />
                    {Object.entries(groupKeys(distributions)).map(([group, metricsArr]) => (
                        <Accordion key={group} defaultExpanded sx={{ mb: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="h6">{group}</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <TableContainer component={Paper} sx={{ boxShadow: 2, mb: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Metric</TableCell>
                                                <TableCell align="right">Low</TableCell>
                                                <TableCell align="right">Q1</TableCell>
                                                <TableCell align="right">Q3</TableCell>
                                                <TableCell align="right">High</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {metricsArr.map(row => (
                                                <TableRow key={row.metric}>
                                                    <TableCell>{row.metric}</TableCell>
                                                    <TableCell align="right">{row.low}</TableCell>
                                                    <TableCell align="right">{row.q1}</TableCell>
                                                    <TableCell align="right">{row.q3}</TableCell>
                                                    <TableCell align="right">{row.high}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </>
            ) : (
                <Alert severity="warning">Не удалось загрузить распределения</Alert>
            )}

            {/* Кнопки и старые метрики */}
            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    endIcon={<AssessmentIcon />}
                    onClick={() => handleRunEvaluation(false)}
                    disabled={loading}
                >
                    Run Evaluation
                </Button>
                <Button sx={{ ml: 2 }} onClick={() => handleRunEvaluation(true)} disabled={loading}>
                    Force Refresh
                </Button>
            </Box>

            {/* Легенда для старых таблиц */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Обозначения старых таблиц:
                </Typography>
                <Typography variant="body2">
                    <strong>Ret</strong> — найдено документов,&nbsp;
                    <strong>P</strong> — Precision,&nbsp;
                    <strong>R</strong> — Recall,&nbsp;
                    <strong>F1</strong> — F1-score,&nbsp;
                    <strong>TP/FP/FN/TN</strong> — истинно/ложно-положительные и отрицательные.&nbsp;
                    <strong>ΔF1</strong> — прирост F1 относительно базового режима.
                </Typography>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && (
                <Stack spacing={2}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                        <Accordion key={idx} defaultExpanded>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Skeleton width={300} />
                            </AccordionSummary>
                            <AccordionDetails>
                                {/* Skeleton tables */}
                                <Skeleton variant="rectangular" height={150} />
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Stack>
            )}

            {!loading && metrics?.length > 0 && (
                metrics.map(qres => (
                    <Accordion key={qres.query} defaultExpanded sx={{ mb: 2 }} elevation={1}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="h6">
                                Query: «{qres.query}» (GT = {qres.ground_truth_count})
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {qres.field_sets.map(fs => (
                                <Box key={fs.label} mb={4}>
                                    <Typography variant="subtitle1" gutterBottom>{fs.label}</Typography>
                                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Mode</TableCell>
                                                    <TableCell align="right">Ret</TableCell>
                                                    <TableCell align="right">P</TableCell>
                                                    <TableCell align="right">R</TableCell>
                                                    <TableCell align="right">F1</TableCell>
                                                    <TableCell align="right">TP</TableCell>
                                                    <TableCell align="right">FP</TableCell>
                                                    <TableCell align="right">FN</TableCell>
                                                    <TableCell align="right">TN</TableCell>
                                                    <TableCell align="right">ΔF1</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {fs.results.map(row => (
                                                    <TableRow key={row.mode}>
                                                        <TableCell>{row.mode}</TableCell>
                                                        <TableCell align="right">{row.retrieved}</TableCell>
                                                        <TableCell align="right">{row.precision.toFixed(3)}</TableCell>
                                                        <TableCell align="right">{row.recall.toFixed(3)}</TableCell>
                                                        <TableCell align="right">{row.f1.toFixed(3)}</TableCell>
                                                        <TableCell align="right">{row.tp}</TableCell>
                                                        <TableCell align="right">{row.fp}</TableCell>
                                                        <TableCell align="right">{row.fn}</TableCell>
                                                        <TableCell align="right">{row.tn}</TableCell>
                                                        <TableCell align="right">{row.mode !== 'Basic' ? fs.delta_f1[row.mode].toFixed(3) : '-'}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                ))
            )}
        </Box>
    );
}
