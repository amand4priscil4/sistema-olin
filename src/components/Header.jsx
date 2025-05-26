import { useState, useEffect } from 'react';
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
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, []);

  // ✅ FUNÇÃO para formatar nome do usuário
  const formatUserName = (name) => {
    if (!name) return 'Usuário';
    
    // Se for um nome completo, pegar primeiro e último nome
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
    }
    return name;
  };

  // ✅ FUNÇÃO para gerar iniciais do avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    
    const nameParts = name.split(' ');
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // ✅ FUNÇÃO para formatar role do usuário
  const formatUserRole = (role) => {
    const roles = {
      'admin': 'Administrador',
      'perito': 'Perito',
      'assistente': 'Assistente'
    };
    return roles[role] || role;
  };

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
          bgcolor: '#CDD5DB',
          borderBottom: '1px solid rgba(75, 99, 130, 0.08)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ minHeight: '50px !important' }}>
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
              {/* ✅ USAR iniciais do usuário logado */}
              {getUserInitials(user?.name)}
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
            {/* ✅ USAR nome do usuário logado */}
            {formatUserName(user?.name) || 'Usuário'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#4B6382' }}>
            {/* ✅ USAR email do usuário logado */}
            {user?.email || 'email@exemplo.com'}
          </Typography>
          {/* ✅ ADICIONAR role do usuário */}
          {user?.role && (
            <Typography variant="caption" sx={{ color: '#A68866', fontSize: '0.7rem', display: 'block' }}>
              {formatUserRole(user.role)}
            </Typography>
          )}
        </Box>
        
        <Divider sx={{ mx: 1 }} />
        
        <MenuItem onClick={handleProfileMenuClose}>
          <AccountIcon sx={{ mr: 2, color: '#4B6382' }} />
          Meu Perfil
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