# 🚀 Railway Deployment Guide - Zovx Labs Project Management

## Overview
This guide will help you deploy the Zovx Labs Project Management System to Railway.com with both backend and frontend services.

## Prerequisites
- Railway.com account
- Git repository (GitHub/GitLab)
- PostgreSQL database already running on Railway ✅

## Deployment Strategy

### Option 1: Monorepo Deployment (Recommended)
Deploy both frontend and backend from the same repository using Railway's service splitting.

### Option 2: Separate Services
Deploy backend and frontend as separate Railway services.

---

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub/GitLab:
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy Backend Service

1. **Create New Project in Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repository

2. **Configure Backend Service**
   - Service Name: `zovx-backend`
   - Root Directory: `/server`
   - Build Command: `npm install`
   - Start Command: `npm start`

3. **Set Environment Variables**
   ```
   DATABASE_URL=postgresql://postgres:empMuiaQoyzFsbryGCzhYfulkIBxOUXS@interchange.proxy.rlwy.net:46062/railway
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-railway
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=8000
   ADMIN_EMAIL=sandeep@zovx.pro
   ADMIN_PASSWORD=Sandeep@8332
   ```

4. **Deploy Backend**
   - Railway will automatically deploy your backend
   - Note the backend URL (e.g., `https://zovx-backend-production.up.railway.app`)

### 3. Deploy Frontend Service

1. **Add Frontend Service**
   - In the same Railway project, click "New Service"
   - Choose "GitHub Repo" again
   - Select the same repository

2. **Configure Frontend Service**
   - Service Name: `zovx-frontend`
   - Root Directory: `/client`
   - Build Command: `npm run build`
   - Start Command: `npx serve -s build -l 3000`

3. **Set Frontend Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend-url.up.railway.app
   GENERATE_SOURCEMAP=false
   ```

4. **Install Serve Package**
   Add to `client/package.json`:
   ```json
   {
     "dependencies": {
       "serve": "^14.2.1"
     }
   }
   ```

### 4. Update Backend CORS

Update the backend environment variable:
```
CLIENT_URL=https://your-frontend-url.up.railway.app
```

### 5. Update Frontend API Configuration

Update `client/src/config/api.js`:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend-url.up.railway.app';
```

---

## 🔒 Security Considerations

### Environment Variables to Set:
1. **JWT_SECRET**: Generate a strong secret
2. **DATABASE_URL**: Your Railway PostgreSQL URL
3. **NODE_ENV**: Set to 'production'
4. **CLIENT_URL**: Your frontend Railway URL

### Generate Strong JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🚀 Deployment Commands

### Backend Service Configuration:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Frontend Service with Serve:
```bash
# Install serve globally in the build
npm install -g serve
npm run build
serve -s build -l $PORT
```

---

## 📊 Post-Deployment

### 1. Database Setup
```bash
# Railway will run this automatically via postinstall
npx prisma generate
npx prisma db push
```

### 2. Test Endpoints
- Backend Health: `https://your-backend.railway.app/api/health`
- Frontend: `https://your-frontend.railway.app`

### 3. Admin Setup
Use the admin credentials:
- Email: `sandeep@zovx.pro`
- Password: `Sandeep@8332`

---

## 🔍 Monitoring & Logs

### Railway Dashboard Features:
- **Metrics**: CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: Deploy history and rollbacks
- **Custom Domains**: Add your own domain

### Useful Commands:
```bash
# View logs
railway logs

# Deploy specific service
railway up --service backend

# Set environment variable
railway variables set JWT_SECRET=your-secret
```

---

## 🛠 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure CLIENT_URL is set correctly
   - Check allowedOrigins in server configuration

2. **Database Connection**
   - Verify DATABASE_URL format
   - Ensure Prisma schema is up to date

3. **Build Failures**
   - Check package.json scripts
   - Verify Node.js version compatibility

4. **Socket.IO Issues**
   - Update frontend socket connection URL
   - Ensure CORS settings include Socket.IO origins

### Debug Commands:
```bash
# Test database connection
npx prisma db pull

# Generate Prisma client
npx prisma generate

# Check environment variables
echo $DATABASE_URL
```

---

## 🚀 Alternative: Single Service Deployment

If you prefer to serve the React build from Express:

1. **Update server/index.js**:
```javascript
// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});
```

2. **Update root package.json**:
```json
{
  "scripts": {
    "build": "cd client && npm run build",
    "start": "cd server && npm start",
    "postinstall": "npm run install-all && npm run build"
  }
}
```

---

## 📈 Scaling & Performance

### Railway Pro Features:
- **Auto-scaling**: Based on CPU/Memory usage
- **Multiple regions**: Deploy closer to users
- **Custom domains**: Professional URLs
- **SSL certificates**: Automatic HTTPS

### Optimization Tips:
1. Enable gzip compression
2. Use React.memo for components
3. Implement database connection pooling
4. Add Redis for session storage (optional)

---

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**: Add your domain (e.g., `pm.zovx.pro`)
2. **SSL Certificate**: Railway provides automatic HTTPS
3. **Monitoring**: Set up uptime monitoring
4. **Backups**: Configure database backups
5. **CI/CD**: Set up automated deployments

---

## 📞 Support

- Railway Documentation: [docs.railway.app](https://docs.railway.app)
- Railway Community: [railway.app/discord](https://railway.app/discord)
- Project Issues: Create GitHub issues for bugs

---

**Happy Deploying! 🚀** 