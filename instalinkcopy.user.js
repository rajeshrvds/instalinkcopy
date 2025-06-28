// ==UserScript==
// @name         instalinkcopy
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Adds a copy icon to the bottom left of Instagram posts to copy the post link with a single click.
// @author       pluto
// @match        https://www.instagram.com/*
// @grant        GM_addStyle
// @icon         data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNvcHkiPjxyZWN0IHdpZHRoPSIxNCIgaGVpZ2h0PSIxNCIgeD0iOCIgeT0iOCIgcng9IjIiIHJ5PSIyIi8+PHBhdGggZD0iTTQgNEgxNmMxLjEgMCAyIC45IDIgMnYxMCIvPjwvc3ZnPg==
// ==/UserScript==

(function() {
    'use strict';

    // --- SVG Icons ---
const ICONS = {
    COPY: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="9" height="9" rx="2"/><path d="M2 9V3.5A1.5 1.5 0 0 1 3.5 2H9"/></svg>`,
    SUCCESS: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`
};

    // --- Add Styles ---
    // This makes the button look good and positions the parent `article` tag so the button can be placed relative to it.
    GM_addStyle(`
        article {
            position: relative !important;
        }
        .ig-copy-link-button {
            position: absolute;
            bottom: 12px;
            left: 12px;
            z-index: 999;
            background-color: rgba(0, 0, 0, 0.6);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            padding: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease, transform 0.2s ease;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .ig-copy-link-button:hover {
            background-color: rgba(0, 0, 0, 0.8);
            transform: scale(1.05);
        }
        .ig-copy-link-button:active {
            transform: scale(0.95);
        }
    `);

    function addCopyIconToPost(postElement) {
        // Prevent adding the button multiple times to the same post
        if (postElement.querySelector('.ig-copy-link-button')) {
            return;
        }

        // Find the permalink element within the post. This is usually a link around the timestamp.
        // We look for any 'a' tag with an href starting with /p/
        const permalinkElement = postElement.querySelector('a[href^="/p/"]');
        if (!permalinkElement) {
            // If no link is found (e.g., suggested posts container), do nothing.
            return;
        }

        const postUrl = permalinkElement.href;

        const copyButton = document.createElement('button');
        copyButton.className = 'ig-copy-link-button';
        copyButton.innerHTML = ICONS.COPY;
        copyButton.title = 'Copy Post Link';

        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            navigator.clipboard.writeText(postUrl).then(() => {
                // Success feedback
                copyButton.innerHTML = ICONS.SUCCESS;
                setTimeout(() => {
                    copyButton.innerHTML = ICONS.COPY;
                }, 1500); // Revert back to copy icon after 1.5 seconds
            }).catch(err => {
                console.error('Failed to copy link: ', err);
                alert('Could not copy link to clipboard.');
            });
        });

        postElement.appendChild(copyButton);
    }

    // --- MutationObserver to handle dynamically loaded posts ---
    // Instagram loads new posts as you scroll, so we need to watch for changes in the DOM.
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // It's an element
                    // Find all 'article' elements within the newly added node(s)
                    const posts = node.querySelectorAll('article');
                    posts.forEach(addCopyIconToPost);

                    // Also check if the added node itself is an article (for single post pages)
                    if (node.tagName === 'ARTICLE') {
                        addCopyIconToPost(node);
                    }
                }
            });
        });
    });

    // --- Start Observing ---
    // We observe the whole body with subtree=true to catch everything.
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // --- Initial Run ---
    // Run the function once on load for any posts that are already on the page.
    document.querySelectorAll('article').forEach(addCopyIconToPost);

})();
