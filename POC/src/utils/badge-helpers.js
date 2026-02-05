/**
 * Badge helper utilities for opportunity intent (OFFER/REQUEST) styling per module.
 * Modules: project_based, strategic_partnership, resource_pooling, hiring.
 */

const INTENT_BADGE_MODULES = ['project_based', 'strategic_partnership', 'resource_pooling', 'hiring'];

/**
 * Returns the CSS class name for the intent badge (OFFER/REQUEST) based on intent and modelType.
 * @param {string} intent - 'offer' or 'request'
 * @param {string} [modelType] - One of project_based, strategic_partnership, resource_pooling, hiring
 * @returns {string} Class name e.g. 'badge-intent-offer-strategic_partnership' or 'badge-intent-request-default'
 */
function getIntentBadgeClass(intent, modelType) {
    const normalizedIntent = (intent === 'offer' ? 'offer' : 'request');
    const normalizedModule = (modelType && INTENT_BADGE_MODULES.includes(modelType)) ? modelType : 'default';
    return `badge-intent-${normalizedIntent}-${normalizedModule}`;
}

if (typeof window !== 'undefined') {
    window.getIntentBadgeClass = getIntentBadgeClass;
}
