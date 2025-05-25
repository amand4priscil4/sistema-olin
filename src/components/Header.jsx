// src/components/Header.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Notifications as NotificationIcon,
  AccountCircle as AccountIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

function Header({ onMobileMenuOpen, pageTitle = "Dashboard" }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    handleProfileMenuClose();
  };

  const isMenuOpen = Boolean(anchorEl);

  return (
    <>
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          borderBottom: '1px solid rgba(75, 99, 130, 0.08)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: '70px !important' }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileMenuOpen}
            sx={{ mr: 2, display: { lg: 'none' }, color: '#071739' }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title */}
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#071739', 
              fontWeight: 600, 
              flexGrow: 1,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            {pageTitle}
          </Typography>

          {/* Search */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center', 
            bgcolor: '#F8F9FA', 
            borderRadius: 3, 
            px: 2, 
            py: 1,
            mr: 2,
            minWidth: 300,
            border: '1px solid rgba(75, 99, 130, 0.1)',
            '&:hover': {
              bgcolor: '#F1F3F4',
              borderColor: 'rgba(75, 99, 130, 0.2)',
            },
            '&:focus-within': {
              bgcolor: 'white',
              borderColor: '#4B6382',
              boxShadow: '0 0 0 2px rgba(75, 99, 130, 0.1)',
            }
          }}>
            <SearchIcon sx={{ color: '#4B6382', mr: 1 }} />
            <InputBase
              placeholder="Buscar..."
              sx={{ 
                color: '#071739', 
                flex: 1,
                fontSize: '0.9rem'
              }}
            />
          </Box>

          {/* Mobile search */}
          <IconButton 
            sx={{ 
              display: { xs: 'flex', sm: 'none' }, 
              color: '#4B6382',
              mr: 1
            }}
          >
            <SearchIcon />
          </IconButton>

          {/* Notifications */}
          <IconButton sx={{ color: '#4B6382', mr: 1 }}>
            <Badge 
              badgeContent={4} 
              sx={{
                '& .MuiBadge-badge': {
                  bgcolor: '#A68658',
                  color: 'white'
                }
              }}
            >
              <NotificationIcon />
            </Badge>
          </IconButton>

          {/* Profile menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ 
              color: '#4B6382',
              '&:hover': {
                bgcolor: 'rgba(75, 99, 130, 0.1)'
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#071739',
                fontSize: '0.9rem'
              }}
            >
              DS
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={isMenuOpen}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1.5,
            minWidth: 200,
            borderRadius: 2,
            border: '1px solid rgba(75, 99, 130, 0.1)',
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&:hover': {
                bgcolor: 'rgba(75, 99, 130, 0.05)',
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ color: '#071739', fontWeight: 600 }}>
            Dr. Silva
          </Typography>
          <Typography variant="caption" sx={{ color: '#4B6382' }}>
            silva@olin.com
          </Typography>
        </Box>
        
        <Divider sx={{ mx: 1 }} />
        
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountIcon sx={{ mr: 2, color: '#4B6382' }} />
          Meu Perfil
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <SettingsIcon sx={{ mr: 2, color: '#4B6382' }} />
          Configurações
        </MenuItem>
        
        <Divider sx={{ mx: 1 }} />
        
        <MenuItem onClick={handleLogout}>
          <LogoutIcon sx={{ mr: 2, color: '#A68658' }} />
          Sair
        </MenuItem>
      </Menu>
    </>
  );
}

export default Header;