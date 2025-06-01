// components/SampleQueries.jsx
import React, { useState } from 'react';
import { Stack, Chip, Typography, Box, IconButton, Collapse, Tooltip } from '@mui/material';
import { ChevronRight, ChevronDown, Info } from 'lucide-react';

const samples = [
    // Английский с ошибками
    { label: "Machine learnings", value: "Machine learnings" },
    { label: "Natural languge procesing", value: "Natural languge procesing" },
    { label: "statistical methods", value: "statistical methods" },
    { label: "dat sciense", value: "dat sciense" },

    // Русский с опечатками и падежами
    { label: "машинного обученя", value: "машинного обученя" },
    { label: "статистические методи анализа", value: "статистические методи анализа" },
    { label: "финансовых рынков", value: "финансовых рынков" },
    { label: "классификации текстов", value: "классификации текстов" },
    { label: "кластеризация документов", value: "кластеризация документов" },

    // Микс
    { label: "Обработка images", value: "Обработка images" },
    { label: "text классификация", value: "text классификация" },
    { label: "data анализ", value: "data анализ" },
    { label: "исследования по robotics", value: "исследования по robotics" },

    // Научные термины, англоязычные и смешанные
    { label: "self-supervised pre-trainings", value: "self-supervised pre-trainings" },
    { label: "statistical finance", value: "statistical finance" },
    { label: "transformer architectures", value: "transformer architectures" },
    { label: "нейронные сети глубокого обучения", value: "нейронные сети глубокого обучения" },
    { label: "distributed representation of words", value: "distributed representation of words" },
    { label: "выделение признаков для моделей", value: "выделение признаков для моделей" },
    { label: "multi-agent systems", value: "multi-agent systems" },
    { label: "reinforcement learning задачи", value: "reinforcement learning задачи" },
    { label: "explainable ai", value: "explainable ai" },
    { label: "объяснимый искусственный интеллект", value: "объяснимый искусственный интеллект" }
];


export default function SampleQueries({ onSelect }) {
    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
                <IconButton size="small">
                    {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </IconButton>
                <Typography variant="subtitle2">
                    Примеры поисковых запросов
                </Typography>
                <Tooltip title="Кликните, чтобы развернуть/свернуть примеры" arrow>
                    <Info size={16} style={{ marginLeft: 4, color: "#888" }} />
                </Tooltip>
            </Box>
            <Collapse in={open}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Для демонстрации попробуйте запросы с ошибками, научные термины, англо-русский микс.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                    {samples.map((sample, i) => (
                        <Chip
                            key={i}
                            label={sample.label}
                            variant="outlined"
                            onClick={() => onSelect(sample.value)}
                            clickable
                            sx={{ mb: 1 }}
                        />
                    ))}
                </Stack>
            </Collapse>
        </Box>
    );
}
