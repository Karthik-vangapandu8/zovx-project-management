const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { auth } = require('../middleware/auth');

// Get team statistics (must come before /:id route)
router.get('/stats', auth, async (req, res) => {
  try {
    const totalMembers = await req.prisma.user.count();
    const activeMembers = await req.prisma.user.count({
      where: { isActive: true }
    });

    const roleDistribution = await req.prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      },
      where: { isActive: true }
    });

    const stats = {
      total: totalMembers,
      active: activeMembers,
      inactive: totalMembers - activeMembers,
      roleDistribution: roleDistribution.reduce((acc, item) => {
        acc[item.role] = item._count.role;
        return acc;
      }, {})
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to fetch team stats:', error);
    res.status(500).json({ error: 'Failed to fetch team statistics' });
  }
});

// Get all team members
router.get('/', auth, async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        phone: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(users);
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// Get team member by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: {
        id: req.params.id
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        phone: true,
        skills: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        managedProjects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        projects: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Failed to fetch team member:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// Create new team member
router.post('/', auth, async (req, res) => {
  try {
    const { name, email, phone, role, department, position, skills, isActive, password } = req.body;

    // Check if user with this email already exists
    const existingUser = await req.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate default password if not provided
    const defaultPassword = password || 'TempPass123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);

    // Create new user
    const newUser = await req.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'DEVELOPER',
        department: department || null,
        position: position || null,
        phone: phone || null,
        skills: skills || [],
        isActive: isActive !== undefined ? isActive : true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        phone: true,
        skills: true,
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Failed to create team member:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'User with this email already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create team member' });
    }
  }
});

// Update team member
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, phone, role, department, position, skills, isActive } = req.body;

    // Check if user exists
    const existingUser = await req.prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Check if email is being changed and if it conflicts with another user
    if (email && email !== existingUser.email) {
      const emailConflict = await req.prisma.user.findUnique({
        where: { email }
      });

      if (emailConflict) {
        return res.status(400).json({ error: 'Email already in use by another user' });
      }
    }

    // Update user
    const updatedUser = await req.prisma.user.update({
      where: {
        id: req.params.id
      },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(role && { role }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(skills !== undefined && { skills }),
        ...(isActive !== undefined && { isActive })
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        position: true,
        phone: true,
        skills: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update team member:', error);
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Email already in use by another user' });
    } else {
      res.status(500).json({ error: 'Failed to update team member' });
    }
  }
});

// Delete team member
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user exists
    const existingUser = await req.prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        assignedTasks: true,
        managedProjects: true
      }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    // Check if user has active assignments
    if (existingUser.assignedTasks.length > 0 || existingUser.managedProjects.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with active tasks or projects. Please reassign them first.' 
      });
    }

    // Delete user
    await req.prisma.user.delete({
      where: {
        id: req.params.id
      }
    });

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Failed to delete team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

module.exports = router; 