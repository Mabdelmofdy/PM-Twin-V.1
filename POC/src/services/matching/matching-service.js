/**
 * Matching Service
 * Implements matching algorithm for opportunities and candidates
 */

class MatchingService {
    constructor() {
        this.dataService = window.dataService || dataService;
        this.minThreshold = CONFIG.MATCHING.MIN_THRESHOLD;
        this.autoNotifyThreshold = CONFIG.MATCHING.AUTO_NOTIFY_THRESHOLD;
    }
    
    /**
     * Find matches for an opportunity
     */
    async findMatchesForOpportunity(opportunityId) {
        const opportunity = await this.dataService.getOpportunityById(opportunityId);
        if (!opportunity) {
            throw new Error('Opportunity not found');
        }
        
        const allUsers = await this.dataService.getUsers();
        const activeUsers = allUsers.filter(u => u.status === 'active');
        
        const matches = [];
        
        for (const user of activeUsers) {
            // Skip the creator
            if (user.id === opportunity.creatorId) {
                continue;
            }
            
            const matchScore = await this.calculateMatchScore(opportunity, user);
            
            if (matchScore >= this.minThreshold) {
                matches.push({
                    opportunityId,
                    candidateId: user.id,
                    matchScore,
                    criteria: await this.getMatchCriteria(opportunity, user),
                    notified: false
                });
            }
        }
        
        // Sort by match score (highest first)
        matches.sort((a, b) => b.matchScore - a.matchScore);
        
        // Save matches
        for (const match of matches) {
            await this.dataService.createMatch(match);
            
            // Auto-notify if above threshold
            if (match.matchScore >= this.autoNotifyThreshold) {
                await this.notifyMatch(match, opportunity, user);
            }
        }
        
        return matches;
    }
    
    /**
     * Calculate match score between opportunity and candidate
     * Uses scope (skills, sectors, interests, certifications) and payment compatibility when present
     */
    async calculateMatchScore(opportunity, candidate) {
        let totalScore = 0;
        let maxScore = 0;
        const scope = opportunity.scope || opportunity.attributes || {};
        const candidateProfile = candidate.profile || {};
        
        // Scope-based matching (unified workflow: requiredSkills/offeredSkills, sectors, interests, certifications)
        const skills = scope.requiredSkills || scope.offeredSkills || [];
        const skillsArr = Array.isArray(skills) ? skills : (skills ? [skills] : []);
        if (skillsArr.length > 0) {
            const candidateSkills = [].concat(
                candidateProfile.specializations || [],
                candidateProfile.skills || [],
                (candidateProfile.classifications || []).map(c => typeof c === 'string' ? c : c.label)
            ).filter(Boolean);
            const matchCount = skillsArr.filter(s =>
                candidateSkills.some(cs => String(cs).toLowerCase().includes(String(s).toLowerCase()))
            ).length;
            totalScore += (matchCount / skillsArr.length) * 50;
            maxScore += 50;
        }
        
        const sectors = scope.sectors || [];
        const sectorsArr = Array.isArray(sectors) ? sectors : (sectors ? [sectors] : []);
        if (sectorsArr.length > 0) {
            const candidateSectors = candidateProfile.sectors || candidateProfile.industry || [];
            const candArr = Array.isArray(candidateSectors) ? candidateSectors : (candidateSectors ? [candidateSectors] : []);
            const sectorMatch = sectorsArr.some(s =>
                candArr.some(c => String(c).toLowerCase().includes(String(s).toLowerCase()))
            );
            totalScore += sectorMatch ? 15 : 0;
            maxScore += 15;
        }
        
        const certifications = scope.certifications || [];
        const certArr = Array.isArray(certifications) ? certifications : (certifications ? [certifications] : []);
        if (certArr.length > 0) {
            const candidateCerts = candidateProfile.certifications || [];
            const candCerts = Array.isArray(candidateCerts) ? candidateCerts : (candidateCerts ? [candidateCerts] : []);
            const certMatch = certArr.filter(c =>
                candCerts.some(cd => String(cd).toLowerCase().includes(String(c).toLowerCase()))
            ).length;
            totalScore += (certMatch / certArr.length) * 15;
            maxScore += 15;
        }
        
        // Payment compatibility: opportunity.paymentModes vs candidate preferredPaymentModes (use same id convention, e.g. lookup ids: cash, barter, equity)
        const paymentModes = opportunity.paymentModes || (opportunity.exchangeMode ? [opportunity.exchangeMode] : []);
        if (paymentModes.length > 0) {
            const candidatePreferred = candidateProfile.preferredPaymentModes || candidateProfile.exchangeTypes || [];
            const preferredArr = Array.isArray(candidatePreferred) ? candidatePreferred : (candidatePreferred ? [candidatePreferred] : []);
            const compatible = paymentModes.some(pm =>
                preferredArr.some(pp => String(pp).toLowerCase() === String(pm).toLowerCase())
            );
            totalScore += compatible ? 10 : (preferredArr.length === 0 ? 5 : 0);
            maxScore += 10;
        }
        
        const modelType = opportunity.modelType;
        const subModelType = opportunity.subModelType;
        const attributes = opportunity.attributes || {};
        
        if (modelType) {
        // Model-specific matching logic (when modelType present)
        switch (modelType) {
            case CONFIG.MODELS.PROJECT_BASED:
                totalScore += await this.matchProjectBased(opportunity, candidate, subModelType);
                maxScore += 100;
                break;
                
            case CONFIG.MODELS.STRATEGIC_PARTNERSHIP:
                totalScore += await this.matchStrategicPartnership(opportunity, candidate, subModelType);
                maxScore += 100;
                break;
                
            case CONFIG.MODELS.RESOURCE_POOLING:
                totalScore += await this.matchResourcePooling(opportunity, candidate, subModelType);
                maxScore += 100;
                break;
                
            case CONFIG.MODELS.HIRING:
                totalScore += await this.matchHiring(opportunity, candidate, subModelType);
                maxScore += 100;
                break;
                
            case CONFIG.MODELS.COMPETITION:
                totalScore += await this.matchCompetition(opportunity, candidate);
                maxScore += 100;
                break;
        }
        }
        
        const performanceScore = await this.getPastPerformanceScore(candidate, modelType || 'project_based');
        totalScore += performanceScore;
        maxScore += 20;
        
        return maxScore > 0 ? totalScore / maxScore : 0;
    }
    
    /**
     * Match for Project-Based opportunities
     */
    async matchProjectBased(opportunity, candidate, subModelType) {
        let score = 0;
        const attributes = opportunity.attributes || {};
        const candidateProfile = candidate.profile || {};
        
        switch (subModelType) {
            case CONFIG.SUB_MODELS.TASK_BASED:
                // Skill match (40 points)
                if (attributes.requiredSkills) {
                    const requiredSkills = Array.isArray(attributes.requiredSkills) 
                        ? attributes.requiredSkills 
                        : [attributes.requiredSkills];
                    const candidateSkills = Array.isArray(candidateProfile.specializations)
                        ? candidateProfile.specializations
                        : [];
                    
                    const matchingSkills = requiredSkills.filter(skill => 
                        candidateSkills.some(cs => cs.toLowerCase().includes(skill.toLowerCase()))
                    );
                    score += (matchingSkills.length / requiredSkills.length) * 40;
                }
                
                // Experience match (20 points)
                if (attributes.experienceLevel) {
                    const candidateExp = candidateProfile.yearsExperience || 0;
                    const expMap = { 'Junior': 0, 'Mid-Level': 3, 'Senior': 7, 'Expert': 10 };
                    const requiredExp = expMap[attributes.experienceLevel] || 0;
                    
                    if (candidateExp >= requiredExp) {
                        score += 20;
                    } else {
                        score += (candidateExp / requiredExp) * 20;
                    }
                }
                
                // Budget compatibility (20 points)
                if (attributes.budgetRange) {
                    // Assume candidate has rate in profile or use default
                    score += 20; // Simplified - would check against candidate's rate
                }
                
                // Location compatibility (10 points)
                if (attributes.locationRequirement) {
                    score += 10; // Simplified - would check candidate's location preferences
                }
                
                // Availability match (10 points)
                if (attributes.startDate) {
                    score += 10; // Simplified - would check candidate's availability
                }
                break;
                
            case CONFIG.SUB_MODELS.CONSORTIUM:
            case CONFIG.SUB_MODELS.PROJECT_JV:
                // Scope match (30 points)
                if (attributes.memberRoles || attributes.partnerRoles) {
                    const roles = attributes.memberRoles || attributes.partnerRoles || [];
                    const rawCaps = candidateProfile.classifications || candidateProfile.specializations || [];
                    const candidateCapabilities = rawCaps.map(c => (typeof c === 'string' ? c : (c?.label || c?.role || ''))).filter(Boolean);
                    
                    if (Array.isArray(roles) && roles.length > 0) {
                        const roleStr = (r) => (typeof r === 'string' ? r : (r?.role || r?.label || ''));
                        const matchingRoles = roles.filter(role => {
                            const r = roleStr(role);
                            if (!r) return false;
                            return candidateCapabilities.some(cap =>
                                cap.toLowerCase().includes(r.toLowerCase())
                            );
                        });
                        score += (matchingRoles.length / roles.length) * 30;
                    } else {
                        score += 30;
                    }
                }
                
                // Financial capacity (30 points)
                if (attributes.projectValue || attributes.capitalContribution) {
                    const projectValue = attributes.projectValue || attributes.capitalContribution || 0;
                    const candidateCapacity = candidateProfile.financialCapacity || 0;
                    
                    if (candidateCapacity >= projectValue * 0.1) { // At least 10% of project value
                        score += 30;
                    } else {
                        score += (candidateCapacity / (projectValue * 0.1)) * 30;
                    }
                }
                
                // Experience match (20 points)
                score += 20; // Simplified
                
                // Geographic proximity (20 points)
                if (attributes.projectLocation) {
                    score += 20; // Simplified
                }
                break;
                
            case CONFIG.SUB_MODELS.SPV:
                // Financial capacity (50 points) - critical for SPV
                if (attributes.projectValue) {
                    const candidateCapacity = candidateProfile.financialCapacity || 0;
                    const minRequired = 50000000; // 50M SAR minimum
                    
                    if (candidateCapacity >= minRequired) {
                        score += 50;
                    } else {
                        score += (candidateCapacity / minRequired) * 50;
                    }
                }
                
                // Sector expertise (30 points)
                if (attributes.projectType) {
                    score += 30; // Simplified
                }
                
                // Project experience (20 points)
                const candidateExp = candidateProfile.yearsExperience || 0;
                if (candidateExp >= 10) {
                    score += 20;
                } else {
                    score += (candidateExp / 10) * 20;
                }
                break;
        }
        
        return score;
    }
    
    /**
     * Match for Strategic Partnership opportunities
     */
    async matchStrategicPartnership(opportunity, candidate, subModelType) {
        let score = 0;
        const attributes = opportunity.attributes || {};
        const candidateProfile = candidate.profile || {};
        
        // Strategic alignment (40 points)
        score += 40; // Simplified - would analyze strategic objectives
        
        // Complementary strengths (30 points)
        if (attributes.partnerContributions || attributes.partnerRequirements) {
            score += 30; // Simplified
        }
        
        // Financial capacity (20 points)
        if (attributes.initialCapital) {
            const candidateCapacity = candidateProfile.financialCapacity || 0;
            if (candidateCapacity >= attributes.initialCapital * 0.1) {
                score += 20;
            }
        }
        
        // Market presence (10 points)
        if (attributes.geographicScope) {
            score += 10; // Simplified
        }
        
        return score;
    }
    
    /**
     * Match for Resource Pooling opportunities
     */
    async matchResourcePooling(opportunity, candidate, subModelType) {
        let score = 0;
        const attributes = opportunity.attributes || {};
        
        // Resource match (50 points)
        if (attributes.resourceType || attributes.productService) {
            score += 50; // Simplified
        }
        
        // Quantity alignment (20 points)
        if (attributes.quantityNeeded || attributes.quantity) {
            score += 20; // Simplified
        }
        
        // Timeline alignment (20 points)
        if (attributes.deliveryTimeline || attributes.availability) {
            score += 20; // Simplified
        }
        
        // Geographic proximity (10 points)
        if (attributes.deliveryLocation || attributes.location) {
            score += 10; // Simplified
        }
        
        return score;
    }
    
    /**
     * Match for Hiring opportunities
     */
    async matchHiring(opportunity, candidate, subModelType) {
        let score = 0;
        const attributes = opportunity.attributes || {};
        const candidateProfile = candidate.profile || {};
        
        // Qualification match (30 points)
        if (attributes.requiredQualifications) {
            const required = Array.isArray(attributes.requiredQualifications)
                ? attributes.requiredQualifications
                : [attributes.requiredQualifications];
            const candidateCerts = Array.isArray(candidateProfile.certifications)
                ? candidateProfile.certifications
                : [];
            
            const matching = required.filter(req => 
                candidateCerts.some(cert => cert.toLowerCase().includes(req.toLowerCase()))
            );
            score += (matching.length / required.length) * 30;
        }
        
        // Experience match (30 points)
        if (attributes.requiredExperience) {
            const candidateExp = candidateProfile.yearsExperience || 0;
            if (candidateExp >= attributes.requiredExperience) {
                score += 30;
            } else {
                score += (candidateExp / attributes.requiredExperience) * 30;
            }
        }
        
        // Skill match (30 points): use both specializations and skills for matching
        if (attributes.requiredSkills) {
            const required = Array.isArray(attributes.requiredSkills)
                ? attributes.requiredSkills
                : [attributes.requiredSkills];
            const specializations = Array.isArray(candidateProfile.specializations) ? candidateProfile.specializations : [];
            const skills = Array.isArray(candidateProfile.skills) ? candidateProfile.skills : [];
            const candidateSkills = [...specializations, ...skills];
            
            const matching = required.filter(req => 
                candidateSkills.some(skill => String(skill).toLowerCase().includes(String(req).toLowerCase()))
            );
            score += (matching.length / required.length) * 30;
        }
        
        // Location compatibility (10 points)
        if (attributes.location || attributes.workMode) {
            score += 10; // Simplified
        }
        
        return score;
    }
    
    /**
     * Match for Competition opportunities
     */
    async matchCompetition(opportunity, candidate) {
        let score = 0;
        const attributes = opportunity.attributes || {};
        
        // Eligibility criteria match (60 points)
        if (attributes.eligibilityCriteria) {
            score += 60; // Simplified
        }
        
        // Experience match (40 points)
        const candidateProfile = candidate.profile || {};
        const candidateExp = candidateProfile.yearsExperience || 0;
        score += Math.min(candidateExp / 10, 1) * 40;
        
        return score;
    }
    
    /**
     * Get past performance score
     */
    async getPastPerformanceScore(candidate, modelType) {
        // Get past applications for this model type
        const allApplications = await this.dataService.getApplications();
        const candidateApplications = allApplications.filter(a => 
            a.applicantId === candidate.id && a.status === 'accepted'
        );
        
        if (candidateApplications.length === 0) {
            return 10; // Default score for new users
        }
        
        // Calculate average performance (simplified)
        // In production, would use ratings/reviews
        const acceptanceRate = candidateApplications.length / 
            allApplications.filter(a => a.applicantId === candidate.id).length;
        
        return acceptanceRate * 20; // Max 20 points
    }
    
    /**
     * Get match criteria breakdown
     */
    async getMatchCriteria(opportunity, candidate) {
        return {
            modelType: opportunity.modelType,
            subModelType: opportunity.subModelType,
            matchedAt: new Date().toISOString()
        };
    }
    
    /**
     * Notify user about match
     */
    async notifyMatch(match, opportunity, candidate) {
        await this.dataService.createNotification({
            userId: candidate.id,
            type: 'match_found',
            title: 'New Match Found',
            message: `You have a ${Math.round(match.matchScore * 100)}% match for "${opportunity.title}"`
        });
        
        // Update match as notified
        await this.dataService.updateMatch(match.id, { notified: true });
    }
    
    /**
     * Find opportunities for a candidate
     */
    async findOpportunitiesForCandidate(candidateId) {
        const allOpportunities = await this.dataService.getOpportunities();
        const publishedOpportunities = allOpportunities.filter(o => o.status === 'published');
        // Try to find candidate as user first, then as company
        const candidate = await this.dataService.getUserById(candidateId) 
            || await this.dataService.getCompanyById(candidateId);
        
        if (!candidate) {
            throw new Error('Candidate not found');
        }
        
        const matches = [];
        
        for (const opportunity of publishedOpportunities) {
            // Skip own opportunities
            if (opportunity.creatorId === candidateId) {
                continue;
            }
            
            const matchScore = await this.calculateMatchScore(opportunity, candidate);
            
            if (matchScore >= this.minThreshold) {
                matches.push({
                    opportunity,
                    matchScore,
                    criteria: await this.getMatchCriteria(opportunity, candidate)
                });
            }
        }
        
        // Sort by match score
        matches.sort((a, b) => b.matchScore - a.matchScore);
        
        return matches;
    }
}

// Add updateMatch method to dataService if not exists
if (window.dataService && !window.dataService.updateMatch) {
    window.dataService.updateMatch = async function(matchId, updates) {
        const matches = await this.getMatches();
        const index = matches.findIndex(m => m.id === matchId);
        if (index === -1) return null;
        
        matches[index] = {
            ...matches[index],
            ...updates
        };
        this.storage.set(CONFIG.STORAGE_KEYS.MATCHES, matches);
        return matches[index];
    };
}

// Create singleton instance
const matchingService = new MatchingService();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = matchingService;
} else {
    window.matchingService = matchingService;
}
