// Blur behind the command palette
document.addEventListener('DOMContentLoaded', function () {

    // --- Configuration ---
    const COMMAND_WIDGET_SELECTOR = ".quick-input-widget"; // CSS selector for the command palette
    const BLUR_ELEMENT_ID = "command-blur";              // ID for the blur overlay element
    const TARGET_CONTAINER_SELECTOR = ".monaco-workbench"; // CSS selector for the container to append the blur to
    const POLLING_INTERVAL_MS = 500;                     // How often to check for the command palette if not found initially
    const SHOW_DELAY_MS = 0;                            // Small delay before showing blur on Cmd+P to allow UI rendering
    const FADE_DURATION_MS = 150;                        // Duration for fade-in/out animations (should match CSS if used)

    // --- State ---
    let commandDialog = null; // Reference to the command palette element
    let observer = null;      // Reference to the MutationObserver

    // --- Functions ---

    // Adds the blur overlay element to the DOM with a fade-in effect.
    function addBlur() {
        const targetDiv = document.querySelector(TARGET_CONTAINER_SELECTOR);
        if (!targetDiv) {
            console.error("Target container for blur not found:", TARGET_CONTAINER_SELECTOR);
            return;
        }

        // Remove existing element first to prevent duplicates
        const existingElement = document.getElementById(BLUR_ELEMENT_ID);
        if (existingElement) {
            existingElement.remove();
        }

        // Create and configure the new blur element
        const newElement = document.createElement("div");
        newElement.setAttribute('id', BLUR_ELEMENT_ID);

        // Basic styling for fade effect (can be moved to CSS)
        newElement.style.position = 'fixed'; // Or 'absolute' depending on targetDiv's positioning
        newElement.style.inset = '0';
        newElement.style.zIndex = '99'; // Adjust as needed, should be below command palette but above other content
        newElement.style.backgroundColor = 'rgba(0, 0, 0, 0.2)'; // Example semi-transparent background
        newElement.style.backdropFilter = 'blur(5px)'; // The actual blur effect
        newElement.style.webkitBackdropFilter = 'blur(5px)'; // For Safari
        newElement.style.transition = `opacity ${FADE_DURATION_MS}ms ease-out`;
        newElement.style.opacity = '0';

        // Add click listener to remove the blur
        newElement.addEventListener('click', handleEscape); // Use handleEscape for consistent fade-out

        // Append and trigger fade-in
        targetDiv.appendChild(newElement);
        // Use requestAnimationFrame for smoother rendering start
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { // Double RAF for reliability across browsers
                newElement.style.opacity = '1';
            });
        });
    }

    // Removes the blur overlay element from the DOM with a fade-out effect.
    function handleEscape() {
        const element = document.getElementById(BLUR_ELEMENT_ID);
        if (element) {
            // Start fade-out
            element.style.opacity = '0';
            // Remove element after transition completes
            setTimeout(() => {
                element.remove();
            }, FADE_DURATION_MS);
        }
    }

    // Sets up the MutationObserver to watch for command palette visibility changes.
    function setupObserver() {
        if (!commandDialog || observer) return; // Already observing or no element

        observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    // Check the computed style as inline style might be removed/overridden
                    const isVisible = window.getComputedStyle(commandDialog).display !== 'none';
                    if (!isVisible) {
                        handleEscape();
                    } else {
                        // It became visible via style change (might happen if not triggered by keydown)
                        addBlur();
                    }
                }
            });
        });

        observer.observe(commandDialog, { attributes: true, attributeFilter: ['style'] });
        console.log("MutationObserver attached to command dialog.");
    }

    // --- Initialization ---

    // Poll the DOM to find the command palette element
    const checkElement = setInterval(() => {
        commandDialog = document.querySelector(COMMAND_WIDGET_SELECTOR);

        if (commandDialog) {
            clearInterval(checkElement); // Stop polling
            console.log("Command dialog found:", commandDialog);

            // Check initial state: If it's already visible, add the blur
            if (window.getComputedStyle(commandDialog).display !== 'none') {
                console.log("Command dialog initially visible, adding blur.");
                addBlur();
            }

            // Set up the observer to watch for future style changes
            setupObserver();

        } else {
            console.log("Command dialog not found yet. Retrying...");
        }
    }, POLLING_INTERVAL_MS);

    // Global keydown listener (capture phase)
    document.addEventListener('keydown', function (event) {
        // Check for Cmd/Ctrl + P to show palette
        if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'p') {
            // Don't prevent default here unless you KNOW the default action
            // is opening the palette AND you want to override it entirely.
            // Often, the application handles opening the palette itself.
            // event.preventDefault();
            console.log("Cmd/Ctrl+P detected, adding blur with delay.");
            // Use a small delay to allow the palette to potentially render first
            setTimeout(addBlur, SHOW_DELAY_MS);
        }
        // Check for Escape key to hide palette/blur
        else if (event.key === 'Escape' || event.key === 'Esc') {
            // Don't prevent default here either, as the application likely
            // uses Escape to close the command palette itself. Removing the
            // blur is a *reaction* to it closing.
            // event.preventDefault();
            console.log("Escape detected, removing blur.");
            handleEscape();
        }
    }, true); // Use capture phase 'true'





});
/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////



// Observer to track minimap width and update CSS variable
(function () {
    let debounceTimeout = null;
    let resizeObserver = null; // Initialize resizeObserver
    let mutationObserver = null; // Initialize mutationObserver
    let observedEditorElement = null; // Keep track of the element observed by ResizeObserver

    // Debounce function to limit how often updateMinimapWidthVariable is called
    function debounce(func, delay) {
        return function (...args) {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Function to create and update the CSS variable
    function updateMinimapWidthVariable() {
        // Selector remains fragile as per constraint 1
        const minimapSelector = '.part.editor .content .split-view-view.visible:last-of-type .monaco-editor .minimap';
        const minimapElement = document.querySelector(minimapSelector);

        if (minimapElement) {
            const minimapWidth = window.getComputedStyle(minimapElement).width;
            // Only update if the width has actually changed or is initially set
            const currentWidth = document.documentElement.style.getPropertyValue('--minimap-width');
            if (minimapWidth && currentWidth !== minimapWidth) {
                document.documentElement.style.setProperty('--minimap-width', minimapWidth);
                // console.log('Minimap width updated to:', minimapWidth); // Optional: uncomment for debugging
                updateMinimapCSS(minimapWidth);
            }
        }
        // No need for 'else' console log here, MutationObserver handles finding it.
    }

    // Debounced version for frequent calls (like resize/mutation)
    const debouncedUpdateMinimapWidth = debounce(updateMinimapWidthVariable, 150); // 150ms delay

    // Function to add or update the minimap positioning CSS (unchanged logic)
    function updateMinimapCSS(minimapWidth) {
        let styleElement = document.getElementById('minimap-custom-style');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'minimap-custom-style';
            document.head.appendChild(styleElement);
        }
        // CSS rule remains the same, using !important and hardcoded values as per constraints 3 & 4
        styleElement.textContent = `
        /* Target the specific visible editor pane's minimap */
        .part.editor .content .split-view-view.visible:last-of-type .monaco-editor .minimap {
          /* Positioning calculation relies on --spacing and hardcoded values as per constraints 4 & 5 */
          left: calc(100% - var(--spacing) * 4 - ${minimapWidth} - 13px) !important;
        }
      `;
    }

    // --- Fix for Problem 2 (Performance - ResizeObserver) ---
    // Initialize ResizeObserver with the debounced callback
    resizeObserver = new ResizeObserver(entries => {
        // Debounce the update function call
        debouncedUpdateMinimapWidth();
    });

    // --- Fix for Problem 6 (Polling) & Improved Problem 2 (MutationObserver Performance) ---
    // Function to find and observe the editor element
    function findAndObserveEditor() {
        // Attempt to find the editor container - selectors kept as original per constraint 1
        const editorSelector = '.editor-container, .monaco-editor, .editor'; // Combine selectors
        const editorElement = document.querySelector(editorSelector); // Find *any* editor container for resize

        if (editorElement && editorElement !== observedEditorElement) {
            // If we were observing a previous element, stop observing it
            if (observedEditorElement) {
                resizeObserver.unobserve(observedEditorElement);
            }
            // Observe the newly found editor element
            resizeObserver.observe(editorElement);
            observedEditorElement = editorElement; // Track the currently observed element
            // console.log('Editor element found/changed, observing for resize:', editorElement); // Optional debug log
            // Initial update on finding the editor might be needed if minimap is already there
            debouncedUpdateMinimapWidth();
        }
        // No explicit 'else' needed, MutationObserver will re-trigger this check if DOM changes
    }


    // Set up a mutation observer to handle dynamic DOM changes more efficiently
    mutationObserver = new MutationObserver((mutations) => {
        let potentiallyAffected = false;
        for (let mutation of mutations) {
            // Check if nodes were added/removed, or if attributes relevant to visibility/layout changed
            // This is still broad, but avoids triggering on every minor text change etc.
            // We check for added nodes because the editor or minimap might appear dynamically.
            if (mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
                potentiallyAffected = true;
                break; // No need to check other mutations if one relevant one is found
            }
            // Optionally check for attribute changes that might affect layout/visibility,
            // but be specific to avoid excessive triggering. Example:
            // if (mutation.type === 'attributes' && (mutation.attributeName === 'class' || mutation.attributeName === 'style')) {
            //    potentiallyAffected = true;
            //    break;
            // }
        }

        if (potentiallyAffected) {
            // Check if the editor we are observing still exists or if we need to find a new one
            findAndObserveEditor();
            // Check/Update minimap width (debounced)
            debouncedUpdateMinimapWidth();
        }
    });

    // --- Improved Targeting for MutationObserver ---
    // Observe the body initially, as we don't know where the editor might appear.
    // While still broad, the *callback* now does less work unless necessary.
    // Constraint 7 means we don't worry about global scope issues of the injected style/variable.
    mutationObserver.observe(document.body, {
        childList: true, // Detect when elements are added/removed
        subtree: true,   // Watch the entire body subtree
        // Avoid observing attributes/characterData unless absolutely necessary to reduce noise
        // attributes: true, // Consider adding if class/style changes break things and need tracking
        // attributeFilter: ['class', 'style'] // Example filter
    });

    // Initial attempt to find editor and setup
    findAndObserveEditor();
    // Perform an initial check in case the minimap is already present
    updateMinimapWidthVariable(); // Run once immediately, non-debounced

    console.log('Minimap width tracking initialized (with debouncing)');

})();