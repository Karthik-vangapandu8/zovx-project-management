import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  Assignment,
  People,
  CheckCircle,
  Warning,
  Add,
  MoreVert,
  FolderOpen
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    overview: {
      projects: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      tasks: { total: 0, completed: 0, inProgress: 0, overdue: 0 },
      team: { total: 0, active: 0 }
    },
    personal: {
      tasks: { total: 0, completed: 0, pending: 0, overdue: 0, dueToday: 0 },
      projects: [],
      recentTasks: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch real data from backend APIs
      const [projectsRes, tasksRes, teamRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.projects}`),
        axios.get(`${API_ENDPOINTS.tasks}`),
        axios.get(`${API_ENDPOINTS.team}`)
      ]);

      const projects = projectsRes.data || [];
      const tasks = tasksRes.data || [];
      const team = teamRes.data || [];

      // Calculate project stats
      const projectStats = {
        total: projects.length,
        completed: projects.filter(p => p.status === 'COMPLETED').length,
        inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
        overdue: projects.filter(p => new Date(p.endDate) < new Date() && p.status !== 'COMPLETED').length
      };

      // Calculate task stats
      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length
      };

      // Calculate team stats
      const teamStats = {
        total: team.length,
        active: team.filter(member => member.isActive).length
      };

      // Get recent tasks (last 5)
      const recentTasks = tasks
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      // Personal task stats for current user
      const userTasks = tasks.filter(t => t.assigneeId === user.id || t.createdById === user.id);
      const today = new Date().toDateString();
      
      const personalTaskStats = {
        total: userTasks.length,
        completed: userTasks.filter(t => t.status === 'COMPLETED').length,
        pending: userTasks.filter(t => t.status !== 'COMPLETED').length,
        overdue: userTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length,
        dueToday: userTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today).length
      };

      setDashboardData({
        overview: {
          projects: projectStats,
          tasks: taskStats,
          team: teamStats
        },
        personal: {
          tasks: personalTaskStats,
          projects: projects,
          recentTasks: recentTasks
        }
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'primary';
      case 'PLANNING': return 'warning';
      case 'ON_HOLD': return 'default';
      case 'TODO': return 'info';
      case 'IN_REVIEW': return 'secondary';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'error';
      case 'HIGH': return 'warning';
      case 'MEDIUM': return 'info';
      case 'LOW': return 'default';
      default: return 'default';
    }
  };

  const formatStatus = (status) => {
    return status?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ backgroundColor: `${color}.main`, mr: 2 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your projects at Zovx Labs today.
        </Typography>
      </Box>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={dashboardData.overview.projects.total}
            icon={<FolderOpen />}
            color="primary"
            subtitle={`${dashboardData.overview.projects.inProgress} in progress`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tasks"
            value={dashboardData.overview.tasks.total}
            icon={<Assignment />}
            color="info"
            subtitle={`${dashboardData.overview.tasks.completed} completed`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Team Members"
            value={dashboardData.overview.team.total}
            icon={<People />}
            color="success"
            subtitle={`${dashboardData.overview.team.active} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="My Tasks"
            value={dashboardData.personal.tasks.total}
            icon={<CheckCircle />}
            color="warning"
            subtitle={`${dashboardData.personal.tasks.dueToday} due today`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Current Projects */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Current Projects
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={() => window.location.href = '/projects'}
              >
                Add Project
              </Button>
            </Box>
            
            {dashboardData.personal.projects.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No projects yet. Create your first project to get started!
                </Typography>
                <Button 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                  onClick={() => window.location.href = '/projects'}
                >
                  Create Project
                </Button>
              </Box>
            ) : (
              <List>
                {dashboardData.personal.projects.map((project, index) => (
                  <React.Fragment key={project.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: `${getStatusColor(project.status)}.main` }}>
                          <FolderOpen />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {project.name}
                            </Typography>
                            <Chip 
                              label={formatStatus(project.status)} 
                              size="small" 
                              color={getStatusColor(project.status)} 
                            />
                            <Chip 
                              label={project.priority} 
                              size="small" 
                              color={getPriorityColor(project.priority)} 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {project.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Progress: {project.progress}%
                                </Typography>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={project.progress} 
                                  sx={{ mt: 0.5 }}
                                />
                              </Box>
                              {project.endDate && (
                                <Typography variant="caption" color="text.secondary">
                                  Due: {new Date(project.endDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        }
                      />
                      <IconButton edge="end">
                        <MoreVert />
                      </IconButton>
                    </ListItem>
                    {index < dashboardData.personal.projects.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Recent Tasks */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Tasks
            </Typography>
            {dashboardData.personal.recentTasks.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  No recent tasks. Start by creating some tasks!
                </Typography>
              </Box>
            ) : (
              <List>
                {dashboardData.personal.recentTasks.map((task, index) => (
                  <React.Fragment key={task.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar sx={{ backgroundColor: `${getStatusColor(task.status)}.main`, width: 32, height: 32 }}>
                          <Assignment sx={{ fontSize: 16 }} />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="bold">
                            {task.title}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Chip 
                              label={formatStatus(task.status)} 
                              size="small" 
                              color={getStatusColor(task.status)} 
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < dashboardData.personal.recentTasks.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 