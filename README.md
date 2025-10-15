
## Setup Instructions

### Prerequisites
- PHP 7.4+
- MySQL 5.7+
- Web server (Apache/Nginx)

### Installation
1. Clone the repository
2. Import database schema from `/database/setup.sql`
3. Configure database credentials in `/api/config.php`
4. Deploy to your web server

## API Endpoints
- `POST /api/register.php` - User registration
- `GET /api/users.php` - Get registered users

## Development
```bash
# Clone the repository
git clone https://github.com/yourusername/registration-app.git

# Make changes and commit
git add .
git commit -m "Description of changes"
git push origin main