import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["item", "trigger", "content", "icon"];
  static values = {
    allowMultiple: { type: Boolean, default: false }, // Allow multiple items to be open at once
  };

  _applyOpenVisuals(index) {
    if (!this.itemTargets[index] || !this.triggerTargets[index] || !this.contentTargets[index]) return;

    const item = this.itemTargets[index];
    const trigger = this.triggerTargets[index];
    const content = this.contentTargets[index];
    const icon = this.hasIconTarget && this.iconTargets[index] ? this.iconTargets[index] : null;

    item.dataset.state = "open";
    trigger.setAttribute("aria-expanded", "true");
    trigger.dataset.state = "open"; // Assuming trigger might have its own state styling
    content.dataset.state = "open";
    content.removeAttribute("hidden");

    if (icon) {
      const isPlusMinus = icon.querySelector('path[d*="M5 12h14"]');
      const isLeftChevron = icon.classList.contains("-rotate-90");

      if (isPlusMinus) {
        // For plus/minus icons, CSS handles the animation
      } else if (isLeftChevron) {
        // For left chevrons
        icon.classList.add("rotate-0");
        icon.classList.remove("-rotate-90");
      } else {
        // For regular chevrons
        icon.classList.add("rotate-180");
      }
    }

    // Set maxHeight to make content visible. scrollHeight should be available after removeAttribute("hidden").
    content.style.maxHeight = `${content.scrollHeight}px`;
  }

  _applyClosedVisuals(index) {
    if (!this.itemTargets[index] || !this.triggerTargets[index] || !this.contentTargets[index]) return;

    const item = this.itemTargets[index];
    const trigger = this.triggerTargets[index];
    const content = this.contentTargets[index];
    const icon = this.hasIconTarget && this.iconTargets[index] ? this.iconTargets[index] : null;

    item.dataset.state = "closed";
    trigger.setAttribute("aria-expanded", "false");
    trigger.dataset.state = "closed";
    content.dataset.state = "closed";
    content.setAttribute("hidden", "");

    if (icon) {
      const isPlusMinus = icon.classList.contains("scale-0");
      const isLeftChevron = icon.classList.contains("rotate-0");

      if (isPlusMinus) {
        // For plus/minus icons, CSS handles the animation
      } else if (isLeftChevron) {
        // For left chevrons
        icon.classList.remove("rotate-0");
        icon.classList.add("-rotate-90");
      } else {
        // For regular chevrons
        icon.classList.remove("rotate-180");
      }
    }

    content.style.maxHeight = "0px";
  }

  connect() {
    this.addKeyboardListeners();
    this.activeIndices = new Set(); // Start with a clean slate for internal tracking

    // Store bound function references for proper cleanup
    this.boundHandleTriggerKeydown = this.handleTriggerKeydown.bind(this);
    this.boundHandleKeydown = this.handleKeydown.bind(this);

    // Ensure all trigger buttons are focusable and have keyboard listeners
    this.triggerTargets.forEach((trigger, index) => {
      // Add tabindex for Safari compatibility
      if (!trigger.hasAttribute("tabindex")) {
        trigger.setAttribute("tabindex", "0");
      }

      // Add individual keydown listener for Safari compatibility
      trigger.addEventListener("keydown", this.boundHandleTriggerKeydown);
    });

    const initiallyOpenIndexesFromDOM = [];
    this.itemTargets.forEach((item, index) => {
      if (this.triggerTargets[index].getAttribute("aria-expanded") === "true") {
        initiallyOpenIndexesFromDOM.push(index);
      } else if (item.dataset.state === "open" && !initiallyOpenIndexesFromDOM.includes(index)) {
        // Fallback or additional check for items where data-state might be set but not aria-expanded
        initiallyOpenIndexesFromDOM.push(index);
      }
    });

    if (!this.allowMultipleValue) {
      if (initiallyOpenIndexesFromDOM.length > 0) {
        const indexToKeepOpen = initiallyOpenIndexesFromDOM[0]; // Keep the first one
        this.activeIndices.add(indexToKeepOpen);
        this._applyOpenVisuals(indexToKeepOpen);

        for (let i = 0; i < this.itemTargets.length; i++) {
          if (i !== indexToKeepOpen) {
            this._applyClosedVisuals(i);
          }
        }
      } else {
        this.itemTargets.forEach((_, index) => this._applyClosedVisuals(index));
      }
    } else {
      // Allow multiple
      initiallyOpenIndexesFromDOM.forEach((index) => {
        this.activeIndices.add(index);
        this._applyOpenVisuals(index);
      });
      // Ensure items not in initiallyOpenIndexesFromDOM are closed
      this.itemTargets.forEach((_, index) => {
        if (!this.activeIndices.has(index)) {
          this._applyClosedVisuals(index);
        }
      });
    }
  }

  disconnect() {
    this.element.removeEventListener("keydown", this.boundHandleKeydown);

    // Remove individual trigger listeners
    this.triggerTargets.forEach((trigger) => {
      trigger.removeEventListener("keydown", this.boundHandleTriggerKeydown);
    });
  }

  addKeyboardListeners() {
    this.element.addEventListener("keydown", this.boundHandleKeydown);
  }

  // Safari-compatible trigger-specific keydown handler
  handleTriggerKeydown(event) {
    const currentTrigger = event.currentTarget;
    const currentIndex = this.triggerTargets.indexOf(currentTrigger);

    if (currentIndex === -1) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        this.focusPreviousItem(currentIndex);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.focusNextItem(currentIndex);
        break;
      case "Home":
        event.preventDefault();
        this.focusFirstItem();
        break;
      case "End":
        event.preventDefault();
        this.focusLastItem();
        break;
      case "Enter":
      case " ": // Space key
        event.preventDefault();
        this.toggle(event);
        break;
    }
  }

  handleKeydown(event) {
    // Fallback handler - try to find the focused trigger
    let currentIndex = -1;

    // Check if any trigger is focused
    this.triggerTargets.forEach((trigger, index) => {
      if (trigger === document.activeElement || trigger.contains(document.activeElement)) {
        currentIndex = index;
      }
    });

    if (currentIndex === -1) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        this.focusPreviousItem(currentIndex);
        break;
      case "ArrowDown":
        event.preventDefault();
        this.focusNextItem(currentIndex);
        break;
      case "Home":
        event.preventDefault();
        this.focusFirstItem();
        break;
      case "End":
        event.preventDefault();
        this.focusLastItem();
        break;
    }
  }

  focusPreviousItem(currentIndex) {
    const previousIndex = (currentIndex - 1 + this.triggerTargets.length) % this.triggerTargets.length;
    this.triggerTargets[previousIndex].focus();
  }

  focusNextItem(currentIndex) {
    const nextIndex = (currentIndex + 1) % this.triggerTargets.length;
    this.triggerTargets[nextIndex].focus();
  }

  focusFirstItem() {
    this.triggerTargets[0].focus();
  }

  focusLastItem() {
    this.triggerTargets[this.triggerTargets.length - 1].focus();
  }

  toggle(event) {
    const index = this.triggerTargets.indexOf(event.currentTarget);

    if (this.activeIndices.has(index)) {
      this.close(index);
    } else {
      if (!this.allowMultipleValue) {
        this.activeIndices.forEach((i) => this.close(i));
      }
      this.open(index);
    }
  }

  open(index) {
    const content = this.contentTargets[index];
    const icon = this.iconTargets[index];

    // Remove hidden and set initial state
    content.removeAttribute("hidden");
    content.style.maxHeight = "0px";

    // Force a reflow to ensure the initial state is applied
    content.offsetHeight;

    // Now set the final state
    requestAnimationFrame(() => {
      this.itemTargets[index].dataset.state = "open";
      this.triggerTargets[index].setAttribute("aria-expanded", "true");
      content.dataset.state = "open";

      // Handle different icon types
      if (icon) {
        const isPlusMinus = icon.querySelector('path[d*="M5 12h14"]');
        const isLeftChevron = icon.classList.contains("-rotate-90");

        if (isPlusMinus) {
          // For plus/minus icons, we don't rotate, the CSS handles it
          this.triggerTargets[index].setAttribute("aria-expanded", "true");
        } else if (isLeftChevron) {
          // For left chevrons, add rotate class to go from -90 to 0
          icon.classList.add("rotate-0");
          icon.classList.remove("-rotate-90");
        } else {
          // For regular chevrons
          icon.classList.add("rotate-180");
        }
      }

      this.activeIndices.add(index);
      content.style.maxHeight = `${content.scrollHeight}px`;
    });
  }

  close(index) {
    const content = this.contentTargets[index];
    const icon = this.iconTargets[index];

    this.itemTargets[index].dataset.state = "closed";
    this.triggerTargets[index].setAttribute("aria-expanded", "false");
    content.dataset.state = "closed";

    // Handle different icon types
    if (icon) {
      const isPlusMinus = icon.querySelector('path[d*="M5 12h14"]');
      const isLeftChevron = icon.classList.contains("rotate-0");

      if (isPlusMinus) {
        // For plus/minus icons, CSS handles it
        this.triggerTargets[index].setAttribute("aria-expanded", "false");
      } else if (isLeftChevron) {
        // For left chevrons, go back to -90
        icon.classList.remove("rotate-0");
        icon.classList.add("-rotate-90");
      } else {
        // For regular chevrons
        icon.classList.remove("rotate-180");
      }
    }

    content.style.maxHeight = "0px";

    // Wait for both opacity and height transitions
    content.addEventListener(
      "transitionend",
      (e) => {
        // Only hide the content after the opacity transition finishes
        if (e.propertyName === "opacity" && content.dataset.state === "closed") {
          content.setAttribute("hidden", "");
        }
      },
      { once: true }
    );

    this.activeIndices.delete(index);
  }
}
