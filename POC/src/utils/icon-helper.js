/**
 * Icon Helper Utility
 * Provides helper functions for rendering Phosphor Duotone icons
 */

class IconHelper {
    /**
     * Render a Phosphor Duotone icon
     * @param {string} iconName - Name of the Phosphor icon (e.g., 'check', 'x', 'warning', 'info')
     * @param {Object} options - Icon options
     * @param {number} options.size - Icon size in pixels (default: 24)
     * @param {string} options.color - Icon color (default: 'currentColor')
     * @param {string} options.weight - Icon weight: 'thin', 'light', 'regular', 'bold', 'fill', 'duotone' (default: 'duotone')
     * @param {string} options.className - Additional CSS classes
     * @returns {string} HTML string for the icon
     */
    static render(iconName, options = {}) {
        const {
            size = 24,
            color = 'currentColor',
            weight = 'duotone',
            className = ''
        } = options;

        // Map common icon names to Phosphor icon names
        const iconMap = {
            // Modal icons
            'check': 'Check',
            'check-circle': 'CheckCircle',
            'x': 'X',
            'x-circle': 'XCircle',
            'warning': 'Warning',
            'warning-circle': 'WarningCircle',
            'info': 'Info',
            'info-circle': 'InfoCircle',
            'close': 'X',
            'times': 'X',
            
            // Navigation & arrows
            'arrow-left': 'ArrowLeft',
            'arrow-right': 'ArrowRight',
            'arrow-up': 'ArrowUp',
            'arrow-down': 'ArrowDown',
            'back': 'ArrowLeft',
            'next': 'ArrowRight',
            
            // Common UI icons
            'plus': 'Plus',
            'plus-circle': 'PlusCircle',
            'search': 'MagnifyingGlass',
            'edit': 'Pencil',
            'delete': 'Trash',
            'settings': 'Gear',
            'user': 'User',
            'users': 'Users',
            'location': 'MapPin',
            'email': 'Envelope',
            'phone': 'Phone',
            'message': 'ChatCircle',
            'notification': 'Bell',
            'dashboard': 'SquaresFour',
            'opportunity': 'Briefcase',
            'briefcase': 'Briefcase',
            'building': 'Buildings',
            'company': 'Buildings',
            'chart': 'ChartBar',
            'chart-bar': 'ChartBar',
            'chart-line': 'ChartLine',
            'link': 'Link',
            'chain': 'Link',
            'money': 'CurrencyDollar',
            'dollar': 'CurrencyDollar',
            'percent': 'Percent',
            'exchange': 'ArrowsClockwise',
            'swap': 'ArrowsClockwise',
            'construction': 'Hammer',
            'hammer': 'Hammer',
            'demo': 'Theater',
            'theater': 'Theater',
            'calendar': 'Calendar',
            'clock': 'Clock',
            'lock': 'Lock',
            'unlock': 'LockOpen',
            'eye': 'Eye',
            'eye-slash': 'EyeSlash',
            'checkmark': 'Check',
            'success': 'CheckCircle',
            'error': 'XCircle',
            'alert': 'Warning',
            'information': 'Info'
        };

        // Get the mapped icon name or use the provided name as-is (capitalized)
        const mappedName = iconMap[iconName.toLowerCase()] || 
            iconName.charAt(0).toUpperCase() + iconName.slice(1);

        // Convert icon name to kebab-case (e.g., "CheckCircle" -> "check-circle")
        const iconNameKebab = mappedName
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^-/, '');

        // Build the icon class name (format: ph-duotone ph-icon-name)
        const iconClass = `ph-${weight} ph-${iconNameKebab}`;
        const classes = className ? `${iconClass} ${className}` : iconClass;

        // Return the icon HTML
        return `<i class="${classes}" style="font-size: ${size}px; color: ${color};" aria-hidden="true"></i>`;
    }

    /**
     * Render an icon element (returns DOM element instead of HTML string)
     * @param {string} iconName - Name of the Phosphor icon
     * @param {Object} options - Icon options
     * @returns {HTMLElement} Icon element
     */
    static renderElement(iconName, options = {}) {
        const temp = document.createElement('div');
        temp.innerHTML = this.render(iconName, options);
        return temp.firstElementChild;
    }

    /**
     * Common icon presets for quick access
     */
    static presets = {
        success: (size = 24) => this.render('check-circle', { size, weight: 'duotone' }),
        error: (size = 24) => this.render('x-circle', { size, weight: 'duotone' }),
        warning: (size = 24) => this.render('warning-circle', { size, weight: 'duotone' }),
        info: (size = 24) => this.render('info-circle', { size, weight: 'duotone' }),
        close: (size = 24) => this.render('x', { size, weight: 'duotone' }),
        plus: (size = 24) => this.render('plus', { size, weight: 'duotone' }),
        search: (size = 24) => this.render('search', { size, weight: 'duotone' }),
        arrowLeft: (size = 24) => this.render('arrow-left', { size, weight: 'duotone' }),
        arrowRight: (size = 24) => this.render('arrow-right', { size, weight: 'duotone' })
    };
}

// Expose globally
window.IconHelper = IconHelper;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IconHelper;
}
