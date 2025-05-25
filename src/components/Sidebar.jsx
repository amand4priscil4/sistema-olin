// src/components/Sidebar.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Box,
  Drawer,
  List,
  Typography,
  Divider,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Home as HomeIcon,
  FolderOpen as CasesIcon,
  Storage as BankIcon,
  History as HistoryIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  AccountCircle as AccountIcon
} from '@mui/icons-material';

const drawerWidth = 280;

// Menu items com controle de permissão
const menuItems = [
  { text: 'Início', icon: <HomeIcon />, path: '/dashboard', roles: ['admin', 'perito', 'assistente'] },
  { text: 'Casos', icon: <CasesIcon />, path: '/casos', roles: ['admin', 'perito', 'assistente'] },
  { text: 'Banco de Casos', icon: <BankIcon />, path: '/banco-casos', roles: ['admin', 'perito', 'assistente'] },
  { text: 'Histórico', icon: <HistoryIcon />, path: '/historico', roles: ['admin'] },
  { text: 'Usuários', icon: <UsersIcon />, path: '/usuarios', roles: ['admin'] },
  { text: 'Ajustes', icon: <SettingsIcon />, path: '/ajustes', roles: ['admin', 'perito', 'assistente'] },
];

function Sidebar({ mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Recupera dados do usuário do localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Erro ao parsear dados do usuário:', error);
      }
    }
  }, []);

  // Filtra itens do menu baseado no role do usuário
  const filteredMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            color: 'white', 
            fontWeight: 300,
            letterSpacing: '2px'
          }}
        >
          Olin
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: 'rgba(255,255,255,0.7)', 
            fontSize: '0.7rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}
        >
          Sistema de Perícias
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu Items */}
      <List sx={{ flex: 1, px: 2, py: 1 }}>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) onMobileClose();
                }}
                sx={{
                  borderRadius: 2,
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                  ...(isActive && {
                    bgcolor: 'rgba(227, 195, 128, 0.15)',
                    '&:hover': {
                      bgcolor: 'rgba(227, 195, 128, 0.25)',
                    },
                  }),
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: isActive ? 500 : 400
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* User Profile */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
            <AccountIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.name || 'Usuário'}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, textTransform: 'capitalize' }}>
              {user?.role || 'Carregando...'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(135deg, #071739 0%, #4B6382 100%)',
            border: 'none'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            background: 'linear-gradient(135deg, #071739 0%, #4B6382 100%)',
            border: 'none'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}

export default Sidebar;