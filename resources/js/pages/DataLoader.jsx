import React, { useState } from 'react';
import { Box, Button, Typography, Paper, LinearProgress, Alert } from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import axios from 'axios';

export default function DataLoader() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const [normalizing, setNormalizing] = useState(false);
    const [normalizeResult, setNormalizeResult] = useState(null);

    const [importingNormalized, setImportingNormalized] = useState(false);
    const [importNormalizedResult, setImportNormalizedResult] = useState(null);

    // Новое: состояние для генерации синонимов
    const [buildingSynonyms, setBuildingSynonyms] = useState(false);
    const [buildSynonymsResult, setBuildSynonymsResult] = useState(null);

    // 1. Загрузка статей с arXiv (Python)
    const handleLoadData = async () => {
        setLoading(true);
        setError('');
        setSuccess(false);
        try {
            await axios.post('http://127.0.0.1:8000/api/data-loader/run');
            setSuccess(true);
        } catch (e) {
            setError('Ошибка при запуске загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    // 2. Импорт arxiv_dataset.json в базу articles (Mongo)
    const handleImport = async () => {
        setImporting(true);
        setImportResult(null);
        setError('');
        try {
            const resp = await axios.post('http://127.0.0.1:8000/api/data-loader/import');
            setImportResult(`Импортировано статей: ${resp.data.imported}`);
        } catch (e) {
            setError('Ошибка при импорте статей');
        } finally {
            setImporting(false);
        }
    };

    // 3. Экспорт articles + нормализация (Python)
    const handleExportAndNormalize = async () => {
        setNormalizing(true);
        setNormalizeResult(null);
        setError('');
        try {
            const resp = await axios.post('http://127.0.0.1:8000/api/data-loader/export-and-normalize');
            setNormalizeResult(`Экспортировано и нормализовано статей: ${resp.data.exported}`);
        } catch (e) {
            setError('Ошибка при экспорте и нормализации');
        } finally {
            setNormalizing(false);
        }
    };

    // 4. Импорт normalized_articles.json в базу normalized_articles (Mongo)
    const handleImportNormalized = async () => {
        setImportingNormalized(true);
        setImportNormalizedResult(null);
        setError('');
        try {
            const resp = await axios.post('http://127.0.0.1:8000/api/data-loader/import-normalized');
            setImportNormalizedResult(`Импортировано нормализованных статей: ${resp.data.imported}`);
        } catch (e) {
            setError('Ошибка при импорте нормализованных статей');
        } finally {
            setImportingNormalized(false);
        }
    };

    // 5. Генерация синонимов
    const handleBuildSynonyms = async () => {
        setBuildingSynonyms(true);
        setBuildSynonymsResult(null);
        setError('');
        try {
            const resp = await axios.post('http://127.0.0.1:8000/api/data-loader/build-synonyms');
            setBuildSynonymsResult(resp.data.message || 'Синонимы успешно сгенерированы!');
        } catch (e) {
            setError('Ошибка при генерации синонимов');
        } finally {
            setBuildingSynonyms(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', mt: 5 }}>
            <Paper elevation={2} sx={{ p: 4 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CloudDownloadIcon color="primary" fontSize="large" />
                    <Typography variant="h5" fontWeight="bold">
                        Data Loader
                    </Typography>
                </Box>
                <Typography variant="body1" mb={3}>
                    Здесь вы можете поэтапно запускать загрузку, импорт и обработку статей из arXiv и MongoDB. Просто нажмите нужную кнопку для выполнения соответствующего шага пайплайна.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLoadData}
                        disabled={loading || importing || normalizing || importingNormalized || buildingSynonyms}
                        size="large"
                    >
                        {loading ? 'Загрузка...' : 'Стартовать загрузку данных'}
                    </Button>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleImport}
                        disabled={importing || loading || normalizing || importingNormalized || buildingSynonyms}
                        size="large"
                    >
                        {importing ? 'Импорт...' : 'Импортировать в базу'}
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={handleExportAndNormalize}
                        disabled={normalizing || loading || importing || importingNormalized || buildingSynonyms}
                        size="large"
                    >
                        {normalizing ? 'Экспорт и нормализация...' : 'Экспорт + нормализация'}
                    </Button>
                    <Button
                        variant="contained"
                        color="info"
                        onClick={handleImportNormalized}
                        disabled={importingNormalized || loading || importing || normalizing || buildingSynonyms}
                        size="large"
                    >
                        {importingNormalized ? 'Импорт нормализованных...' : 'Импортировать нормализованные'}
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleBuildSynonyms}
                        disabled={buildingSynonyms || loading || importing || normalizing || importingNormalized}
                        size="large"
                    >
                        {buildingSynonyms ? 'Генерация синонимов...' : 'Построить синонимы'}
                    </Button>
                </Box>

                {/* ...отображение прогрессбаров... */}
                {(loading || importing || normalizing || importingNormalized || buildingSynonyms) && (
                    <LinearProgress sx={{ my: 2 }} color={
                        loading ? 'primary' :
                            importing ? 'secondary' :
                                normalizing ? 'success' :
                                    importingNormalized ? 'info' : 'warning'
                    } />
                )}

                {loading && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>
                        Загрузка данных... Пожалуйста, подождите, это может занять несколько минут.
                    </Typography>
                )}
                {importing && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>
                        Импорт в базу... Пожалуйста, подождите.
                    </Typography>
                )}
                {normalizing && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>
                        Экспорт и нормализация... Пожалуйста, подождите.
                    </Typography>
                )}
                {importingNormalized && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>
                        Импорт нормализованных статей... Пожалуйста, подождите.
                    </Typography>
                )}
                {buildingSynonyms && (
                    <Typography align="center" color="text.secondary" sx={{ mt: 1 }}>
                        Генерация словаря синонимов... Пожалуйста, подождите.
                    </Typography>
                )}

                {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        Загрузка завершена успешно!
                    </Alert>
                )}
                {importResult && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {importResult}
                    </Alert>
                )}
                {normalizeResult && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {normalizeResult}
                    </Alert>
                )}
                {importNormalizedResult && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {importNormalizedResult}
                    </Alert>
                )}
                {buildSynonymsResult && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                        {buildSynonymsResult}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Paper>
        </Box>
    );
}
