# ConnectSphere - Social Network Platform

A full-featured, production-grade social network platform built with Django REST Framework, React, PostgreSQL, Redis, Celery, WebSocket, and Elasticsearch.

## Features

- **User Profiles** - Customizable profiles with avatars, bios, privacy settings
- **Posts** - Text, image, and video posts with rich media support
- **News Feed** - Algorithmic feed based on engagement, recency, and social graph
- **Friend System** - Friend requests, friendships, followers, blocking
- **Groups** - Community groups with membership roles, rules, and moderation
- **Pages** - Public pages for brands, organizations, and public figures
- **Stories** - Ephemeral 24-hour stories with view tracking
- **Reactions** - Multiple reaction types (like, love, haha, wow, sad, angry)
- **Comments** - Threaded comments with replies
- **Sharing** - Post sharing with optional commentary
- **Notifications** - Real-time WebSocket notifications
- **Content Moderation** - Reporting, flagging, and moderation actions
- **Search** - Full-text search powered by Elasticsearch

## Tech Stack

### Backend
- **Django 5.0** - Web framework
- **Django REST Framework** - API layer
- **Django Channels** - WebSocket support
- **PostgreSQL 16** - Primary database
- **Redis 7** - Caching and message broker
- **Celery** - Async task processing
- **Elasticsearch 8** - Full-text search
- **Pillow** - Image processing
- **django-storages** - Cloud file storage

### Frontend
- **React 18** - UI library
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Reverse proxy and static file serving
- **Gunicorn** - WSGI server
- **Daphne** - ASGI server (WebSocket)

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- Git

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/your-org/connectsphere.git
cd connectsphere
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Build and start all services:
```bash
docker-compose up --build
```

4. Run database migrations:
```bash
docker-compose exec backend python manage.py migrate
```

5. Create a superuser:
```bash
docker-compose exec backend python manage.py createsuperuser
```

6. Access the application:
- Frontend: http://localhost
- Backend API: http://localhost/api/
- Admin Panel: http://localhost/admin/
- API Documentation: http://localhost/api/docs/

## Project Structure

```
connectsphere/
├── backend/
│   ├── config/             # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   ├── wsgi.py
│   │   ├── celery.py
│   │   └── routing.py
│   ├── apps/
│   │   ├── accounts/       # User management & profiles
│   │   ├── posts/          # Posts & feed algorithm
│   │   ├── interactions/   # Reactions, comments, bookmarks
│   │   ├── friends/        # Friend system & blocking
│   │   ├── groups/         # Community groups
│   │   ├── pages/          # Public pages
│   │   ├── stories/        # Ephemeral stories
│   │   ├── notifications/  # Real-time notifications
│   │   ├── moderation/     # Content moderation
│   │   └── search/         # Elasticsearch integration
│   └── utils/              # Shared utilities
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/            # API client modules
│       ├── components/     # Reusable UI components
│       ├── pages/          # Route-level page components
│       ├── store/          # Redux store & slices
│       ├── hooks/          # Custom React hooks
│       └── styles/         # Global styles
├── nginx/                  # Nginx configuration
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - JWT login
- `POST /api/auth/token/refresh/` - Token refresh
- `POST /api/auth/logout/` - Logout

### Users & Profiles
- `GET /api/accounts/profile/{username}/` - Get user profile
- `PATCH /api/accounts/profile/` - Update own profile
- `PATCH /api/accounts/settings/` - Update settings
- `PATCH /api/accounts/privacy/` - Update privacy settings

### Posts
- `GET /api/posts/feed/` - Personalized news feed
- `POST /api/posts/` - Create a post
- `GET /api/posts/{id}/` - Get post detail
- `POST /api/posts/{id}/share/` - Share a post

### Friends
- `POST /api/friends/request/` - Send friend request
- `POST /api/friends/request/{id}/accept/` - Accept request
- `GET /api/friends/` - List friends
- `POST /api/friends/block/` - Block user

### Groups
- `POST /api/groups/` - Create group
- `POST /api/groups/{id}/join/` - Join group
- `GET /api/groups/{id}/posts/` - Group posts

### Notifications
- `GET /api/notifications/` - List notifications
- WebSocket: `ws://localhost/ws/notifications/`

### Search
- `GET /api/search/?q=query` - Global search

## Environment Variables

See `.env.example` for all configuration options.

## Development

### Running Tests
```bash
docker-compose exec backend python manage.py test
```

### Code Formatting
```bash
# Backend
docker-compose exec backend black .
docker-compose exec backend isort .

# Frontend
docker-compose exec frontend npm run lint
```

## Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Configure proper `SECRET_KEY`
3. Set up SSL/TLS certificates
4. Configure production database credentials
5. Set up cloud storage for media files (AWS S3 recommended)
6. Configure email backend for notifications

## License

MIT License - see LICENSE file for details.
