// src/pages/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardHeader, CardContent, Avatar, IconButton,
    Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Switch, FormControlLabel, Select, MenuItem,
    List, ListItem, ListItemText, Table, TableHead, TableRow, TableCell, TableBody,
    Skeleton
} from '@mui/material';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Add as AddIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import axios from 'axios';

export default function Profile() {
    // === состояния ===
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(null);
    const [savedQueries, setSavedQueries] = useState(null);
    const [activity, setActivity] = useState(null);

    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');

    // === заглушки для демо ===
    const demoUser = {
        name: 'Иван Иванов',
        email: 'ivan@example.com',
        avatarUrl: null,
    };
    const demoSettings = {
        darkMode: true,
        highlightMatches: true,
        language: 'ru',
    };
    const demoSaved = ['machine learning', 'optimisation', 'neural networks'];
    const demoActivity = [
        { timestamp: Date.now() - 3600_000, description: 'Вход в систему' },
        { timestamp: Date.now() - 1800_000, description: 'Поиск: machine learning' },
        { timestamp: Date.now() -  600_000, description: 'Переключил тему на тёмную' },
    ];

    // === загрузка данных (пока заглушки) ===
    useEffect(() => {
        // Здесь можно позже вызывать fetchUser()/fetchSettings() и т.д.
        setUser(demoUser);
        setSettings(demoSettings);
        setSavedQueries(demoSaved);
        setActivity(demoActivity);
    }, []);

    // === (остальные функции оставил без изменений) ===
    const openEdit = () => {
        setEditName(user.name);
        setEditEmail(user.email);
        setEditDialogOpen(true);
    };
    const saveProfile = async () => {
        await axios.put('/user', { name: editName, email: editEmail });
        setUser({ ...user, name: editName, email: editEmail });
        setEditDialogOpen(false);
    };
    const handleToggle = async (key, value) => {
        await axios.put('/settings', { [key]: value });
        setSettings({ ...settings, [key]: value });
    };
    const handleLangChange = async e => {
        const lang = e.target.value;
        await axios.put('/settings', { language: lang });
        setSettings({ ...settings, language: lang });
    };
    const addQuery = async () => {
        const q = prompt('Введите текст запроса для сохранения:');
        if (!q) return;
        const { data } = await axios.post('/saved-queries', { query: q });
        setSavedQueries([...savedQueries, data.query]);
    };
    const runQuery = q => {
        window.location.href = `/search?q=${encodeURIComponent(q)}`;
    };

    return (
        <Box p={4} bgcolor="background.default">
            <Typography variant="h3" gutterBottom>Профиль пользователя</Typography>
            <Grid container spacing={3}>

                {/* Карточка профиля */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            avatar={
                                user
                                    ? <Avatar src={user.avatarUrl} sx={{ width: 64, height: 64 }} />
                                    : <Skeleton variant="circular" width={64} height={64} />
                            }
                            action={
                                user && (
                                    <IconButton onClick={openEdit}>
                                        <EditIcon />
                                    </IconButton>
                                )
                            }
                            title={
                                user
                                    ? user.name
                                    : <Skeleton width={120} />
                            }
                            subheader={
                                user
                                    ? user.email
                                    : <Skeleton width={200} />
                            }
                        />
                    </Card>
                </Grid>

                {/* Настройки интерфейса */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="Настройки интерфейса" />
                        <CardContent>
                            {settings ? (
                                <>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.darkMode}
                                                onChange={e => handleToggle('darkMode', e.target.checked)}
                                            />
                                        }
                                        label="Тёмная тема"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={settings.highlightMatches}
                                                onChange={e => handleToggle('highlightMatches', e.target.checked)}
                                            />
                                        }
                                        label="Подсветка совпадений"
                                    />
                                    <Box mt={2}>
                                        <Select
                                            value={settings.language}
                                            onChange={handleLangChange}
                                            size="small"
                                        >
                                            <MenuItem value="ru">Русский</MenuItem>
                                            <MenuItem value="en">English</MenuItem>
                                        </Select>
                                        <Typography variant="caption" ml={1}>
                                            Язык интерфейса
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <>
                                    <Skeleton width={150} />
                                    <Skeleton width={150} />
                                    <Skeleton width={100} />
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Сохранённые запросы */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Сохранённые запросы"
                            action={
                                savedQueries && (
                                    <IconButton onClick={addQuery}><AddIcon /></IconButton>
                                )
                            }
                        />
                        <CardContent>
                            {savedQueries ? (
                                <List dense>
                                    {savedQueries.map((q,i) => (
                                        <ListItem key={i} secondaryAction={
                                            <Button size="small" onClick={() => runQuery(q)}>Запустить</Button>
                                        }>
                                            <ListItemText primary={q} />
                                        </ListItem>
                                    ))}
                                </List>
                            ) : (
                                Array.from({length:3}).map((_,i) => <Skeleton key={i} width="80%" />)
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* История активности */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader title="История активности" />
                        <CardContent>
                            {activity ? (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Время</TableCell>
                                            <TableCell>Действие</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {activity.map((e,i) => (
                                            <TableRow key={i}>
                                                <TableCell>
                                                    {new Date(e.timestamp).toLocaleString()}
                                                </TableCell>
                                                <TableCell>{e.description}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                Array.from({length:4}).map((_,i) => (
                                    <Skeleton key={i} height={32} sx={{ mb:1 }} />
                                ))
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Безопасность */}
                <Grid item xs={12}>
                    <Card>
                        <CardHeader avatar={<LockIcon />} title="Безопасность" />
                        <CardContent>
                            <Button variant="outlined" sx={{ mr:2 }}>Сменить пароль</Button>
                            <Button variant="outlined">Выйти со всех устройств</Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Модалка редактирования */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
                <DialogTitle>Редактировать профиль</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Имя"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        sx={{ mb:2 }}
                    />
                    <TextField
                        fullWidth
                        label="E-mail"
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
                    <Button startIcon={<SaveIcon />} onClick={saveProfile} variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
