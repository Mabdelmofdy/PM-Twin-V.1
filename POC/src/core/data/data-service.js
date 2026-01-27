/**
 * Data Service
 * High-level data access layer for all entities
 * Uses browser localStorage for all CRUD operations
 */

class DataService {
    constructor() {
        this.storage = window.storageService || storageService;
        this.initialized = false;
        this.SEED_DATA_VERSION_KEY = 'pmtwin_seed_version';
        this.CURRENT_SEED_VERSION = '1.0.1'; // Increment this to force re-seed
    }
    
    /**
     * Get the data path using centralized BASE_PATH
     */
    get jsonDataPath() {
        return (window.CONFIG?.BASE_PATH || '') + 'data/';
    }
    
    /**
     * Initialize data from JSON files on first launch or when seed version changes
     */
    async initializeFromJSON() {
        if (this.initialized) return;
        
        try {
            // Check if we need to seed data
            const storedVersion = this.storage.get(this.SEED_DATA_VERSION_KEY);
            const needsSeed = !storedVersion || storedVersion !== this.CURRENT_SEED_VERSION;
            
            if (!needsSeed) {
                console.log('Data already initialized, skipping seed');
                this.initialized = true;
                return;
            }
            
            console.log('Initializing data from JSON seed files...');
            
            // Clear existing data if re-seeding
            if (storedVersion && storedVersion !== this.CURRENT_SEED_VERSION) {
                console.log('Seed version changed, clearing old data...');
                this.clearAllData();
            }
            
            // Load from JSON files
            const domains = ['users', 'opportunities', 'applications', 'matches', 'notifications', 'audit', 'sessions'];
            
            for (const domain of domains) {
                try {
                    const response = await fetch(`${this.jsonDataPath}${domain}.json`);
                    if (response.ok) {
                        const jsonData = await response.json();
                        if (jsonData.data && Array.isArray(jsonData.data)) {
                            const storageKey = this.getStorageKeyForDomain(domain);
                            if (storageKey) {
                                this.storage.set(storageKey, jsonData.data);
                                console.log(`Loaded ${jsonData.data.length} ${domain} records`);
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to load ${domain}.json:`, error);
                    // Initialize with empty array if JSON fails
                    const storageKey = this.getStorageKeyForDomain(domain);
                    if (storageKey && !this.storage.get(storageKey)) {
                        this.storage.set(storageKey, []);
                    }
                }
            }
            
            // Store seed version
            this.storage.set(this.SEED_DATA_VERSION_KEY, this.CURRENT_SEED_VERSION);
            
            this.initialized = true;
            console.log('Data initialization complete');
        } catch (error) {
            console.error('Error initializing from JSON:', error);
        }
    }
    
    /**
     * Clear all stored data (useful for reset)
     */
    clearAllData() {
        Object.values(CONFIG.STORAGE_KEYS).forEach(key => {
            this.storage.remove(key);
        });
    }
    
    /**
     * Force re-seed from JSON files
     */
    async reseedFromJSON() {
        this.storage.remove(this.SEED_DATA_VERSION_KEY);
        this.initialized = false;
        await this.initializeFromJSON();
    }
    
    /**
     * Get storage key for a domain
     */
    getStorageKeyForDomain(domain) {
        const keyMap = {
            'users': CONFIG.STORAGE_KEYS.USERS,
            'opportunities': CONFIG.STORAGE_KEYS.OPPORTUNITIES,
            'applications': CONFIG.STORAGE_KEYS.APPLICATIONS,
            'matches': CONFIG.STORAGE_KEYS.MATCHES,
            'notifications': CONFIG.STORAGE_KEYS.NOTIFICATIONS,
            'audit': CONFIG.STORAGE_KEYS.AUDIT,
            'sessions': CONFIG.STORAGE_KEYS.SESSIONS
        };
        return keyMap[domain];
    }
    
    /**
     * Load domain data from JSON file (for seeding/backup)
     */
    async loadDomainDataFromJSON(domain) {
        try {
            const response = await fetch(`${this.jsonDataPath}${domain}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${domain}.json`);
            }
            const jsonData = await response.json();
            return jsonData.data || [];
        } catch (error) {
            console.error(`Error loading ${domain} from JSON:`, error);
            return [];
        }
    }
    
    // User Operations
    async getUsers() {
        return this.storage.get(CONFIG.STORAGE_KEYS.USERS) || [];
    }
    
    async getUserById(id) {
        const users = await this.getUsers();
        return users.find(u => u.id === id) || null;
    }
    
    async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(u => u.email === email) || null;
    }
    
    async createUser(userData) {
        const users = await this.getUsers();
        const newUser = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        this.storage.set(CONFIG.STORAGE_KEYS.USERS, users);
        return newUser;
    }
    
    async updateUser(id, updates) {
        const users = await this.getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        
        users[index] = {
            ...users[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.storage.set(CONFIG.STORAGE_KEYS.USERS, users);
        return users[index];
    }
    
    // Session Operations
    async getSessions() {
        return this.storage.get(CONFIG.STORAGE_KEYS.SESSIONS) || [];
    }
    
    async createSession(userId, token) {
        const sessions = await this.getSessions();
        const session = {
            userId,
            token,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + CONFIG.SESSION_DURATION).toISOString()
        };
        sessions.push(session);
        this.storage.set(CONFIG.STORAGE_KEYS.SESSIONS, sessions);
        return session;
    }
    
    async getSessionByToken(token) {
        const sessions = await this.getSessions();
        return sessions.find(s => s.token === token && new Date(s.expiresAt) > new Date()) || null;
    }
    
    async deleteSession(token) {
        const sessions = await this.getSessions();
        const filtered = sessions.filter(s => s.token !== token);
        this.storage.set(CONFIG.STORAGE_KEYS.SESSIONS, filtered);
    }
    
    // Opportunity Operations
    async getOpportunities() {
        return this.storage.get(CONFIG.STORAGE_KEYS.OPPORTUNITIES) || [];
    }
    
    async getOpportunityById(id) {
        const opportunities = await this.getOpportunities();
        return opportunities.find(o => o.id === id) || null;
    }
    
    async createOpportunity(opportunityData) {
        const opportunities = await this.getOpportunities();
        const newOpportunity = {
            id: this.generateId(),
            ...opportunityData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        opportunities.push(newOpportunity);
        this.storage.set(CONFIG.STORAGE_KEYS.OPPORTUNITIES, opportunities);
        return newOpportunity;
    }
    
    async updateOpportunity(id, updates) {
        const opportunities = await this.getOpportunities();
        const index = opportunities.findIndex(o => o.id === id);
        if (index === -1) return null;
        
        opportunities[index] = {
            ...opportunities[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.storage.set(CONFIG.STORAGE_KEYS.OPPORTUNITIES, opportunities);
        return opportunities[index];
    }
    
    async deleteOpportunity(id) {
        const opportunities = await this.getOpportunities();
        const filtered = opportunities.filter(o => o.id !== id);
        this.storage.set(CONFIG.STORAGE_KEYS.OPPORTUNITIES, filtered);
        return true;
    }
    
    // Application Operations
    async getApplications() {
        return this.storage.get(CONFIG.STORAGE_KEYS.APPLICATIONS) || [];
    }
    
    async getApplicationById(id) {
        const applications = await this.getApplications();
        return applications.find(a => a.id === id) || null;
    }
    
    async createApplication(applicationData) {
        const applications = await this.getApplications();
        const newApplication = {
            id: this.generateId(),
            ...applicationData,
            status: CONFIG.APPLICATION_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        applications.push(newApplication);
        this.storage.set(CONFIG.STORAGE_KEYS.APPLICATIONS, applications);
        return newApplication;
    }
    
    async updateApplication(id, updates) {
        const applications = await this.getApplications();
        const index = applications.findIndex(a => a.id === id);
        if (index === -1) return null;
        
        applications[index] = {
            ...applications[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.storage.set(CONFIG.STORAGE_KEYS.APPLICATIONS, applications);
        return applications[index];
    }
    
    // Match Operations
    async getMatches() {
        return this.storage.get(CONFIG.STORAGE_KEYS.MATCHES) || [];
    }
    
    async createMatch(matchData) {
        const matches = await this.getMatches();
        const newMatch = {
            id: this.generateId(),
            ...matchData,
            notified: false,
            createdAt: new Date().toISOString()
        };
        matches.push(newMatch);
        this.storage.set(CONFIG.STORAGE_KEYS.MATCHES, matches);
        return newMatch;
    }
    
    // Notification Operations
    async getNotifications(userId) {
        const notifications = this.storage.get(CONFIG.STORAGE_KEYS.NOTIFICATIONS) || [];
        return notifications.filter(n => n.userId === userId);
    }
    
    async createNotification(notificationData) {
        const notifications = this.storage.get(CONFIG.STORAGE_KEYS.NOTIFICATIONS) || [];
        const newNotification = {
            id: this.generateId(),
            read: false,
            ...notificationData,
            createdAt: new Date().toISOString()
        };
        notifications.push(newNotification);
        this.storage.set(CONFIG.STORAGE_KEYS.NOTIFICATIONS, notifications);
        return newNotification;
    }
    
    async markNotificationRead(id) {
        const notifications = this.storage.get(CONFIG.STORAGE_KEYS.NOTIFICATIONS) || [];
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index].read = true;
            this.storage.set(CONFIG.STORAGE_KEYS.NOTIFICATIONS, notifications);
        }
    }
    
    // Audit Log Operations
    async createAuditLog(logData) {
        const logs = this.storage.get(CONFIG.STORAGE_KEYS.AUDIT) || [];
        const newLog = {
            id: this.generateId(),
            ...logData,
            timestamp: new Date().toISOString()
        };
        logs.push(newLog);
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.shift();
        }
        this.storage.set(CONFIG.STORAGE_KEYS.AUDIT, logs);
        return newLog;
    }
    
    async getAuditLogs(filters = {}) {
        let logs = this.storage.get(CONFIG.STORAGE_KEYS.AUDIT) || [];
        
        if (filters.userId) {
            logs = logs.filter(l => l.userId === filters.userId);
        }
        if (filters.entityType) {
            logs = logs.filter(l => l.entityType === filters.entityType);
        }
        if (filters.startDate) {
            logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate));
        }
        if (filters.endDate) {
            logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate));
        }
        
        return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    // Utility Methods
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Create singleton instance
const dataService = new DataService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = dataService;
} else {
    window.dataService = dataService;
}
