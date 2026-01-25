# Technical Requirements

## Technology Stack (POC Phase)

### Frontend
- **HTML5**: Semantic markup, form validation, accessibility
- **CSS3**: Custom stylesheet, responsive design, CSS Grid/Flexbox, Custom Properties
- **JavaScript (ES6+)**: 
  - Modular architecture
  - Async/await for asynchronous operations
  - Classes and modules
  - localStorage API for data persistence

### Storage (POC)
- **localStorage**: Browser-based storage
- **sessionStorage**: Session management
- **Data Structure**: JSON format

### Architecture Pattern
- **Feature-Based Multi-Page Application (MPA)**
- Service layer abstraction
- API-ready design for backend integration

### Excluded (POC)
- No backend/server-side code
- No databases (localStorage only)
- No build tools or bundlers
- No frameworks (React, Vue, Angular)
- No CSS frameworks (custom CSS only)
- No package managers (CDN or inline scripts)

---

## File Structure

```
PMTwin-MVP/
├── BRD/                          # Business Requirements Documentation
│   ├── 01_Project_Manifesto.md
│   ├── 02_Ecosystem_Overview.md
│   ├── 03_Portal_Specifications.md
│   ├── 04_User_Flows.md
│   ├── 05_Technical_Requirements.md
│   ├── 06_Data_Models.md
│   └── 07_Admin_Portal_Specifications.md
├── docs/                         # Additional documentation
│   └── infographics/
├── POC/                         # Proof of Concept Application
│   ├── index.html               # Entry point
│   ├── pages/                   # Feature pages
│   │   ├── home/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── opportunities/
│   │   ├── opportunity-create/
│   │   ├── opportunity-detail/
│   │   ├── profile/
│   │   ├── pipeline/
│   │   ├── admin-dashboard/
│   │   ├── admin-users/
│   │   ├── admin-opportunities/
│   │   ├── admin-audit/
│   │   └── admin-settings/
│   ├── features/                # Feature components
│   │   ├── home/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── opportunities/
│   │   ├── opportunity-create/
│   │   ├── opportunity-detail/
│   │   ├── profile/
│   │   ├── pipeline/
│   │   ├── admin-dashboard/
│   │   ├── admin-users/
│   │   ├── admin-opportunities/
│   │   ├── admin-audit/
│   │   └── admin-settings/
│   ├── src/                     # Source code
│   │   ├── core/               # Core services
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── router/
│   │   │   ├── layout/
│   │   │   ├── storage/
│   │   │   ├── config/
│   │   │   └── init/
│   │   ├── services/           # Business services
│   │   │   ├── opportunities/
│   │   │   └── matching/
│   │   ├── business-logic/    # Business rules
│   │   │   └── models/
│   │   └── utils/             # Utilities
│   ├── assets/                # Static assets
│   │   ├── css/
│   │   └── images/
│   ├── data/                  # Seed data
│   └── templates/             # HTML templates
└── README.md
```

---

## Core Services

### 1. Storage Service
- Abstraction layer for localStorage
- CRUD operations
- Data serialization/deserialization
- Error handling

### 2. Data Service
- High-level data access
- Entity operations (Users, Opportunities, Applications, etc.)
- Data validation
- Relationships management

### 3. Auth Service
- User registration
- Login/logout
- Session management
- Role checking
- Password encoding (POC: Base64, Production: bcrypt)

### 4. Router Service
- Client-side routing
- Route registration
- Parameter extraction
- Navigation handling

### 5. Auth Guard
- Route protection
- Role-based access control
- Redirect handling

### 6. Layout Service
- Navigation rendering
- Footer rendering
- Layout updates

### 7. API Service
- API abstraction (ready for backend)
- Request/response handling
- Error handling

### 8. Matching Service
- Match score calculation
- Model-specific matching logic
- Notification triggering
- Recommendation generation

### 9. Opportunity Form Service
- Dynamic form generation
- Field rendering
- Form data collection
- Validation

---

## Data Models

See `06_Data_Models.md` for detailed specifications.

### Key Entities
- User (with Company/Professional profiles)
- Opportunity
- Application
- Match
- Notification
- AuditLog

---

## Business Rules

### Opportunity Creation
- Only authenticated users can create opportunities
- Company users can create all model types
- Professionals can create certain model types
- SPV requires minimum 50M SAR project value
- Required fields must be filled

### Application Submission
- Users cannot apply to own opportunities
- Only one application per user per opportunity
- Applications require proposal/statement
- Status workflow: pending → reviewing → shortlisted → accepted/rejected

### Matching
- Minimum threshold: 70%
- Auto-notify threshold: 80%
- Model-specific scoring weights
- Past performance consideration

### User Management
- New users require admin approval
- Suspended users cannot login
- Admin cannot approve own account

---

## Security Requirements (POC)

### Authentication
- Email/password login
- Session management
- Password encoding (Base64 for POC)

### Authorization
- Role-based access control
- Route protection
- Feature-level permissions

### Data Protection
- Input validation
- XSS prevention
- CSRF protection (future)

---

## Performance Requirements

### POC Phase
- Page load: < 2 seconds
- Form submission: < 1 second
- Search/filter: < 500ms

### Production Phase
- Page load: < 1 second
- API response: < 200ms
- Real-time updates: < 100ms

---

## Browser Compatibility

### Supported Browsers (POC)
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Required Features
- ES6+ support
- localStorage API
- Fetch API
- CSS Grid/Flexbox

---

## Accessibility

### WCAG 2.1 Level AA (Target)
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Color contrast
- Screen reader support

---

## Error Handling

### User-Facing Errors
- Clear error messages
- Actionable guidance
- Graceful degradation

### System Errors
- Console logging
- Error boundaries
- User-friendly fallbacks

---

## Testing Requirements (Future)

### Unit Tests
- Service functions
- Business logic
- Utilities

### Integration Tests
- User workflows
- API interactions
- Data flow

### E2E Tests
- Critical user paths
- Cross-browser testing

---

## Future Backend Integration

### API Design
- RESTful API
- JSON responses
- Standard HTTP status codes
- Authentication via JWT

### Migration Path
1. Replace localStorage calls with API calls
2. Update data service to use fetch
3. Add authentication headers
4. Handle API errors
5. Implement caching strategy

---

## Deployment (POC)

### Requirements
- Static file hosting
- No server-side processing
- HTTPS recommended

### Options
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront

---

## Monitoring & Analytics (Future)

### Metrics to Track
- Page views
- User actions
- Error rates
- Performance metrics
- Conversion rates

### Tools (Future)
- Google Analytics
- Error tracking (Sentry)
- Performance monitoring
- User behavior analytics
