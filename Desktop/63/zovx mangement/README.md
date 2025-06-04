# Zovx Labs Project Management System

A modern, comprehensive project management and team collaboration platform built for Zovx Labs.

## 🚀 Features

### Core Functionality
- **Project Management**: Create, track, and manage projects with detailed progress monitoring
- **Task Management**: Assign tasks, set priorities, track time, and manage dependencies
- **Team Collaboration**: Real-time updates, team member management, and role-based permissions
- **Dashboard Analytics**: Comprehensive overview with statistics and progress tracking
- **Real-time Updates**: Socket.IO integration for live collaboration

### Current Projects
The system comes pre-configured with Zovx Labs' three current projects:
1. **Sarvam.ai D2C Chatbot** (Completed) - AI-powered chatbot for D2C brands
2. **Job Matching Platform** (In Progress) - Intelligent job matching platform
3. **DPO/GRPO Fine-tuning Service** (Planning) - Fine-tuning as a service for enterprise clients

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time communication
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Rate limiting** for API security

### Frontend
- **React 18** with hooks and context
- **Material-UI (MUI)** for beautiful, responsive UI
- **React Router** for navigation
- **Axios** for API communication
- **Socket.IO Client** for real-time features

## 🏗 Architecture

```
zovx-project-management/
├── server/                 # Backend API
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── middleware/        # Authentication & authorization
│   └── index.js           # Server entry point
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── public/            # Static files
└── package.json           # Root package configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone and install dependencies**:
```bash
cd zovx-project-management
npm run install-all
```

2. **Configure environment** (create `server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zovx-pm
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

3. **Start the application**:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- React app on http://localhost:3000

### Alternative: Start services separately
```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

## 🔐 Authentication

The system includes demo accounts for testing:
- **Admin**: admin@zovx.com / password
- **User**: user@zovx.com / password

Or create a new account using the registration form.

## 📊 Key Features

### Dashboard
- Overview statistics for projects, tasks, and team
- Progress tracking with visual indicators
- Quick actions for common tasks
- Real-time connection status

### Project Management
- Create and manage projects with detailed information
- Track progress with completion percentages
- Assign team members with specific roles
- Set priorities, deadlines, and milestones
- Tag system for organization

### Task Management
- Create tasks within projects
- Assign to team members
- Set priorities and due dates
- Track time spent and estimated hours
- Subtasks and dependencies
- Comments and attachments

### Team Management
- User roles and permissions
- Profile management
- Activity tracking
- Skills and department organization

### Real-time Features
- Live updates when team members make changes
- Socket.IO integration for instant notifications
- Connection status indicators

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Dashboard
- `GET /api/dashboard/overview` - Get overview statistics
- `GET /api/dashboard/personal` - Get personal dashboard data

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Material Design
- **Responsive**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Theme**: Theme support (configurable)
- **Animations**: Smooth transitions and hover effects
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Account lockout after failed attempts

## 📈 Scalability

The system is designed to scale:
- Modular architecture
- Database indexing for performance
- API pagination for large datasets
- Efficient real-time updates
- Caching strategies ready to implement

## 🛠 Development

### Available Scripts

```bash
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only
npm run build        # Build for production
npm run install-all  # Install all dependencies
```

### Database Schema

The system uses MongoDB with three main collections:
- **Users**: User profiles, authentication, preferences
- **Projects**: Project information, team members, progress
- **Tasks**: Task details, assignments, time tracking

## 📝 Future Enhancements

- **Kanban Board**: Drag-and-drop task management
- **Gantt Charts**: Timeline visualization
- **File Management**: Document sharing and version control
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: React Native mobile application
- **Integration**: Third-party service integrations (Slack, GitHub, etc.)
- **Advanced Notifications**: Email and push notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏢 About Zovx Labs

Zovx Labs is an innovative technology company focused on AI and machine learning solutions. This project management system is designed to support our growing team and complex projects in the AI space.

---

**Built with ❤️ for Zovx Labs** 