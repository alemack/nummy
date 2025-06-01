// src/components/Sidebar.jsx
import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    ListItemButton,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import {
    Home,
    Search,
    Info,
    BarChart,
    BookOpen,
    History,
    Server,
    Settings,
    User
} from 'lucide-react';

const navItems = [
    { to: '/',                label: 'Home',           icon: <Home size={20} /> },
    { to: '/search',          label: 'Search Articles', icon: <Search size={20} /> },
    { divider: true },

    { to: '/about',           label: 'About Project',   icon: <Info size={20} /> },
    { to: '/metrics',         label: 'Search Metrics',  icon: <BarChart size={20} /> },
    { to: '/dictionary',      label: 'Synonym Dictionary', icon: <BookOpen size={20} /> },
    { to: '/search-logs',     label: 'Search Logs',     icon: <History size={20} /> },
    { to: '/system-logs',     label: 'System Logs',     icon: <Server size={20} /> },

    { to: '/data-loader',     label: 'Data Loader',     icon: <Server size={20} /> },

    { divider: true },
    { to: '/profile',         label: 'Profile',         icon: <User size={20} /> },
    { to: '/settings',        label: 'Settings',        icon: <Settings size={20} /> },
];

export default function Sidebar() {
    return (
        <Box
            sx={{
                width: 240,
                bgcolor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
                height: '100%',
                p: 2,
            }}
        >
            <List>
                {navItems.map((item, index) =>
                    item.divider ? (
                        <Divider key={index} sx={{ my: 1 }} />
                    ) : (
                        <ListItem disablePadding key={index}>
                            <NavLink
                                to={item.to}
                                style={({ isActive }) => ({
                                    textDecoration: 'none',
                                    color: isActive ? '#1976d2' : 'inherit',
                                    fontWeight: isActive ? 'bold' : 'normal',
                                    width: '100%',
                                })}
                            >
                                <ListItemButton>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            </NavLink>
                        </ListItem>
                    )
                )}
            </List>
        </Box>
    );
}
