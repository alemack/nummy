import React, { useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
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
    Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AssessmentIcon from '@mui/icons-material/Assessment';
import axios from 'axios';

function Legend() {
    return (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
                Обозначения:
            </Typography>
            <Typography variant="body2">
                <strong>Ret</strong> — найдено документов,&nbsp;
                <strong>P</strong> — Precision,&nbsp;
                <strong>R</strong> — Recall,&nbsp;
                <strong>F1</strong> — F1-score,&nbsp;
                <strong>TP/FP/FN/TN</strong> — истинно/ложно-положительные и
                отрицательные.&nbsp;
                <strong>ΔF1</strong> — прирост F1 относительно базового режима.
            </Typography>
        </Paper>
    );
}

export default function Metrics() {
    const [loading, setLoading] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [error, setError] = useState(null);

    const handleRunEvaluation = async (force = false) => {
        setLoading(true);
        setError(null);
        try {
            const url = '/api/run-evaluation' + (force ? '?force=1' : '');
            const response = await axios.get(url);
            if (response.data.status === 'success') {
                setMetrics(response.data.metrics);
            } else {
                setError(response.data.message || 'Неизвестная ошибка');
            }
        } catch (e) {
            setError('Не удалось выполнить запрос к серверу');
        } finally {
            setLoading(false);
        }
    };

    const renderFieldSet = (fs) => (
        <Box key={fs.label} mb={4}>
            <Typography variant="subtitle1" gutterBottom>
                {fs.label}
            </Typography>
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
                        {fs.results.map((row) => (
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
                                <TableCell align="right">
                                    {row.mode !== 'Basic' ? fs.delta_f1[row.mode].toFixed(3) : '-'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <Box p={4} bgcolor="background.default">
            <Typography variant="h4" gutterBottom>
                Search Evaluation Metrics
            </Typography>

            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    variant="contained"
                    endIcon={
                        loading ? <CircularProgress size={20} color="inherit" /> : <AssessmentIcon />
                    }
                    onClick={() => handleRunEvaluation(false)}
                    disabled={loading}
                >
                    {loading ? 'Running...' : 'Run Evaluation'}
                </Button>
                <Button
                    sx={{ ml: 2 }}
                    onClick={() => handleRunEvaluation(true)}
                    disabled={loading}
                >
                    Force Refresh
                </Button>
            </Box>

            <Legend />

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {metrics?.map((qres) => (
                <Accordion key={qres.query} defaultExpanded sx={{ mb: 2 }} elevation={1}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">
                            Query: «{qres.query}» (GT = {qres.ground_truth_count})
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {qres.field_sets.map(renderFieldSet)}
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
}
