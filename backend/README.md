# GIS POC Backend

A Flask-based backend application for GIS data processing and analysis with KPI data access.

## Features

- **Spatial Data Processing**: Grid-based spatial indexing for GeoJSON data
- **KPI Data API**: RESTful endpoints for accessing KPI data from 5 tables
- **Environment Configuration**: Centralized configuration management
- **Database Integration**: MySQL database with SQLAlchemy ORM
- **UI Compatibility**: Endpoints for existing frontend applications

## Architecture

**Main GIS API** (`app.py`) - Port 5000
- GeoJSON data endpoints
- KPI data endpoints
- Spatial data processing
- UI compatibility endpoints

## Quick Start

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Environment**:
   - Copy `sample.env` to `.env`
   - Update database and other settings in `.env`
   - Ensure `.env` is in your `.gitignore` for security

3. **Start the Main API**:
   ```bash
   python app.py
   ```

## Configuration

All configuration is managed through environment variables loaded from `.env` file:

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL database host | `localhost` | Yes |
| `DB_USER` | MySQL database username | `root` | Yes |
| `DB_PASSWORD` | MySQL database password | - | Yes |
| `DB_NAME` | MySQL database name | `gisdev` | Yes |
| `SECRET_KEY` | Flask secret key | `your-secret-key-here` | Yes |
| `FLASK_DEBUG` | Enable debug mode | `True` | No |
| `MAX_CONTENT_LENGTH` | Max file upload size (bytes) | `16777216` (16MB) | No |
| `UPLOAD_FOLDER` | Upload directory path | `./uploads` | No |
| `API_VERSION` | API version | `v1` | No |

### Setup Instructions

1. Copy the sample environment file:
   ```bash
   cp sample.env .env
   ```

2. Update `.env` with your production values:
   ```env
   # Database Configuration
   DB_HOST=your-db-host
   DB_USER=your-db-user
   DB_PASSWORD=your-secure-password
   DB_NAME=your-db-name
   
   # Security
   SECRET_KEY=your-super-secret-key-here
   
   # Production Settings
   FLASK_DEBUG=False
   ```

## API Endpoints

For detailed API documentation including endpoints, parameters, and response examples, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md).

## File Structure

```
GIS_POC/backend/
├── app.py                    # Main GIS API (Port 5000)
├── config.py                 # Configuration management
├── .env                      # Environment variables (not in git)
├── sample.env                # Environment template
├── routes/
│   ├── __init__.py
│   └── kpi_routes.py         # KPI data endpoints
├── requirements.txt          # Python dependencies
├── README.md                # This documentation
├── API_DOCUMENTATION.md     # Detailed API documentation
└── [data files]             # GeoJSON and CSV data files
```

## Database Tables

The application works with 5 KPI tables:

1. **market_kpi** - Market-level KPI data
2. **zip_kpi** - ZIP code-level KPI data
3. **hex_kpi** - Hex-level KPI data
4. **neighborhood_kpi** - Neighborhood-level KPI data
5. **site_kpi** - Site-level KPI data

Each table supports queries by:
- Primary key (`id`)
- Specific ID field (`market_id`, `zip_id`, `hex_id`, `neighborhood_id`, `site_id`)



## Troubleshooting

### Database Connection Issues
- Ensure MySQL server is running
- Verify database credentials in `.env` file
- The smart mapper will prompt for credentials if connection fails
- Check MySQL user permissions

### Service Issues
- **Main API**: Check port 5000 is available
- **Database**: Ensure MySQL is running and accessible
- **Memory**: Large GeoJSON files require sufficient RAM

### Performance Issues
- GeoJSON files are loaded into memory on startup
- Large datasets may require sufficient RAM
- Monitor database performance during queries

## Development

### Running the Application
```bash
python app.py
```

### Environment Variables
All configuration is centralized in `.env`. Update this file to change:
- Database connection settings
- Flask configuration
- API settings

**Security Note**: Never commit `.env` files to version control. The `.env` file is already in `.gitignore`.

## Production Deployment

### Prerequisites
- Python 3.8+
- MySQL 8.0+
- Nginx (recommended for production)
- Gunicorn or uWSGI (WSGI server)

### Production Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   pip install gunicorn  # For production WSGI server
   ```

2. **Configure Environment**:
   ```bash
   cp sample.env .env
   # Edit .env with production values
   ```

3. **Database Setup**:
   ```bash
   # Create database and tables
   mysql -u root -p < Gis_Dev_Schema.sql
   ```

4. **Run with Gunicorn**:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Security Considerations
- Set `FLASK_DEBUG=False` in production
- Use strong `SECRET_KEY`
- Configure proper database credentials
- Enable HTTPS in production
- Set up proper firewall rules
- Regular security updates
- Use environment variables for all sensitive data

### Monitoring and Logging

#### Application Logs
The application uses Python's built-in logging module. Logs include:
- Database connection status
- Data file loading progress
- API request errors
- Spatial index building status

#### Health Monitoring
Use the `/health` endpoint for:
- Load balancer health checks
- Application monitoring
- Data source availability verification

#### Performance Monitoring
Monitor these metrics:
- API response times
- Database query performance
- Memory usage (especially with large GeoJSON files)
- Disk I/O for file operations

## Documentation

- **API Documentation**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference
- **Database Schema**: [Gis_Dev_Schema.sql](Gis_Dev_Schema.sql) - Database structure and setup
