import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Fade,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  BusinessCenter,
  AutoAwesome,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { glassMorphism, gradientText, modernGradient } from '../../theme/theme';

const FloatingElement = ({ children, delay = 0 }) => (
  <Box
    sx={{
      animation: 'float 6s ease-in-out infinite',
      animationDelay: `${delay}s`,
      '@keyframes float': {
        '0%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-20px)' },
        '100%': { transform: 'translateY(0px)' },
      },
    }}
  >
    {children}
  </Box>
);

const Login = () => {
  const { login, user, loading } = useAuth();
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.primary.main, 0.1)} 0%, 
          ${alpha(theme.palette.secondary.main, 0.1)} 25%,
          ${alpha(theme.palette.success.main, 0.1)} 50%,
          ${alpha(theme.palette.warning.main, 0.1)} 75%,
          ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        p: 3,
      }}
    >
      {/* Animated Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
        }}
      >
        <FloatingElement delay={0}>
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: modernGradient.primary,
              opacity: 0.3,
              filter: 'blur(40px)',
            }}
          />
        </FloatingElement>
        
        <FloatingElement delay={2}>
          <Box
            sx={{
              position: 'absolute',
              top: '20%',
              right: '15%',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: modernGradient.secondary,
              opacity: 0.2,
              filter: 'blur(50px)',
            }}
          />
        </FloatingElement>
        
        <FloatingElement delay={4}>
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              left: '20%',
              width: 120,
              height: 120,
              borderRadius: '50%',
              background: modernGradient.success,
              opacity: 0.25,
              filter: 'blur(45px)',
            }}
          />
        </FloatingElement>
      </Box>

      <Fade in={mounted} timeout={800}>
        <Card
          sx={{
            ...glassMorphism,
            maxWidth: 450,
            width: '100%',
            zIndex: 1,
            overflow: 'visible',
            position: 'relative',
          }}
        >
          <CardContent sx={{ p: 5 }}>
            {/* Logo and Title */}
            <Slide direction="down" in={mounted} timeout={600}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 80,
                    height: 80,
                    borderRadius: '20px',
                    background: modernGradient.rainbow,
                    mb: 3,
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: '2px',
                      borderRadius: '18px',
                      background: 'white',
                      zIndex: 1,
                    },
                  }}
                >
                  <BusinessCenter
                    sx={{
                      fontSize: 40,
                      background: modernGradient.primary,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      zIndex: 2,
                      position: 'relative',
                    }}
                  />
                </Box>
                
                <Typography
                  variant="h4"
                  sx={{
                    ...gradientText,
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Zovx Labs
                </Typography>
                
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  Project Management Suite
                </Typography>
              </Box>
            </Slide>

            {/* Login Form */}
            <Slide direction="up" in={mounted} timeout={800}>
              <Box component="form" onSubmit={handleSubmit}>
                {error && (
                  <Fade in timeout={300}>
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3,
                        ...glassMorphism,
                        background: alpha(theme.palette.error.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      }}
                    >
                      {error}
                    </Alert>
                  </Fade>
                )}

                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                        },
                      },
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            disabled={submitting}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        '&.Mui-focused': {
                          transform: 'translateY(-1px)',
                        },
                      },
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={submitting}
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: modernGradient.rainbow,
                    border: 'none',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      transition: 'left 0.5s',
                    },
                    '&:hover::before': {
                      left: '100%',
                    },
                    '&:disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                    },
                  }}
                >
                  {submitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          border: '2px solid rgba(255,255,255,0.3)',
                          borderTop: '2px solid white',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }}
                      />
                      Signing In...
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AutoAwesome sx={{ fontSize: 20 }} />
                      Sign In
                    </Box>
                  )}
                </Button>
              </Box>
            </Slide>

            {/* Demo Credentials */}
            <Fade in={mounted} timeout={1200}>
              <Box
                sx={{
                  mt: 4,
                  p: 3,
                  borderRadius: 2,
                  background: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Demo Credentials:
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  <strong>Admin:</strong> sandeep@zovx.pro / Sandeep@8332
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  <strong>Team Member:</strong> uday@zovx.pro / TempPass123!
                </Typography>
              </Box>
            </Fade>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
};

export default Login; 