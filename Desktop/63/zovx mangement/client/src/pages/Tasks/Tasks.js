import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Menu,
  Avatar,
  Autocomplete,
  Divider,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slider,
  Stack,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  CalendarToday,
  Person,
  Flag,
  Comment,
  Send,
  Timeline,
  Close,
  Update
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';

const Tasks = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState(null);
  const [taskComments, setTaskComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  // Form state for creating/editing tasks
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    assigneeId: '',
    dueDate: ''
  });

  // Task statuses for Kanban columns
  const taskStatuses = [
    { key: 'TODO', label: 'To Do', color: 'default' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'primary' },
    { key: 'IN_REVIEW', label: 'In Review', color: 'warning' },
    { key: 'COMPLETED', label: 'Completed', color: 'success' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  // Socket.IO real-time updates
  useEffect(() => {
    if (socket) {
      socket.on('taskUpdated', (updatedTask) => {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === updatedTask.id ? { ...task, ...updatedTask } : task
          )
        );
        
        // Update detail view if it's open for this task
        if (selectedTaskDetail && selectedTaskDetail.id === updatedTask.id) {
          setSelectedTaskDetail(prev => ({ ...prev, ...updatedTask }));
        }
      });

      socket.on('taskCommentAdded', (comment) => {
        if (selectedTaskDetail && selectedTaskDetail.id === comment.taskId) {
          setTaskComments(prev => [comment, ...prev]);
        }
        
        // Update comment count on task cards
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === comment.taskId 
              ? { ...task, _count: { ...task._count, comments: (task._count?.comments || 0) + 1 } }
              : task
          )
        );
      });

      return () => {
        socket.off('taskUpdated');
        socket.off('taskCommentAdded');
      };
    }
  }, [socket, selectedTaskDetail]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, teamRes] = await Promise.all([
        axios.get(API_ENDPOINTS.tasks),
        axios.get(API_ENDPOINTS.projects),
        axios.get(API_ENDPOINTS.team)
      ]);
      
      setTasks(tasksRes.data || []);
      setProjects(projectsRes.data || []);
      setTeamMembers(teamRes.data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskDetails = async (taskId) => {
    try {
      setCommentLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.tasks}/${taskId}`);
      setSelectedTaskDetail(response.data);
      setTaskComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch task details:', error);
      setError('Failed to load task details.');
    } finally {
      setCommentLoading(false);
    }
  };

  const createTask = async () => {
    try {
      setSubmitting(true);
      const taskData = {
        ...formData,
        projectId: formData.projectId || null,
        assigneeId: formData.assigneeId || null,
        dueDate: formData.dueDate || null
      };
      
      const response = await axios.post(API_ENDPOINTS.tasks, taskData);
      setTasks([...tasks, response.data]);
      setOpenDialog(false);
      resetForm();
      setError(null);
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('taskCreated', response.data);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      setError('Failed to create task. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.tasks}/${taskId}`, updates);
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('taskUpdated', response.data);
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      setError('Failed to update task. Please try again.');
    }
  };

  const updateTaskProgress = async (taskId, progress) => {
    try {
      const response = await axios.patch(`${API_ENDPOINTS.tasks}/${taskId}/progress`, { progress });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, progress } : t));
      
      if (selectedTaskDetail && selectedTaskDetail.id === taskId) {
        setSelectedTaskDetail(prev => ({ ...prev, progress }));
      }

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('taskUpdated', { id: taskId, progress });
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      setError('Failed to update task progress.');
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedTaskDetail) return;
    
    try {
      setSubmitting(true);
      const response = await axios.post(`${API_ENDPOINTS.tasks}/${selectedTaskDetail.id}/comments`, {
        content: newComment.trim()
      });
      
      setTaskComments([response.data, ...taskComments]);
      setNewComment('');
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('taskCommentAdded', response.data);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      setError('Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`${API_ENDPOINTS.tasks}/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      handleMenuClose();
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('taskDeleted', { id: taskId });
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: '',
      assigneeId: '',
      dueDate: ''
    });
    setSelectedTask(null);
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

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTask(null);
  };

  const handleNewTask = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleEditTask = () => {
    if (selectedTask) {
      setFormData({
        title: selectedTask.title || '',
        description: selectedTask.description || '',
        status: selectedTask.status || 'TODO',
        priority: selectedTask.priority || 'MEDIUM',
        projectId: selectedTask.projectId || '',
        assigneeId: selectedTask.assigneeId || '',
        dueDate: selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const handleTaskClick = (task) => {
    setOpenDetailDialog(true);
    fetchTaskDetails(task.id);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
  };

  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canUserUpdateTask = (task) => {
    if (!user) return false;
    return (
      user.role === 'ADMIN' ||
      task.assigneeId === user.id ||
      task.createdById === user.id ||
      task.project?.managerId === user.id
    );
  };

  const TaskCard = ({ task }) => (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
          transition: 'all 0.2s ease'
        }
      }}
      onClick={() => handleTaskClick(task)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flexGrow: 1 }}>
            {task.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {task._count?.comments > 0 && (
              <Badge badgeContent={task._count.comments} color="primary">
                <Comment sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Badge>
            )}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuClick(e, task);
              }}
            >
              <MoreVert sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {task.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {task.description.length > 100 
              ? `${task.description.substring(0, 100)}...` 
              : task.description
            }
          </Typography>
        )}

        {/* Progress Bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {task.progress || 0}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={task.progress || 0} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={task.priority}
            color={getPriorityColor(task.priority)}
            size="small"
            icon={<Flag sx={{ fontSize: 12 }} />}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {task.assignee && (
              <Tooltip title={task.assignee.name}>
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                  {task.assignee.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </Avatar>
              </Tooltip>
            )}
            {task.project && (
              <Typography variant="caption" color="text.secondary">
                {task.project.name}
              </Typography>
            )}
          </Box>
          {task.dueDate && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarToday sx={{ fontSize: 12, mr: 0.5, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {new Date(task.dueDate).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const KanbanColumn = ({ status, tasks }) => (
    <Paper sx={{ p: 2, minHeight: 500 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {status.label}
        </Typography>
        <Chip 
          label={tasks.length} 
          color={status.color} 
          size="small" 
        />
      </Box>
      <Box>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
            <Typography variant="body2">
              No tasks in {status.label.toLowerCase()}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Task Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your tasks across projects ({tasks.length} tasks)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={handleNewTask}
        >
          New Task
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Kanban Board */}
      <Grid container spacing={2}>
        {taskStatuses.map((status) => {
          const statusTasks = filteredTasks.filter(task => task.status === status.key);
          return (
            <Grid item xs={12} sm={6} md={3} key={status.key}>
              <KanbanColumn status={status} tasks={statusTasks} />
            </Grid>
          );
        })}
      </Grid>

      {filteredTasks.length === 0 && !loading && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No tasks found' : 'No tasks yet'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first task to get started'}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" onClick={handleNewTask} startIcon={<Add />}>
              Create First Task
            </Button>
          )}
        </Box>
      )}

      {/* Task Detail Dialog */}
      <Dialog 
        open={openDetailDialog} 
        onClose={() => setOpenDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '70vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              {selectedTaskDetail?.title || 'Task Details'}
            </Typography>
            <IconButton onClick={() => setOpenDetailDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {commentLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : selectedTaskDetail ? (
            <Stack spacing={3}>
              {/* Task Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedTaskDetail.description || 'No description provided'}
                </Typography>
              </Box>

              {/* Task Metadata */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={selectedTaskDetail.priority}
                  color={getPriorityColor(selectedTaskDetail.priority)}
                  icon={<Flag />}
                />
                <Chip
                  label={taskStatuses.find(s => s.key === selectedTaskDetail.status)?.label}
                  color={taskStatuses.find(s => s.key === selectedTaskDetail.status)?.color}
                />
                {selectedTaskDetail.assignee && (
                  <Chip
                    avatar={
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {selectedTaskDetail.assignee.name?.[0]}
                      </Avatar>
                    }
                    label={selectedTaskDetail.assignee.name}
                  />
                )}
              </Box>

              {/* Progress Update */}
              {canUserUpdateTask(selectedTaskDetail) && (
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Progress: {selectedTaskDetail.progress || 0}%
                  </Typography>
                  <Slider
                    value={selectedTaskDetail.progress || 0}
                    onChange={(e, value) => updateTaskProgress(selectedTaskDetail.id, value)}
                    valueLabelDisplay="auto"
                    step={5}
                    marks
                    min={0}
                    max={100}
                    sx={{ mb: 2 }}
                  />
                </Box>
              )}

              <Divider />

              {/* Comments Section */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Comments ({taskComments.length})
                </Typography>
                
                {/* Add Comment */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <TextField
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    fullWidth
                    multiline
                    maxRows={3}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addComment();
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={addComment}
                    disabled={!newComment.trim() || submitting}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <Send />
                  </Button>
                </Box>

                {/* Comments List */}
                <List sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  {taskComments.map((comment) => (
                    <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {comment.user.name?.[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {comment.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {comment.content}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                  {taskComments.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                      <Typography variant="body2">
                        No comments yet. Be the first to comment!
                      </Typography>
                    </Box>
                  )}
                </List>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Task Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              fullWidth
              required
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              fullWidth
              multiline
              rows={3}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  {taskStatuses.map((status) => (
                    <MenuItem key={status.key} value={status.key}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority}
                  label="Priority"
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Autocomplete
              options={projects}
              getOptionLabel={(option) => option.name}
              value={projects.find(p => p.id === formData.projectId) || null}
              onChange={(event, newValue) => {
                setFormData({...formData, projectId: newValue?.id || ''});
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Project"
                  placeholder="Select project"
                />
              )}
            />

            <Autocomplete
              options={teamMembers}
              getOptionLabel={(option) => option.name}
              value={teamMembers.find(m => m.id === formData.assigneeId) || null}
              onChange={(event, newValue) => {
                setFormData({...formData, assigneeId: newValue?.id || ''});
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assignee"
                  placeholder="Select assignee"
                />
              )}
            />

            <TextField
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={selectedTask 
              ? () => updateTask(selectedTask.id, formData) 
              : createTask
            }
            disabled={submitting || !formData.title}
          >
            {submitting ? <CircularProgress size={20} /> : (selectedTask ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTask}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit Task
        </MenuItem>
        <Divider />
        {taskStatuses.map((status) => (
          <MenuItem 
            key={status.key}
            onClick={() => {
              handleStatusChange(selectedTask?.id, status.key);
              handleMenuClose();
            }}
            disabled={selectedTask?.status === status.key}
          >
            Move to {status.label}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => deleteTask(selectedTask?.id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Delete Task
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Tasks; 