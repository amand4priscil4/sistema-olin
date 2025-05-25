// src/components/Layout.jsx
import { useState } from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const drawerWidth = 280;

function Layout({ children, pageTitle = "Dashboard" }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMobileMenuClose = () => {
    setMobileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Sidebar 
        mobileOpen={mobileOpen} 
        onMobileClose={handleMobileMenuClose}
      />

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <Header 
          onMobileMenuOpen={handleMobileMenuToggle}
          pageTitle={pageTitle}
        />

        {/* Page content */}
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto',
          bgcolor: '#F8F9FA',
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </Box>
  );
}

export default Layout;