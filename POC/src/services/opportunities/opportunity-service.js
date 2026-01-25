/**
 * Opportunity Service
 * Business logic for opportunity management
 */

class OpportunityService {
    constructor() {
        this.dataService = window.dataService || dataService;
        this.matchingService = window.matchingService || matchingService;
    }
    
    /**
     * Create opportunity and trigger matching
     */
    async createOpportunity(opportunityData) {
        const opportunity = await this.dataService.createOpportunity(opportunityData);
        
        // If published, trigger matching
        if (opportunity.status === 'published') {
            // Run matching in background (don't wait)
            this.matchingService.findMatchesForOpportunity(opportunity.id)
                .catch(error => console.error('Error running matching:', error));
        }
        
        return opportunity;
    }
    
    /**
     * Update opportunity status
     */
    async updateOpportunityStatus(opportunityId, newStatus) {
        const opportunity = await this.dataService.updateOpportunity(opportunityId, {
            status: newStatus
        });
        
        // If published, trigger matching
        if (newStatus === 'published') {
            this.matchingService.findMatchesForOpportunity(opportunityId)
                .catch(error => console.error('Error running matching:', error));
        }
        
        return opportunity;
    }
    
    /**
     * Get opportunities with filters
     */
    async getOpportunities(filters = {}) {
        let opportunities = await this.dataService.getOpportunities();
        
        if (filters.modelType) {
            opportunities = opportunities.filter(o => o.modelType === filters.modelType);
        }
        
        if (filters.status) {
            opportunities = opportunities.filter(o => o.status === filters.status);
        }
        
        if (filters.creatorId) {
            opportunities = opportunities.filter(o => o.creatorId === filters.creatorId);
        }
        
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            opportunities = opportunities.filter(o =>
                o.title?.toLowerCase().includes(searchLower) ||
                o.description?.toLowerCase().includes(searchLower)
            );
        }
        
        return opportunities;
    }
}

// Create singleton instance
const opportunityService = new OpportunityService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = opportunityService;
} else {
    window.opportunityService = opportunityService;
}
