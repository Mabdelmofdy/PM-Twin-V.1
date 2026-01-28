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
        this.CURRENT_SEED_VERSION = '1.6.0'; // Increment this to force re-seed (connections + messages + opportunities with attributes)
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
            const domains = ['users', 'companies', 'opportunities', 'applications', 'matches', 'notifications', 'connections', 'messages', 'audit', 'sessions'];
            
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
            'companies': CONFIG.STORAGE_KEYS.COMPANIES,
            'opportunities': CONFIG.STORAGE_KEYS.OPPORTUNITIES,
            'applications': CONFIG.STORAGE_KEYS.APPLICATIONS,
            'matches': CONFIG.STORAGE_KEYS.MATCHES,
            'notifications': CONFIG.STORAGE_KEYS.NOTIFICATIONS,
            'connections': CONFIG.STORAGE_KEYS.CONNECTIONS,
            'messages': CONFIG.STORAGE_KEYS.MESSAGES,
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
    
    // Get user or company by ID (checks both)
    async getUserOrCompanyById(id) {
        const user = await this.getUserById(id);
        if (user) return user;
        return await this.getCompanyById(id);
    }
    
    async getUserByEmail(email) {
        const users = await this.getUsers();
        return users.find(u => u.email === email) || null;
    }
    
    // Get user or company by email (for login - checks both)
    async getUserOrCompanyByEmail(email) {
        const user = await this.getUserByEmail(email);
        if (user) return user;
        const companies = await this.getCompanies();
        return companies.find(c => c.email === email) || null;
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
    
    // Company Operations
    async getCompanies() {
        return this.storage.get(CONFIG.STORAGE_KEYS.COMPANIES) || [];
    }
    
    async getCompanyById(id) {
        const companies = await this.getCompanies();
        return companies.find(c => c.id === id) || null;
    }
    
    async createCompany(companyData) {
        const companies = await this.getCompanies();
        const newCompany = {
            id: this.generateId(),
            ...companyData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        companies.push(newCompany);
        this.storage.set(CONFIG.STORAGE_KEYS.COMPANIES, companies);
        return newCompany;
    }
    
    async updateCompany(id, updates) {
        const companies = await this.getCompanies();
        const index = companies.findIndex(c => c.id === id);
        if (index === -1) return null;
        
        companies[index] = {
            ...companies[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.storage.set(CONFIG.STORAGE_KEYS.COMPANIES, companies);
        return companies[index];
    }
    
    async deleteCompany(id) {
        const companies = await this.getCompanies();
        const filtered = companies.filter(c => c.id !== id);
        this.storage.set(CONFIG.STORAGE_KEYS.COMPANIES, filtered);
        return true;
    }
    
    // Combined User/Company Operations (for People module)
    async getAllPeople() {
        const users = await this.getUsers();
        const companies = await this.getCompanies();
        return [...users, ...companies];
    }
    
    async getPersonById(id) {
        // Check users first
        const user = await this.getUserById(id);
        if (user) return user;
        // Then check companies
        return await this.getCompanyById(id);
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

    // Connection Operations (user-to-user connections)
    async getConnections() {
        return this.storage.get(CONFIG.STORAGE_KEYS.CONNECTIONS) || [];
    }

    async getConnectionBetweenUsers(userIdA, userIdB) {
        const connections = await this.getConnections();
        return connections.find(c =>
            (c.fromUserId === userIdA && c.toUserId === userIdB) ||
            (c.fromUserId === userIdB && c.toUserId === userIdA)
        ) || null;
    }

    /** Returns connection status for current user viewing another user: 'none' | 'pending_sent' | 'pending_received' | 'accepted' */
    async getConnectionStatus(currentUserId, otherUserId) {
        if (currentUserId === otherUserId) return 'self';
        const conn = await this.getConnectionBetweenUsers(currentUserId, otherUserId);
        if (!conn) return 'none';
        if (conn.status === CONFIG.CONNECTION_STATUS.ACCEPTED) return 'accepted';
        if (conn.fromUserId === currentUserId) return 'pending_sent';
        return 'pending_received';
    }

    async getConnectionsForUser(userId, status = CONFIG.CONNECTION_STATUS.ACCEPTED) {
        const connections = await this.getConnections();
        return connections.filter(c =>
            (c.fromUserId === userId || c.toUserId === userId) && c.status === status
        );
    }

    async createConnection(fromUserId, toUserId) {
        const existing = await this.getConnectionBetweenUsers(fromUserId, toUserId);
        if (existing) return existing;
        const connections = await this.getConnections();
        const newConnection = {
            id: this.generateId(),
            fromUserId,
            toUserId,
            status: CONFIG.CONNECTION_STATUS.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        connections.push(newConnection);
        this.storage.set(CONFIG.STORAGE_KEYS.CONNECTIONS, connections);
        return newConnection;
    }

    async updateConnection(id, updates) {
        const connections = await this.getConnections();
        const index = connections.findIndex(c => c.id === id);
        if (index === -1) return null;
        connections[index] = {
            ...connections[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.storage.set(CONFIG.STORAGE_KEYS.CONNECTIONS, connections);
        return connections[index];
    }

    async acceptConnection(connectionId) {
        return this.updateConnection(connectionId, { status: CONFIG.CONNECTION_STATUS.ACCEPTED });
    }

    async rejectConnection(connectionId) {
        return this.updateConnection(connectionId, { status: CONFIG.CONNECTION_STATUS.REJECTED });
    }

    // Message Operations (1:1 messages between users)
    async getMessages() {
        return this.storage.get(CONFIG.STORAGE_KEYS.MESSAGES) || [];
    }

    async getMessagesBetween(userIdA, userIdB) {
        const messages = await this.getMessages();
        return messages
            .filter(m =>
                (m.senderId === userIdA && m.receiverId === userIdB) ||
                (m.senderId === userIdB && m.receiverId === userIdA)
            )
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    async createMessage(senderId, receiverId, text) {
        const messages = await this.getMessages();
        const newMessage = {
            id: this.generateId(),
            senderId,
            receiverId,
            text: (text || '').trim(),
            read: false,
            createdAt: new Date().toISOString()
        };
        messages.push(newMessage);
        this.storage.set(CONFIG.STORAGE_KEYS.MESSAGES, messages);
        return newMessage;
    }

    async markMessagesAsRead(senderId, receiverId) {
        const messages = await this.getMessages();
        let changed = false;
        messages.forEach(m => {
            if (m.senderId === senderId && m.receiverId === receiverId && !m.read) {
                m.read = true;
                changed = true;
            }
        });
        if (changed) this.storage.set(CONFIG.STORAGE_KEYS.MESSAGES, messages);
    }

    /** Get list of conversation partners for a user (people they have messages with), with last message and unread count */
    async getConversationsForUser(userId) {
        const messages = await this.getMessages();
        const partnerMap = new Map(); // partnerId -> { partnerId, lastMessage, lastAt, unread }
        messages.forEach(m => {
            const isReceiver = m.receiverId === userId;
            const isSender = m.senderId === userId;
            const partnerId = isReceiver ? m.senderId : m.receiverId;
            if (!partnerMap.has(partnerId)) {
                partnerMap.set(partnerId, { partnerId, lastMessage: m.text, lastAt: m.createdAt, unread: 0 });
            }
            const entry = partnerMap.get(partnerId);
            if (new Date(m.createdAt) > new Date(entry.lastAt)) {
                entry.lastMessage = m.text;
                entry.lastAt = m.createdAt;
            }
            if (isReceiver && !m.read) entry.unread++;
        });
        
        // Also include connected people even if no messages yet
        const connections = await this.getConnectionsForUser(userId, CONFIG.CONNECTION_STATUS.ACCEPTED);
        connections.forEach(conn => {
            const partnerId = conn.fromUserId === userId ? conn.toUserId : conn.fromUserId;
            if (!partnerMap.has(partnerId)) {
                partnerMap.set(partnerId, { partnerId, lastMessage: null, lastAt: conn.updatedAt || conn.createdAt, unread: 0 });
            }
        });
        
        return Array.from(partnerMap.values()).sort((a, b) => {
            // Sort by last message time, or connection time if no messages
            const timeA = a.lastMessage ? new Date(a.lastAt) : new Date(0);
            const timeB = b.lastMessage ? new Date(b.lastAt) : new Date(0);
            return timeB - timeA;
        });
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
