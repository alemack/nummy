import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardHeader,
    CardContent,
    LinearProgress,
    Alert,
    Stack,
    useTheme,
    CircularProgress
} from '@mui/material';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import BuildIcon from '@mui/icons-material/Build';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axios from 'axios';

export default function DataLoader() {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [importing, setImporting] = useState(false);
    const [importResult, setImportResult] = useState(null);

    const [normalizing, setNormalizing] = useState(false);
    const [normalizeResult, setNormalizeResult] = useState(null);

    const [importingNormalized, setImportingNormalized] = useState(false);
    const [importNormalizedResult, setImportNormalizedResult] = useState(null);

    const [buildingSynonyms, setBuildingSynonyms] = useState(false);
    const [buildSynonymsResult, setBuildSynonymsResult] = useState(null);

    // 1. Load articles from arXiv
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

    // 2. Import into MongoDB
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

    // 3. Export and normalize
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

    // 4. Import normalized articles
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

    // 5. Build synonyms
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

    // Шаги пайплайна
    const steps = [
        {
            label: 'Загрузить статьи с arXiv',
            action: handleLoadData,
            loading: loading,
            icon: <CloudDownloadIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />,
            color: 'primary',
            description: 'Скачивает свежие статьи с arXiv в файл arxiv_dataset.json через Python-скрипт.',
        },
        {
            label: 'Импортировать в MongoDB',
            action: handleImport,
            loading: importing,
            icon: <CloudUploadIcon sx={{ fontSize: 28, color: theme.palette.secondary.main }} />,
            color: 'secondary',
            description: 'Загружает arxiv_dataset.json в коллекцию articles вашей MongoDB.',
        },
        {
            label: 'Экспортировать и нормализовать',
            action: handleExportAndNormalize,
            loading: normalizing,
            icon: <BuildIcon sx={{ fontSize: 28, color: theme.palette.success.main }} />,
            color: 'success',
            description: 'Выгружает статьи из базы, лемматизирует и сохраняет в normalized_articles.json.',
        },
        {
            label: 'Импортировать нормализованные статьи',
            action: handleImportNormalized,
            loading: importingNormalized,
            icon: <ImportExportIcon sx={{ fontSize: 28, color: theme.palette.info.main }} />,
            color: 'info',
            description: 'Импортирует normalized_articles.json в коллекцию normalized_articles.',
        },
        {
            label: 'Сгенерировать словарь синонимов',
            action: handleBuildSynonyms,
            loading: buildingSynonyms,
            icon: <AutoAwesomeIcon sx={{ fontSize: 28, color: theme.palette.warning.main }} />,
            color: 'warning',
            description: 'Строит query_synonyms.json по тегам (TF-IDF + косинусное сходство).',
        },
    ];

    const anyLoading = steps.some(step => step.loading);

    return (
        <Box
            sx={{
                maxWidth: 700,
                mx: 'auto',
                mt: 6,
                px: 2,
                backgroundColor: theme.palette.background.default
            }}
        >
            <Card
                elevation={4}
                sx={{
                    p: 4,
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper
                }}
            >
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <CloudDownloadIcon color="primary" fontSize="large" />
                    <Typography variant="h4" fontWeight="bold">
                        Data Loader
                    </Typography>
                </Box>
                <Typography variant="body1" mb={3}>
                    <strong>Пайплайн данных:</strong> Пройдите шаги ниже для полной подготовки данных для интеллектуального поиска.
                </Typography>
                <Card
                    variant="outlined"
                    sx={{
                        mb: 4,
                        backgroundColor: theme.palette.mode === 'dark' ? '#2c2f33' : '#f6f7fb',
                        p: 2,
                        borderLeft: `4px solid ${theme.palette.primary.main}`,
                        borderRadius: 2
                    }}
                >
                    <Box display="flex" alignItems="center" mb={1}>
                        <InfoOutlinedIcon color="primary" sx={{ mr: 1 }} />
                        <Typography fontWeight="bold" color="primary.main">Этапы:</Typography>
                    </Box>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                        <li><strong>Загрузка</strong>: свежие статьи arXiv</li>
                        <li><strong>Импорт</strong>: в MongoDB</li>
                        <li><strong>Нормализация</strong>: лемматизация</li>
                        <li><strong>Импорт нормализованных</strong>: в новую коллекцию</li>
                        <li><strong>Синонимы</strong>: построение словаря тегов</li>
                    </ol>
                </Card>

                <Stack spacing={3} mb={3}>
                    {steps.map((step, idx) => (
                        <Card
                            key={step.label}
                            elevation={2}
                            sx={{
                                borderLeft: `5px solid ${theme.palette[step.color].main}`,
                                backgroundColor: theme.palette.background.paper
                            }}
                        >
                            <CardHeader
                                avatar={step.icon}
                                title={
                                    <Typography variant="h6" fontWeight="bold">
                                        {`${idx + 1}. ${step.label}`}
                                    </Typography>
                                }
                                action={
                                    <Button
                                        variant="contained"
                                        color={step.color}
                                        onClick={step.action}
                                        disabled={anyLoading && !step.loading}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: 16
                                        }}
                                    >
                                        {step.loading ? (
                                            <CircularProgress size={24} color="inherit" />
                                        ) : (
                                            'Выполнить'
                                        )}
                                    </Button>
                                }
                            />
                            <CardContent sx={{ pt: 0, pb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {step.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>

                {anyLoading && (
                    <LinearProgress
                        sx={{ my: 2, borderRadius: 1 }}
                        color="primary"
                        variant="indeterminate"
                    />
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
            </Card>
        </Box>
    );
}
