/**
 * PMTwin Configuration
 * Central configuration for the application
 */

const CONFIG = {
    // Application Info
    APP_NAME: 'PMTwin',
    APP_VERSION: '1.0.0',
    APP_DESCRIPTION: 'Construction Collaboration Platform',
    
    // Base path for loading resources
    // This is set by app-init.js during initialization
    BASE_PATH: '',
    
    // Storage Keys
    STORAGE_KEYS: {
        USERS: 'pmtwin_users',
        COMPANIES: 'pmtwin_companies',
        SESSIONS: 'pmtwin_sessions',
        OPPORTUNITIES: 'pmtwin_opportunities',
        APPLICATIONS: 'pmtwin_applications',
        MATCHES: 'pmtwin_matches',
        AUDIT: 'pmtwin_audit',
        NOTIFICATIONS: 'pmtwin_notifications',
        CONNECTIONS: 'pmtwin_connections',
        MESSAGES: 'pmtwin_messages',
        CONTRACTS: 'pmtwin_contracts',
        SYSTEM_SETTINGS: 'pmtwin_system_settings'
    },
    
    // Session Management
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    
    // Roles
    ROLES: {
        // Company Roles
        COMPANY_OWNER: 'company_owner',
        COMPANY_ADMIN: 'company_admin',
        COMPANY_MEMBER: 'company_member',
        
        // Professional Roles
        PROFESSIONAL: 'professional',
        CONSULTANT: 'consultant',
        
        // Admin Roles
        ADMIN: 'admin',
        MODERATOR: 'moderator',
        AUDITOR: 'auditor'
    },
    
    // Business Models
    MODELS: {
        PROJECT_BASED: 'project_based',
        STRATEGIC_PARTNERSHIP: 'strategic_partnership',
        RESOURCE_POOLING: 'resource_pooling',
        HIRING: 'hiring',
        COMPETITION: 'competition'
    },
    
    // Sub-Models
    SUB_MODELS: {
        TASK_BASED: 'task_based',
        CONSORTIUM: 'consortium',
        PROJECT_JV: 'project_jv',
        SPV: 'spv',
        STRATEGIC_JV: 'strategic_jv',
        STRATEGIC_ALLIANCE: 'strategic_alliance',
        MENTORSHIP: 'mentorship',
        BULK_PURCHASING: 'bulk_purchasing',
        EQUIPMENT_SHARING: 'equipment_sharing',
        RESOURCE_SHARING: 'resource_sharing',
        PROFESSIONAL_HIRING: 'professional_hiring',
        CONSULTANT_HIRING: 'consultant_hiring',
        COMPETITION_RFP: 'competition_rfp'
    },
    
    // Opportunity Status (unified lifecycle)
    OPPORTUNITY_STATUS: {
        DRAFT: 'draft',
        PUBLISHED: 'published',
        IN_NEGOTIATION: 'in_negotiation',
        CONTRACTED: 'contracted',
        IN_EXECUTION: 'in_execution',
        COMPLETED: 'completed',
        CLOSED: 'closed',
        CANCELLED: 'cancelled'
    },

    // Opportunity Intent (label-driven)
    OPPORTUNITY_INTENT: {
        REQUEST: 'request',
        OFFER: 'offer'
    },

    // Collaboration Model (wizard step 4)
    COLLABORATION_MODEL: {
        PROJECT: 'project',
        SERVICE: 'service',
        ADVISORY: 'advisory',
        CONSORTIUM: 'consortium'
    },

    // Payment Modes (multi-select)
    PAYMENT_MODES: {
        CASH: 'cash',
        BARTER: 'barter',
        EQUITY: 'equity',
        PROFIT_SHARING: 'profit_sharing',
        HYBRID: 'hybrid'
    },

    // Contract status
    CONTRACT_STATUS: {
        PENDING: 'pending',
        ACTIVE: 'active',
        COMPLETED: 'completed',
        TERMINATED: 'terminated'
    },
    
    // Application Status
    APPLICATION_STATUS: {
        PENDING: 'pending',
        REVIEWING: 'reviewing',
        SHORTLISTED: 'shortlisted',
        IN_NEGOTIATION: 'in_negotiation',
        ACCEPTED: 'accepted',
        REJECTED: 'rejected',
        WITHDRAWN: 'withdrawn'
    },
    
    // Connection request status
    CONNECTION_STATUS: {
        PENDING: 'pending',
        ACCEPTED: 'accepted',
        REJECTED: 'rejected'
    },

    // User/Company account status (registration and admin)
    USER_STATUS: {
        PENDING: 'pending',
        ACTIVE: 'active',
        SUSPENDED: 'suspended',
        REJECTED: 'rejected',
        CLARIFICATION_REQUESTED: 'clarification_requested'
    },

    // Matching
    MATCHING: {
        MIN_THRESHOLD: 0.70, // 70% minimum match score
        AUTO_NOTIFY_THRESHOLD: 0.80 // 80% for auto-notification
    },
    
    // Routes
    ROUTES: {
        HOME: '/',
        LOGIN: '/login',
        REGISTER: '/register',
        DASHBOARD: '/dashboard',
        OPPORTUNITIES: '/opportunities',
        CONTRACTS: '/contracts',
        OPPORTUNITY_CREATE: '/opportunities/create',
        OPPORTUNITY_DETAIL: '/opportunities/:id',
        PEOPLE: '/people',
        PERSON_PROFILE: '/people/:id',
        MESSAGES: '/messages',
        MESSAGE_THREAD: '/messages/:id',
        PROFILE: '/profile',
        SETTINGS: '/settings',
        ADMIN: '/admin',
        ADMIN_USERS: '/admin/users',
        ADMIN_VETTING: '/admin/vetting',
        ADMIN_OPPORTUNITIES: '/admin/opportunities',
        ADMIN_AUDIT: '/admin/audit',
        ADMIN_SETTINGS: '/admin/settings',
        ADMIN_REPORTS: '/admin/reports',
        ADMIN_COLLABORATION_MODELS: '/admin/collaboration-models',
        NOTIFICATIONS: '/notifications',
        COLLABORATION_WIZARD: '/collaboration-wizard',
        KNOWLEDGE_BASE: '/knowledge-base',
        COLLABORATION_MODELS: '/collaboration-models',
        FIND: '/find'
    },
    
    // API Endpoints (for future backend integration)
    API: {
        BASE_URL: '/api/v1',
        ENDPOINTS: {
            AUTH: '/auth',
            USERS: '/users',
            OPPORTUNITIES: '/opportunities',
            APPLICATIONS: '/applications',
            MATCHES: '/matches'
        }
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
