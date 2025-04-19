// layout/Header.jsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Menu, Sun, Moon } from 'lucide-react';

export default function Header({ onToggleSidebar, darkMode, setDarkMode }) {
    return (
        <AppBar position="static" color="primary" elevation={1}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={onToggleSidebar}
                        sx={{ mr: 2 }}
                    >
                        <Menu size={20} />
                    </IconButton>
                    <Typography variant="h6" component="div" fontWeight="bold">
                        Intellectual Search
                    </Typography>
                </Box>
                <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
