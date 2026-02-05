/**
 * Notifications Center – list, filter, mark read, link to related page
 */

async function initNotifications() {
    const user = authService.getCurrentUser();
    if (!user) {
        router.navigate(CONFIG.ROUTES.LOGIN);
        return;
    }

    await loadNotifications();
    setupFilters();
    document.getElementById('mark-all-read')?.addEventListener('click', markAllRead);
}

async function loadNotifications() {
    const container = document.getElementById('notifications-list');
    if (!container) return;

    const typeFilter = document.getElementById('filter-type')?.value;
    const readFilter = document.getElementById('filter-read')?.value;
    const user = authService.getCurrentUser();
    if (!user) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
        let list = await dataService.getNotifications(user.id);

        if (typeFilter) {
            list = list.filter(n => n.type === typeFilter);
        }
        if (readFilter === 'unread') {
            list = list.filter(n => !n.read);
        } else if (readFilter === 'read') {
            list = list.filter(n => n.read);
        }

        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (list.length === 0) {
            container.innerHTML = '<div class="empty-notifications">No notifications match your filters.</div>';
            return;
        }

        container.innerHTML = list.map(n => {
            const linkAttrs = n.link ? `href="#" data-route="${n.link}"` : '';
            const linkWrap = n.link ? `<a ${linkAttrs} class="notification-link">${n.title}</a>` : n.title;
            const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleString() : '';
            const readClass = n.read ? '' : ' unread';
            const markReadBtn = !n.read ? `<button type="button" class="btn btn-sm btn-secondary mark-read" data-id="${n.id}">Mark read</button>` : '';
            return `
                <div class="notification-item${readClass}" data-id="${n.id}">
                    <div class="notification-title">${linkWrap}</div>
                    <div class="notification-message">${n.message || ''}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${timeStr}</span>
                        <div class="notification-actions">${markReadBtn}</div>
                    </div>
                </div>
            `;
        }).join('');

        container.querySelectorAll('.mark-read').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                await dataService.markNotificationRead(e.target.dataset.id);
                await loadNotifications();
            });
        });

        container.querySelectorAll('.notification-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                if (route) {
                    const notif = list.find(n => n.link === route);
                    if (notif && !notif.read) {
                        dataService.markNotificationRead(notif.id);
                    }
                    router.navigate(route);
                }
            });
        });
    } catch (err) {
        console.error('Error loading notifications:', err);
        container.innerHTML = '<div class="empty-notifications">Error loading notifications.</div>';
    }
}

function setupFilters() {
    document.getElementById('apply-filters')?.addEventListener('click', () => loadNotifications());
}

async function markAllRead() {
    const user = authService.getCurrentUser();
    if (!user) return;
    const list = await dataService.getNotifications(user.id);
    const unread = list.filter(n => !n.read);
    for (const n of unread) {
        await dataService.markNotificationRead(n.id);
    }
    await loadNotifications();
}
