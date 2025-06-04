const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await req.prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: req.user.userId },
          { createdById: req.user.userId },
          { project: { managerId: req.user.userId } },
          { project: { members: { some: { id: req.user.userId } } } }
        ]
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 3 // Only latest 3 comments for list view
        },
        _count: {
          select: {
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get single task with all comments
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await req.prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            manager: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// Create new task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, projectId, dueDate, startDate } = req.body;

    const task = await req.prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        assigneeId,
        createdById: req.user.userId,
        projectId,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Emit real-time event
    if (req.io) {
      req.io.emit('taskCreated', task);
    }

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task (for team members - limited fields)
router.put('/:id', auth, async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;
    
    // Check if user has permission to update this task
    const existingTask = await req.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check permissions: assignee, creator, project manager, or project member
    const hasPermission = 
      existingTask.assigneeId === req.user.userId ||
      existingTask.createdById === req.user.userId ||
      existingTask.project.managerId === req.user.userId ||
      existingTask.project.members.some(member => member.id === req.user.userId);

    if (!hasPermission) {
      return res.status(403).json({ error: 'Not authorized to update this task' });
    }

    // For non-admins, limit what can be updated
    const allowedUpdates = {};
    if (req.user.role === 'ADMIN' || existingTask.project.managerId === req.user.userId) {
      // Admins and project managers can update everything
      Object.assign(allowedUpdates, updates);
    } else {
      // Team members can only update status, progress, and end dates
      const { status, progress, endDate, description } = updates;
      if (status !== undefined) allowedUpdates.status = status;
      if (progress !== undefined) allowedUpdates.progress = Math.min(100, Math.max(0, progress));
      if (endDate !== undefined) allowedUpdates.endDate = endDate ? new Date(endDate) : null;
      if (description !== undefined) allowedUpdates.description = description;
    }
    
    const task = await req.prisma.task.update({
      where: { id: taskId },
      data: {
        ...allowedUpdates,
        dueDate: allowedUpdates.dueDate ? new Date(allowedUpdates.dueDate) : undefined,
        startDate: allowedUpdates.startDate ? new Date(allowedUpdates.startDate) : undefined,
        endDate: allowedUpdates.endDate ? new Date(allowedUpdates.endDate) : undefined
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Emit real-time event
    if (req.io) {
      req.io.emit('taskUpdated', task);
    }

    res.json(task);
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Add comment to task
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const taskId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if user has access to this task
    const task = await req.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const hasAccess = 
      task.assigneeId === req.user.userId ||
      task.createdById === req.user.userId ||
      task.project.managerId === req.user.userId ||
      task.project.members.some(member => member.id === req.user.userId);

    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to comment on this task' });
    }

    const comment = await req.prisma.taskComment.create({
      data: {
        content: content.trim(),
        taskId,
        userId: req.user.userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Emit real-time event
    if (req.io) {
      req.io.emit('taskCommentAdded', comment);
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Update task progress (quick route for team members)
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const { progress } = req.body;
    const taskId = req.params.id;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    // Check if user is assigned to this task
    const task = await req.prisma.task.findUnique({
      where: { id: taskId },
      select: {
        assigneeId: true,
        createdById: true,
        projectId: true,
        project: {
          select: {
            managerId: true
          }
        }
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const canUpdate = 
      task.assigneeId === req.user.userId ||
      task.createdById === req.user.userId ||
      task.project.managerId === req.user.userId ||
      req.user.role === 'ADMIN';

    if (!canUpdate) {
      return res.status(403).json({ error: 'Not authorized to update this task progress' });
    }

    const updatedTask = await req.prisma.task.update({
      where: { id: taskId },
      data: { progress: Math.round(progress) },
      select: {
        id: true,
        progress: true,
        status: true,
        updatedAt: true,
        projectId: true,
        assigneeId: true
      }
    });

    // Emit real-time event
    if (req.io) {
      req.io.emit('taskUpdated', updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update task progress' });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await req.prisma.task.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router; 