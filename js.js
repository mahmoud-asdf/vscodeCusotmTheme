// Blur behind the command palette - Improved Version
document.addEventListener('DOMContentLoaded', function () {

    // --- Configuration ---
    const COMMAND_WIDGET_SELECTOR = ".quick-input-widget"; // CSS selector for the command palette
    const BLUR_ELEMENT_ID = "command-blur";              // ID for the blur overlay element
    const TARGET_CONTAINER_SELECTOR = ".monaco-workbench"; // CSS selector for the container to append the blur to
    const POLLING_INTERVAL_MS = 500;                     // How often to check for the command palette if not found initially
    const SHOW_DELAY_MS = 50;                            // Small delay before showing blur on Cmd+P to allow UI rendering
    const FADE_DURATION_MS = 300;                        // Duration for fade-in/out animations (should match CSS if used)

    // --- State ---
    let commandDialog = null; // Reference to the command palette element
    let observer = null;      // Reference to the MutationObserver

    // --- Functions ---

    /**
     * Adds the blur overlay element to the DOM with a fade-in effect.
     */
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

    /**
     * Removes the blur overlay element from the DOM with a fade-out effect.
     */
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

    /**
     * Sets up the MutationObserver to watch for command palette visibility changes.
     */
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