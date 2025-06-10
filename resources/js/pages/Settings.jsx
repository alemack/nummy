// src/pages/Settings.jsx
import React, { useState } from 'react'
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
    Slider,
    Button
} from '@mui/material'

export default function Settings() {
    // Локальные состояния для настроек
    const [darkMode, setDarkMode] = useState(true)
    const [highlightMatches, setHighlightMatches] = useState(true)
    const [expandQuery, setExpandQuery] = useState(false)
    const [language, setLanguage] = useState('ru')
    const [pageSize, setPageSize] = useState(20)

    return (
        <Box p={4} display="flex" justifyContent="center">
            <Card variant="outlined" sx={{ width: 600 }}>
                <CardHeader title="Настройки приложения" />
                <CardContent>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={e => setDarkMode(e.target.checked)}
                            />
                        }
                        label="Тёмная тема"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={highlightMatches}
                                onChange={e => setHighlightMatches(e.target.checked)}
                            />
                        }
                        label="Подсветка совпадений"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={expandQuery}
                                onChange={e => setExpandQuery(e.target.checked)}
                            />
                        }
                        label="Авто-расширение запросов"
                    />

                    <Box mt={3} display="flex" alignItems="center" gap={2}>
                        <Typography variant="body1">Язык интерфейса:</Typography>
                        <Select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            size="small"
                        >
                            <MenuItem value="ru">Русский</MenuItem>
                            <MenuItem value="en">English</MenuItem>
                        </Select>
                    </Box>

                    <Box mt={3}>
                        <Typography gutterBottom>
                            Результатов на странице: {pageSize}
                        </Typography>
                        <Slider
                            value={pageSize}
                            onChange={(e, v) => setPageSize(v)}
                            min={10}
                            max={100}
                            step={10}
                            valueLabelDisplay="auto"
                        />
                    </Box>

                    <Box mt={4} display="flex" justifyContent="flex-end">
                        <Button variant="contained">
                            Применить
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
