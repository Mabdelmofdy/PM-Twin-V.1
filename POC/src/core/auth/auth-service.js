/**
 * Authentication Service
 * Handles user authentication and authorization
 */

class AuthService {
    constructor() {
        this.dataService = window.dataService || dataService;
        this.currentUser = null;
        this.currentSession = null;
    }
    
    /**
     * Register a new user
     */
    async register(userData) {
        // Check if user already exists
        const existingUser = await this.dataService.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        
        // Hash password (simple encoding for POC - NOT secure for production)
        const passwordHash = this.encodePassword(userData.password);
        
        // Create user
        const user = await this.dataService.createUser({
            email: userData.email,
            passwordHash,
            role: userData.role,
            status: 'pending', // Requires admin approval
            profile: userData.profile || {}
        });
        
        // Create audit log
        await this.dataService.createAuditLog({
            userId: user.id,
            action: 'user_registered',
            entityType: 'user',
            entityId: user.id,
            details: { email: user.email, role: user.role }
        });
        
        return user;
    }
    
    /**
     * Login user
     */
    async login(email, password) {
        const user = await this.dataService.getUserOrCompanyByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        // Check password
        const passwordHash = this.encodePassword(password);
        if (user.passwordHash !== passwordHash) {
            throw new Error('Invalid email or password');
        }
        
        // Check user status
        if (user.status === 'pending') {
            throw new Error('Account pending approval. Please wait for admin verification.');
        }
        if (user.status === 'suspended') {
            throw new Error('Account suspended. Please contact support.');
        }
        
        // Create session
        const token = this.generateToken();
        await this.dataService.createSession(user.id, token);
        
        this.currentUser = user;
        this.currentSession = { token, userId: user.id };
        
        // Create audit log
        await this.dataService.createAuditLog({
            userId: user.id,
            action: 'user_logged_in',
            entityType: 'session',
            entityId: token,
            details: { email: user.email }
        });
        
        // Store in sessionStorage for page refresh
        sessionStorage.setItem('pmtwin_token', token);
        sessionStorage.setItem('pmtwin_user', JSON.stringify(user));
        
        return { user, token };
    }
    
    /**
     * Logout user
     */
    async logout() {
        if (this.currentSession) {
            await this.dataService.deleteSession(this.currentSession.token);
            
            // Create audit log
            if (this.currentUser) {
                await this.dataService.createAuditLog({
                    userId: this.currentUser.id,
                    action: 'user_logged_out',
                    entityType: 'session',
                    details: {}
                });
            }
        }
        
        this.currentUser = null;
        this.currentSession = null;
        sessionStorage.removeItem('pmtwin_token');
        sessionStorage.removeItem('pmtwin_user');
    }
    
    /**
     * Check if user is authenticated
     */
    async checkAuth() {
        const token = sessionStorage.getItem('pmtwin_token');
        if (!token) {
            return false;
        }
        
        const session = await this.dataService.getSessionByToken(token);
        if (!session) {
            sessionStorage.removeItem('pmtwin_token');
            sessionStorage.removeItem('pmtwin_user');
            return false;
        }
        
        const user = await this.dataService.getUserOrCompanyById(session.userId);
        if (!user || user.status !== 'active') {
            return false;
        }
        
        this.currentUser = user;
        this.currentSession = session;
        return true;
    }
    
    /**
     * Get current user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if user has required role
     */
    hasRole(requiredRole) {
        if (!this.currentUser) return false;
        return this.currentUser.role === requiredRole;
    }
    
    /**
     * Check if user has any of the required roles
     */
    hasAnyRole(requiredRoles) {
        if (!this.currentUser) return false;
        return requiredRoles.includes(this.currentUser.role);
    }
    
    /**
     * Check if user is admin
     */
    isAdmin() {
        return this.hasAnyRole([CONFIG.ROLES.ADMIN, CONFIG.ROLES.MODERATOR]);
    }
    
    /**
     * Check if user is company user
     */
    isCompanyUser() {
        return this.hasAnyRole([
            CONFIG.ROLES.COMPANY_OWNER,
            CONFIG.ROLES.COMPANY_ADMIN,
            CONFIG.ROLES.COMPANY_MEMBER
        ]);
    }
    
    /**
     * Check if user is professional
     */
    isProfessional() {
        return this.hasAnyRole([
            CONFIG.ROLES.PROFESSIONAL,
            CONFIG.ROLES.CONSULTANT
        ]);
    }
    
    /**
     * Simple password encoding (POC only - NOT secure)
     */
    encodePassword(password) {
        // Base64 encoding for POC - use proper hashing in production
        return btoa(password);
    }
    
    /**
     * Generate session token
     */
    generateToken() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create singleton instance
const authService = new AuthService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authService;
} else {
    window.authService = authService;
}
