const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

// Get dashboard overview (for admins/managers)
router.get('/overview', auth, async (req, res) => {
  try {
    // Get projects overview
    const projects = await req.prisma.project.findMany({
      include: {
        tasks: true,
        members: true
      }
    });

    // Get tasks overview
    const tasks = await req.prisma.task.findMany({
      include: {
        project: true
      }
    });

    // Get team overview
    const team = await req.prisma.user.findMany({
      where: {
        role: {
          in: ['DEVELOPER', 'DESIGNER', 'TESTER', 'TEAM_LEAD', 'PROJECT_MANAGER']
        }
      }
    });

    // Calculate project statistics
    const projectStats = {
      total: projects.length,
      completed: projects.filter(p => p.status === 'COMPLETED').length,
      inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
      planning: projects.filter(p => p.status === 'PLANNING').length,
      overdue: projects.filter(p => 
        new Date(p.endDate) < new Date() && p.status !== 'COMPLETED'
      ).length
    };

    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'COMPLETED').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      overdue: tasks.filter(t => 
        new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED'
      ).length
    };

    // Calculate team statistics
    const teamStats = {
      total: team.length,
      active: team.filter(member => member.isActive).length,
      developers: team.filter(member => member.role === 'DEVELOPER').length,
      designers: team.filter(member => member.role === 'DESIGNER').length,
      managers: team.filter(member => member.role === 'PROJECT_MANAGER').length
    };

    res.json({
      projects: projectStats,
      tasks: taskStats,
      team: teamStats,
      summary: {
        activeProjects: projectStats.inProgress,
        completionRate: projectStats.total > 0 ? 
          Math.round((projectStats.completed / projectStats.total) * 100) : 0,
        teamUtilization: teamStats.total > 0 ? 
          Math.round((teamStats.active / teamStats.total) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// Get personal dashboard data
router.get('/personal', auth, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get user's tasks
    const userTasks = await req.prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: userId },
          { createdById: userId }
        ]
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true
          }
        },
        assignee: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get user's projects (where user is manager or member)
    const userProjects = await req.prisma.project.findMany({
      where: {
        OR: [
          { managerId: userId },
          { 
            members: {
              some: {
                id: userId
              }
            }
          }
        ]
      },
      include: {
        manager: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        },
        tasks: {
          select: {
            id: true,
            status: true
          }
        }
      }
    });

    // Calculate personal task statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskStats = {
      total: userTasks.length,
      completed: userTasks.filter(t => t.status === 'COMPLETED').length,
      pending: userTasks.filter(t => t.status !== 'COMPLETED').length,
      overdue: userTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < today && t.status !== 'COMPLETED'
      ).length,
      dueToday: userTasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) >= today && 
        new Date(t.dueDate) < tomorrow
      ).length
    };

    // Get recent tasks (last 5)
    const recentTasks = userTasks.slice(0, 5);

    res.json({
      tasks: taskStats,
      projects: userProjects,
      recentTasks: recentTasks,
      productivity: {
        completionRate: taskStats.total > 0 ? 
          Math.round((taskStats.completed / taskStats.total) * 100) : 0,
        activeProjects: userProjects.filter(p => p.status === 'IN_PROGRESS').length,
        tasksThisWeek: userTasks.filter(t => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(t.createdAt) >= weekAgo;
        }).length
      }
    });
  } catch (error) {
    console.error('Personal dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch personal dashboard data' });
  }
});

module.exports = router; 