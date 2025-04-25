// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Card,
    CardHeader,
    CardContent,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Button,
    Skeleton,
    Alert
} from '@mui/material'
import axios from 'axios'

export default function Settings() {
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [dirty, setDirty] = useState(false)

    // При монтировании загружаем текущие настройки
    useEffect(() => {
        setLoading(true)
        axios.get('/api/settings')
            .then(({ data }) => {
                setSettings(data)      // ожидаем { darkMode, highlightMatches, language, ... }
                setError(null)
            })
            .catch(e => {
                setError('Не удалось загрузить настройки')
            })
            .finally(() => setLoading(false))
    }, [])

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
        setDirty(true)
    }

    const handleSave = () => {
        setSaving(true)
        axios.put('/api/settings', settings)
            .then(() => {
                setError(null)
                setDirty(false)
            })
            .catch(() => {
                setError('Не удалось сохранить настройки')
            })
            .finally(() => setSaving(false))
    }

    return (
        <Box p={4}>
            <Typography variant="h4" gutterBottom>
                Настройки приложения
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Card sx={{ maxWidth: 600 }}>
                <CardHeader title="Интерфейс и поведение" />
                <CardContent>
                    {loading || !settings ? (
                        <>
                            <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
                            <Skeleton width="60%" height={40} sx={{ mb: 2 }} />
                            <Skeleton width="40%" height={40} />
                        </>
                    ) : (
                        <>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.darkMode}
                                        onChange={e => handleChange('darkMode', e.target.checked)}
                                    />
                                }
                                label="Тёмная тема"
                            />
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.highlightMatches}
                                        onChange={e => handleChange('highlightMatches', e.target.checked)}
                                    />
                                }
                                label="Подсветка совпадений в результатах"
                            />
                            <Box mt={2} display="flex" alignItems="center">
                                <Typography variant="body1" sx={{ mr: 2 }}>
                                    Язык интерфейса:
                                </Typography>
                                <Select
                                    value={settings.language}
                                    onChange={e => handleChange('language', e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="ru">Русский</MenuItem>
                                    <MenuItem value="en">English</MenuItem>
                                </Select>
                            </Box>
                            {/* сюда можно добавить ещё какие-нибудь флаги или селекты */}
                        </>
                    )}
                </CardContent>
                <Box p={2} display="flex" justifyContent="flex-end">
                    <Button
                        variant="contained"
                        disabled={!dirty || saving || loading}
                        onClick={handleSave}
                    >
                        {saving ? 'Сохраняем...' : 'Сохранить'}
                    </Button>
                </Box>
            </Card>
        </Box>
    )
}
