import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Search from './pages/Search';
import About from './pages/About';
import Metrics from './pages/Metrics';
import Dictionary from './pages/Dictionary';
import SystemLogs from './pages/SystemLogs.jsx';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import SearchLogs from "@/pages/SearchLogs.jsx";
import DataLoader from './pages/DataLoader';
import ArticlePage from './pages/ArticlePage';

ReactDOM.createRoot(document.getElementById('app')).render(
    <React.StrictMode>
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/metrics" element={<Metrics />} />
                    <Route path="/dictionary" element={<Dictionary />} />
                    <Route path="/search-logs" element={<SearchLogs />} />
                    <Route path="/system-logs" element={<SystemLogs />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/search-logs" element={<SearchLogs/>} />
                    <Route path="/data-loader" element={<DataLoader />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                </Routes>
            </Layout>
        </Router>
    </React.StrictMode>
);
