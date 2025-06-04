#!/bin/bash

echo "🚀 Railway Deployment Setup for Zovx Labs Project Management"
echo "============================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Pre-deployment Checklist:${NC}"
echo "✅ PostgreSQL database running on Railway"
echo "✅ Code pushed to GitHub/GitLab repository"
echo "✅ Railway account created"
echo ""

echo -e "${YELLOW}🔧 Next Steps:${NC}"
echo "1. Go to https://railway.app"
echo "2. Create new project"
echo "3. Deploy from GitHub repo"
echo "4. Configure services as per RAILWAY_DEPLOYMENT.md"
echo ""

echo -e "${GREEN}📝 Environment Variables to Set:${NC}"
echo ""
echo -e "${BLUE}Backend Service:${NC}"
echo "DATABASE_URL=postgresql://postgres:empMuiaQoyzFsbryGCzhYfulkIBxOUXS@interchange.proxy.rlwy.net:46062/railway"
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")"
echo "JWT_EXPIRES_IN=7d"
echo "NODE_ENV=production"
echo "PORT=8000"
echo "ADMIN_EMAIL=sandeep@zovx.pro"
echo "ADMIN_PASSWORD=Sandeep@8332"
echo "CLIENT_URL=https://your-frontend-url.up.railway.app"
echo ""

echo -e "${BLUE}Frontend Service:${NC}"
echo "REACT_APP_API_URL=https://your-backend-url.up.railway.app"
echo "GENERATE_SOURCEMAP=false"
echo ""

echo -e "${YELLOW}🏗️ Build Commands:${NC}"
echo "Backend: npm install && npx prisma generate"
echo "Frontend: npm install && npm run build"
echo ""

echo -e "${GREEN}🎯 Start Commands:${NC}"
echo "Backend: npm start"
echo "Frontend: npx serve -s build -l \$PORT"
echo ""

echo -e "${RED}⚠️  Important:${NC}"
echo "1. Set CLIENT_URL after frontend is deployed"
echo "2. Update REACT_APP_API_URL after backend is deployed"
echo "3. Test both services after deployment"
echo ""

echo -e "${GREEN}📖 Full guide available in: RAILWAY_DEPLOYMENT.md${NC}"
echo ""
echo "Happy deploying! 🚀" 