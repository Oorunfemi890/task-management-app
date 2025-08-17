# TaskFlow - Task Management Frontend

A modern, responsive task management application built with Vite + React, featuring real-time collaboration, drag-and-drop kanban boards, and comprehensive project management tools.

## 🚀 Features

### Core Functionality
- **Kanban Board**: Drag-and-drop task management with customizable columns
- **Real-time Collaboration**: Live updates using Socket.io
- **Project Management**: Organize tasks into projects with progress tracking
- **Team Management**: Invite team members and assign tasks
- **Advanced Filtering**: Filter tasks by status, priority, assignee, and project
- **Search**: Global search across tasks, projects, and team members

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Mode Support**: (Coming soon)
- **Notifications**: Real-time notifications for task updates
- **File Attachments**: Upload and manage task attachments
- **Comments**: Threaded comments on tasks
- **Activity Tracking**: Complete audit trail of task changes

### Analytics & Reporting
- **Dashboard**: Overview of tasks, projects, and team productivity
- **Analytics**: Detailed insights into project progress and team performance
- **Calendar View**: Task scheduling and deadline management
- **Reports**: Export data and generate reports

## 🛠 Technology Stack

- **Frontend Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer
- **API Client**: React Query for data fetching and caching
- **Real-time**: Socket.io Client
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Icons**: Lucide React
- **Drag & Drop**: react-beautiful-dnd
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── common/            # Reusable UI components
│   ├── dashboard/         # Dashboard specific components
│   ├── layout/            # Layout components (Sidebar, Header)
│   ├── projects/          # Project management components
│   ├── tasks/             # Task management components
│   └── team/              # Team management components
├── context/               # React Context providers
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
├── services/              # API services and utilities
├── utils/                 # Utility functions
├── assets/                # Static assets
└── App.jsx                # Main application component
```

## 🏃‍♂️ Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Backend API server running (see backend documentation)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-management-frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables:
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=TaskFlow
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗 Build and Deployment

### Development Build
```bash
npm run build
```

### Production Deployment
1. Build the application:
```bash
npm run build
```

2. The built files will be in the `dist/` directory
3. Deploy to your preferred hosting service (Vercel, Netlify, etc.)

### Environment Configuration
Make sure to set the following environment variables in production:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## 🎨 Customization

### Theming
The application uses Tailwind CSS for styling. You can customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#f0f9ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      }
    }
  }
}
```

### Components
All components are built with reusability in mind. Common patterns include:
- Props-based styling
- Compound components for complex UI
- Custom hooks for business logic

## 🔐 Authentication

The application supports JWT-based authentication with the following features:
- Login/Register
- Password reset
- Profile management
- Role-based access control

## 🌐 API Integration

### Services
API calls are organized into service classes:
- `authService` - Authentication endpoints
- `taskService` - Task and project management
- `socketService` - Real-time communication

### Error Handling
- Global error boundaries
- Toast notifications for user feedback
- Retry logic for failed requests

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🧪 Testing

Testing setup includes:
- Unit tests with Vitest
- Component tests with React Testing Library
- E2E tests with Playwright (planned)

Run tests:
```bash
npm run test
```

## 🚀 Performance

Performance optimizations include:
- Code splitting with lazy loading
- React Query for caching
- Virtual scrolling for large lists
- Image optimization
- Bundle analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## 🗺 Roadmap

### Upcoming Features
- [ ] Dark mode
- [ ] Offline support
- [ ] Advanced analytics
- [ ] Time tracking
- [ ] Gantt charts
- [ ] Mobile app (React Native)
- [ ] Integration with external tools (Slack, GitHub)

### Version History
- v1.0.0 - Initial release with core features
- v1.1.0 - Real-time collaboration (planned)
- v1.2.0 - Advanced analytics (planned)