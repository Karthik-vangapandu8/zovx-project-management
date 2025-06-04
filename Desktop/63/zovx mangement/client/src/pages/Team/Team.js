import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  Email,
  Phone,
  Work,
  AccessTime
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { API_ENDPOINTS } from '../../config/api';
import axios from 'axios';

const Team = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Form state for creating/editing team members
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'DEVELOPER',
    department: '',
    salary: '',
    isActive: true
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.team);
      setTeamMembers(response.data || []);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      setError('Failed to load team members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createTeamMember = async () => {
    try {
      setSubmitting(true);
      const memberData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null
      };
      
      const response = await axios.post(API_ENDPOINTS.team, memberData);
      setTeamMembers([...teamMembers, response.data]);
      setOpenDialog(false);
      resetForm();
      setError(null);
    } catch (error) {
      console.error('Failed to create team member:', error);
      setError('Failed to create team member. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTeamMember = async (memberId, updates) => {
    try {
      const response = await axios.put(`${API_ENDPOINTS.team}/${memberId}`, updates);
      setTeamMembers(teamMembers.map(m => m.id === memberId ? response.data : m));
      setOpenDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update team member:', error);
      setError('Failed to update team member. Please try again.');
    }
  };

  const deleteTeamMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await axios.delete(`${API_ENDPOINTS.team}/${memberId}`);
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
      handleMenuClose();
    } catch (error) {
      console.error('Failed to delete team member:', error);
      setError('Failed to remove team member. Please try again.');
    }
  };

  const toggleMemberStatus = async (memberId, isActive) => {
    try {
      await updateTeamMember(memberId, { isActive });
    } catch (error) {
      console.error('Failed to update member status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'DEVELOPER',
      department: '',
      salary: '',
      isActive: true
    });
    setSelectedMember(null);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'error';
      case 'PROJECT_MANAGER': return 'warning';
      case 'TEAM_LEAD': return 'info';
      case 'DEVELOPER': return 'primary';
      case 'DESIGNER': return 'secondary';
      case 'TESTER': return 'success';
      default: return 'default';
    }
  };

  const formatRole = (role) => {
    return role?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const handleMenuClick = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  const handleNewMember = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleEditMember = () => {
    if (selectedMember) {
      setFormData({
        name: selectedMember.name || '',
        email: selectedMember.email || '',
        phone: selectedMember.phone || '',
        role: selectedMember.role || 'DEVELOPER',
        department: selectedMember.department || '',
        salary: selectedMember.salary?.toString() || '',
        isActive: selectedMember.isActive ?? true
      });
      setOpenDialog(true);
    }
    handleMenuClose();
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const MemberCard = ({ member }) => (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
          transition: 'all 0.3s ease'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                mr: 2,
                bgcolor: getRoleColor(member.role) + '.main'
              }}
            >
              {member.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {member.email}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, member)}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={formatRole(member.role)}
            color={getRoleColor(member.role)}
            size="small"
          />
          <Chip
            label={member.isActive ? 'Active' : 'Inactive'}
            color={member.isActive ? 'success' : 'default'}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {member.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {member.phone}
              </Typography>
            </Box>
          )}
          {member.department && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Work sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {member.department}
              </Typography>
            </Box>
          )}
          {member.lastLogin && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTime sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Last seen: {new Date(member.lastLogin).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
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
            Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your team members and their roles ({teamMembers.length} members)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          size="large"
          onClick={handleNewMember}
        >
          Add Member
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <TextField
          placeholder="Search team members..."
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

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'cards' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('cards')}
          >
            Cards
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
          >
            Table
          </Button>
        </Box>
      </Box>

      {viewMode === 'cards' ? (
        <Grid container spacing={3}>
          {filteredMembers.map((member) => (
            <Grid item xs={12} sm={6} lg={4} key={member.id}>
              <MemberCard member={member} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 2, bgcolor: getRoleColor(member.role) + '.main' }}>
                        {member.name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">{member.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={formatRole(member.role)}
                      color={getRoleColor(member.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{member.department || '-'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={member.isActive}
                      onChange={(e) => toggleMemberStatus(member.id, e.target.checked)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {member.lastLogin 
                      ? new Date(member.lastLogin).toLocaleDateString()
                      : 'Never'
                    }
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={(e) => handleMenuClick(e, member)}>
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {filteredMembers.length === 0 && !loading && (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary'
          }}
        >
          <Typography variant="h6" gutterBottom>
            {searchTerm ? 'No team members found' : 'No team members yet'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Add your first team member to get started'}
          </Typography>
          {!searchTerm && (
            <Button variant="contained" onClick={handleNewMember} startIcon={<Add />}>
              Add First Member
            </Button>
          )}
        </Box>
      )}

      {/* Team Member Form Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedMember ? 'Edit Team Member' : 'Add New Team Member'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              fullWidth
              required
            />
            
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              fullWidth
              required
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              fullWidth
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                label="Role"
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <MenuItem value="DEVELOPER">Developer</MenuItem>
                <MenuItem value="DESIGNER">Designer</MenuItem>
                <MenuItem value="TESTER">Tester</MenuItem>
                <MenuItem value="TEAM_LEAD">Team Lead</MenuItem>
                <MenuItem value="PROJECT_MANAGER">Project Manager</MenuItem>
                {user?.role === 'ADMIN' && (
                  <MenuItem value="ADMIN">Admin</MenuItem>
                )}
              </Select>
            </FormControl>

            <TextField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              fullWidth
            />

            <TextField
              label="Salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                />
              }
              label="Active Member"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={selectedMember 
              ? () => updateTeamMember(selectedMember.id, formData) 
              : createTeamMember
            }
            disabled={submitting || !formData.name || !formData.email}
          >
            {submitting ? <CircularProgress size={20} /> : (selectedMember ? 'Update' : 'Add Member')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditMember}>
          <Edit sx={{ mr: 1, fontSize: 20 }} />
          Edit Member
        </MenuItem>
        <MenuItem onClick={() => deleteTeamMember(selectedMember?.id)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 20 }} />
          Remove Member
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Team; 