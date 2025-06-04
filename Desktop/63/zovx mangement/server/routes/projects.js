const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await req.prisma.project.findMany({
      where: {
        OR: [
          { managerId: req.user.userId },
          { members: { some: { id: req.user.userId } } }
        ]
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true
          }
        }
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await req.prisma.project.findFirst({
      where: {
        id: req.params.id,
        OR: [
          { managerId: req.user.userId },
          { members: { some: { id: req.user.userId } } }
        ]
      },
      include: {
        manager: true,
        members: true,
        tasks: {
          include: {
            assignee: true,
            createdBy: true
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create new project
router.post('/', auth, authorize(['ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    const { name, description, status, priority, startDate, endDate, budget, memberIds } = req.body;

    const project = await req.prisma.project.create({
      data: {
        name,
        description,
        status: status || 'PLANNING',
        priority: priority || 'MEDIUM',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget,
        managerId: req.user.userId,
        members: memberIds ? {
          connect: memberIds.map(id => ({ id }))
        } : undefined
      },
      include: {
        manager: true,
        members: true
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    const project = await req.prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined
      },
      include: {
        manager: true,
        members: true,
        tasks: true
      }
    });

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', auth, authorize(['ADMIN', 'PROJECT_MANAGER']), async (req, res) => {
  try {
    await req.prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

module.exports = router; 