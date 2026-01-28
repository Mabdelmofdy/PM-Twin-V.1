/**
 * Rich Text Editor Utility
 * Initializes Quill editors for textarea fields
 */

let quillEditors = new Map();

/**
 * Initialize Quill editor for a textarea field
 * @param {string|HTMLElement} textareaIdOrElement - Textarea ID or element
 * @param {object} options - Quill options
 */
function initRichTextEditor(textareaIdOrElement, options = {}) {
    const textarea = typeof textareaIdOrElement === 'string' 
        ? document.getElementById(textareaIdOrElement)
        : textareaIdOrElement;
    
    if (!textarea) return null;
    
    // Skip if already initialized
    if (quillEditors.has(textarea.id)) {
        return quillEditors.get(textarea.id);
    }
    
    // Check if textarea is visible (not in a hidden parent)
    const isVisible = textarea.offsetParent !== null;
    if (!isVisible) {
        // If hidden, try to initialize anyway - Quill can work with hidden elements
        // The editor will become visible when the parent container becomes visible
        console.log(`Textarea ${textarea.id} is in a hidden container, initializing anyway`);
    }
    
    // Create container for Quill
    const container = document.createElement('div');
    container.className = 'rich-text-editor-container';
    container.style.marginTop = '0.5rem';
    
    // Hide original textarea
    textarea.style.display = 'none';
    
    // Insert container after textarea
    textarea.parentNode.insertBefore(container, textarea.nextSibling);
    
    // Default Quill options
    const defaultOptions = {
        theme: 'snow',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                ['link'],
                ['clean']
            ]
        },
        placeholder: textarea.placeholder || 'Start typing...',
        ...options
    };
    
    // Initialize Quill
    const quill = new Quill(container, defaultOptions);
    
    // Set initial content if textarea has value
    if (textarea.value) {
        quill.root.innerHTML = textarea.value;
    }
    
    // Sync Quill content to textarea on text change
    quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        textarea.value = html;
        
        // Trigger input event for form validation
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
    });
    
    // Store editor reference
    quillEditors.set(textarea.id, quill);
    
    return quill;
}

/**
 * Get Quill editor instance for a textarea
 * @param {string} textareaId - Textarea ID
 */
function getRichTextEditor(textareaId) {
    return quillEditors.get(textareaId);
}

/**
 * Set content for a Quill editor
 * @param {string} textareaId - Textarea ID
 * @param {string} content - HTML content
 */
function setRichTextContent(textareaId, content) {
    const quill = quillEditors.get(textareaId);
    if (quill && content) {
        quill.root.innerHTML = content;
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            textarea.value = content;
        }
    }
}

/**
 * Get content from a Quill editor
 * @param {string} textareaId - Textarea ID
 * @returns {string} HTML content
 */
function getRichTextContent(textareaId) {
    const quill = quillEditors.get(textareaId);
    if (quill) {
        return quill.root.innerHTML;
    }
    const textarea = document.getElementById(textareaId);
    return textarea ? textarea.value : '';
}

/**
 * Initialize rich text editors for all textareas with data-rich-text attribute
 */
function initRichTextEditors() {
    const textareas = document.querySelectorAll('textarea[data-rich-text="true"]');
    console.log(`Found ${textareas.length} textareas with data-rich-text attribute`);
    textareas.forEach(textarea => {
        // Check if already initialized
        if (!quillEditors.has(textarea.id)) {
            // Check if textarea is in a visible container (parent step is not hidden)
            const parentStep = textarea.closest('.wizard-step-content');
            const isStepVisible = !parentStep || !parentStep.classList.contains('hidden');
            
            if (isStepVisible) {
                console.log(`Initializing rich text editor for: ${textarea.id}`);
                initRichTextEditor(textarea);
            } else {
                console.log(`Skipping ${textarea.id} - parent step is hidden, will initialize when visible`);
            }
        } else {
            console.log(`Rich text editor already initialized for: ${textarea.id}`);
        }
    });
}

/**
 * Destroy a Quill editor
 * @param {string} textareaId - Textarea ID
 */
function destroyRichTextEditor(textareaId) {
    const quill = quillEditors.get(textareaId);
    if (quill) {
        const container = quill.container;
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        quillEditors.delete(textareaId);
        
        const textarea = document.getElementById(textareaId);
        if (textarea) {
            textarea.style.display = '';
        }
    }
}

/**
 * Destroy all Quill editors
 */
function destroyAllRichTextEditors() {
    quillEditors.forEach((quill, textareaId) => {
        destroyRichTextEditor(textareaId);
    });
}

// Export functions
window.RichTextEditor = {
    init: initRichTextEditor,
    get: getRichTextEditor,
    setContent: setRichTextContent,
    getContent: getRichTextContent,
    initAll: initRichTextEditors,
    destroy: destroyRichTextEditor,
    destroyAll: destroyAllRichTextEditors
};
