# PMTwin MVP - Setup Guide

## Quick Start

1. **Open the Application**
   - Navigate to `POC/index.html` in your web browser
   - No build process or server required - it's a pure HTML/CSS/JS application

2. **Default Admin Account**
   - Email: `admin@pmtwin.com`
   - Password: `admin123`
   - This account is automatically created on first load

3. **Test the Application**
   - Register a new user (Company or Professional)
   - Login with the admin account to approve the new user
   - Create opportunities
   - Submit applications
   - View matches and recommendations

## File Structure

```
POC/
├── index.html                    # Entry point - open this in browser
├── pages/                        # Page HTML files
├── features/                     # Page JavaScript components
├── src/                          # Core application code
│   ├── core/                    # Core services (auth, storage, router)
│   ├── services/                # Business services (matching, opportunities)
│   └── business-logic/          # Business models and rules
└── assets/                       # CSS and images
    └── css/
        └── main.css             # Main stylesheet
```

## Browser Requirements

- Modern browser with ES6+ support
- localStorage API support
- No plugins or extensions required

## Features Implemented

### Public Portal
- ✅ Landing page
- ✅ Login/Registration
- ✅ Opportunity discovery (limited)

### User Portal
- ✅ Dashboard (role-adaptive)
- ✅ Opportunity creation (all 13 sub-models)
- ✅ Opportunity browsing and filtering
- ✅ Opportunity detail view
- ✅ Application submission
- ✅ Profile management
- ✅ Pipeline management (Kanban view)
- ✅ Matches and recommendations

### Admin Portal
- ✅ Admin dashboard
- ✅ User management and vetting
- ✅ Opportunity moderation
- ✅ Audit trail
- ✅ System settings

## Data Storage

All data is stored in browser localStorage:
- Data persists between sessions
- Data is browser-specific
- Clear browser data to reset

## Known Limitations (POC)

1. **No Backend**: All data stored in localStorage
2. **No Real Authentication**: Password encoding is Base64 (not secure)
3. **No Email**: Notifications are in-app only
4. **No File Uploads**: Document uploads not implemented
5. **No Real-time**: No WebSocket or real-time updates
6. **Single Browser**: Data doesn't sync across browsers/devices

## Testing Scenarios

### Scenario 1: Company Registration
1. Register as Company
2. Login as admin
3. Approve the company
4. Login as company
5. Create an opportunity
6. View applications

### Scenario 2: Professional Registration
1. Register as Professional
2. Login as admin
3. Approve the professional
4. Login as professional
5. Browse opportunities
6. Submit application
7. View matches

### Scenario 3: Matching
1. Create opportunity (as company)
2. Matching engine runs automatically
3. View matches in admin or user portal
4. Professional receives notification (if above threshold)

## Troubleshooting

### Page Not Loading
- Check browser console for errors
- Ensure all files are in correct locations
- Check that paths are relative to `POC/index.html`

### Data Not Persisting
- Check browser localStorage support
- Clear browser cache and reload
- Check browser console for storage errors

### Scripts Not Loading
- Check browser console for 404 errors
- Verify file paths are correct
- Ensure scripts are loaded in correct order

## Next Steps (Production)

1. Backend API development
2. Database migration
3. Real authentication (JWT, bcrypt)
4. Email service integration
5. File upload service
6. Real-time notifications
7. Enhanced security
8. Performance optimization
9. Mobile app development
10. Advanced analytics

## Support

For issues or questions:
- Check browser console for errors
- Review BRD documentation
- Check data models documentation
