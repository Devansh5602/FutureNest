document.addEventListener('DOMContentLoaded', () => {
    // Add page-fade-in class to body on load to animate entry
    document.body.classList.add('page-fade-in');
    
    // Highlight the active link in the navigation
    updateActiveLinks();

    // Handle clicks on local links
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        
        // Ignore external links, anchor links, mailto/tel, or links opening in a new tab
        if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:') || link.hasAttribute('target')) {
            return;
        }
        
        e.preventDefault();
        
        // Add fade out animation
        document.body.classList.remove('page-fade-in');
        document.body.classList.add('page-fade-out');
        
        // Update URL
        window.history.pushState({}, '', href);
        updateActiveLinks();
        
        // Fetch the new page and wait for the fade out animation
        Promise.all([
            fetch(href).then(res => res.text()),
            new Promise(resolve => setTimeout(resolve, 400))
        ]).then(([htmlStr]) => {
            // Parse new HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlStr, 'text/html');
            
            // Replace title and main content
            document.title = doc.title;
            const newMain = doc.querySelector('#main-content');
            if (newMain) {
                document.querySelector('#main-content').innerHTML = newMain.innerHTML;
            }
            
            // Scroll to top
            window.scrollTo(0, 0);
            
            // Fade back in
            document.body.classList.remove('page-fade-out');
            document.body.classList.add('page-fade-in');
            
            // Re-initialize any JS scripts/animations
            if (typeof window.initMainJS === 'function') {
                window.initMainJS();
            }
            if (typeof window.checkHeaderScroll === 'function') {
                window.checkHeaderScroll();
            }
        }).catch(err => {
            console.error('Failed to load page:', err);
            // Fallback to normal navigation
            window.location.href = href;
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        const href = window.location.pathname;
        
        document.body.classList.remove('page-fade-in');
        document.body.classList.add('page-fade-out');
        updateActiveLinks();
        
        Promise.all([
            fetch(href).then(res => res.text()),
            new Promise(resolve => setTimeout(resolve, 400))
        ]).then(([htmlStr]) => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlStr, 'text/html');
            
            document.title = doc.title;
            const newMain = doc.querySelector('#main-content');
            if (newMain) {
                document.querySelector('#main-content').innerHTML = newMain.innerHTML;
            }
            
            document.body.classList.remove('page-fade-out');
            document.body.classList.add('page-fade-in');
            
            if (typeof window.initMainJS === 'function') {
                window.initMainJS();
            }
            if (typeof window.checkHeaderScroll === 'function') {
                window.checkHeaderScroll();
            }
        }).catch(() => {
            window.location.reload();
        });
    });

    function updateActiveLinks() {
        const path = window.location.pathname.replace(/\/index\.html$/, '/') || '/';
        const navLinks = document.querySelectorAll('.nav__link, .mobile-nav__link');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref || linkHref.startsWith('#') || linkHref.startsWith('http')) return;
            const linkPath = linkHref.replace(/\/index\.html$/, '/') || '/';
            const isActive = (linkPath === '/' && path === '/') || (linkPath !== '/' && path.startsWith(linkPath));
            
            if (isActive) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
});
