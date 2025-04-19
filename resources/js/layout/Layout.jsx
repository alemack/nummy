// layout/Layout.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Box, CssBaseline, createTheme, ThemeProvider } from '@mui/material';
import { grey } from '@mui/material/colors';
import Header from './Header';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('darkMode') === 'true';
    });

    useEffect(() => {
        localStorage.setItem('darkMode', darkMode);
    }, [darkMode]);

    const theme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
            background: {
                default: darkMode ? grey[900] : '#fff',
            }
        }
    }), [darkMode]);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
                <Header
                    onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
                <Box sx={{ display: 'flex', flex: 1 }}>
                    {/* Анимация ширины */}
                    <Box
                        sx={{
                            width: sidebarOpen ? 240 : 0,
                            transition: 'width 0.3s ease',
                            overflow: 'hidden',
                            borderRight: sidebarOpen ? '1px solid #ccc' : 'none',
                        }}
                    >
                        <Sidebar />
                    </Box>

                    {/* Контент с адаптацией под ширину сайдбара */}
                    <Box
                        component="main"
                        sx={{
                            flex: 1,
                            p: 3,
                            transition: 'margin 0.3s ease',
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
}
