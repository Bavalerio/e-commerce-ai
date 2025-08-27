'use client';

import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LightMode as LightIcon,
  DarkMode as DarkIcon,
  SettingsBrightness as SystemIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useUIStore } from '@/store/ui-store';

interface ThemeToggleProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  size = 'medium',
  showLabel = false 
}) => {
  const theme = useTheme();
  const { 
    theme: currentTheme, 
    themePreference, 
    setThemePreference 
  } = useUIStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeSelect = (preference: 'light' | 'dark' | 'system') => {
    setThemePreference(preference);
    handleClose();
  };

  const getCurrentIcon = () => {
    if (themePreference === 'system') {
      return <SystemIcon />;
    }
    return currentTheme === 'light' ? <LightIcon /> : <DarkIcon />;
  };

  const getTooltipText = () => {
    switch (themePreference) {
      case 'light':
        return 'Light theme';
      case 'dark':
        return 'Dark theme';
      case 'system':
        return 'System theme';
      default:
        return 'Toggle theme';
    }
  };

  const menuItems = [
    {
      value: 'light' as const,
      label: 'Light',
      icon: <LightIcon fontSize="small" />,
    },
    {
      value: 'dark' as const,
      label: 'Dark',
      icon: <DarkIcon fontSize="small" />,
    },
    {
      value: 'system' as const,
      label: 'System',
      icon: <SystemIcon fontSize="small" />,
    },
  ];

  if (showLabel) {
    // For mobile or expanded view - show current theme as text
    return (
      <>
        <MenuItem onClick={handleClick}>
          <ListItemIcon>{getCurrentIcon()}</ListItemIcon>
          <ListItemText primary={`Theme: ${themePreference}`} />
        </MenuItem>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              minWidth: 150,
              borderRadius: 2,
              mt: 1,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.value}
              onClick={() => handleThemeSelect(item.value)}
              selected={themePreference === item.value}
              sx={{
                minHeight: 40,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                },
              }}
            >
              <ListItemIcon
                sx={{ 
                  minWidth: 36,
                  color: themePreference === item.value ? 'primary.main' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    fontWeight: themePreference === item.value ? 600 : 400,
                    color: themePreference === item.value ? 'primary.main' : 'inherit'
                  }
                }}
              />
              {themePreference === item.value && (
                <CheckIcon 
                  fontSize="small" 
                  sx={{ 
                    color: 'primary.main',
                    ml: 1
                  }} 
                />
              )}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  // Default icon button view
  return (
    <>
      <Tooltip title={getTooltipText()} arrow>
        <IconButton
          size={size}
          onClick={handleClick}
          color="inherit"
          aria-label="Theme settings"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'scale(1.1)',
            },
          }}
        >
          {getCurrentIcon()}
        </IconButton>
      </Tooltip>

      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 150,
            borderRadius: 2,
            mt: 1.5,
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.value}
            onClick={() => handleThemeSelect(item.value)}
            selected={themePreference === item.value}
            sx={{
              minHeight: 40,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              },
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon
              sx={{ 
                minWidth: 36,
                color: themePreference === item.value ? 'primary.main' : 'inherit'
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{
                '& .MuiListItemText-primary': {
                  fontWeight: themePreference === item.value ? 600 : 400,
                  color: themePreference === item.value ? 'primary.main' : 'inherit'
                }
              }}
            />
            {themePreference === item.value && (
              <CheckIcon 
                fontSize="small" 
                sx={{ 
                  color: 'primary.main',
                  ml: 1
                }} 
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggle;