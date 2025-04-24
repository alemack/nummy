// src/pages/About.jsx
import React from 'react';
import {
    Box, Typography, Divider, List, ListItem, ListItemIcon,
    ListItemText, Card, CardContent, useTheme
} from '@mui/material';
import {
    Search, Spa, Book, BarChart, ConnectWithoutContact
} from '@mui/icons-material';

export default function About() {
    const theme = useTheme();

    return (
        <Box
            p={4}
            sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                minHeight: '100vh'
            }}
        >
            <Typography variant="h3" gutterBottom>
                О Проекте
            </Typography>
            <Typography
                variant="subtitle1"
                color="textSecondary"
                gutterBottom
            >
                Интеллектуальный семантический поиск по научным статьям
            </Typography>
            <Divider sx={{ my: 3 }} />

            <Typography variant="body1" paragraph>
                Наша система объединяет классические и современные методы обработки естественного языка,
                чтобы вы находили именно те статьи, которые максимально соответствуют вашему запросу —
                даже если вы не знаете всех возможных терминов и их формулировок.
            </Typography>

            <Card
                variant="outlined"
                sx={{
                    mb: 4,
                    bgcolor: 'background.paper',
                    boxShadow: theme.shadows[1]
                }}
            >
                <CardContent>
                    <Typography variant="h5" gutterBottom>
                        Ключевые возможности
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <Search color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Расширение запроса"
                                secondary="Добавляем синонимы и близкие термины, чтобы найти больше релевантных публикаций."
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <Spa color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Лемматизация и стемминг"
                                secondary="Нормализуем слова к их базовым формам, чтобы 'поиск' находил и 'поиск', и 'искатель'."
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <Book color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Многопольный скоринг"
                                secondary="Учитываем совпадения в тегах, заголовках и аннотациях с разными весами."
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <BarChart color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Метрики качества"
                                secondary="Оцениваем precision/recall/F1 по всем запросам и полям, сохраняем результаты в JSON."
                            />
                        </ListItem>

                        <ListItem>
                            <ListItemIcon>
                                <ConnectWithoutContact color="primary" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Интерактивный UI"
                                secondary="Редактирование словаря синонимов, запуск оценок и просмотр метрик прямо в браузере."
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Typography variant="body1" paragraph>
                Под капотом:
            </Typography>
            <List dense sx={{ mb: 4 }}>
                <ListItem>
                    <ListItemText
                        primary="📂 MongoDB"
                        secondary="Хранение нормализованных статей и их метаданных"
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="🐍 Python (pymorphy3, NLTK, scikit-learn)"
                        secondary="Лемматизация, стемминг и расчёт метрик"
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="🌐 Laravel + React"
                        secondary="REST API и динамический фронтенд на Material-UI"
                    />
                </ListItem>
                <ListItem>
                    <ListItemText
                        primary="⚙️ Автоматизация"
                        secondary="Перезапуск скрипта оценки только при устаревших данных или по принудительному параметру 'force'."
                    />
                </ListItem>
            </List>
        </Box>
    );
}
