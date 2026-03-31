/**
 * Attaches a shadow root to `host`, injects the compiled CSS string as a
 * <style> element, and returns a container <div> for React to mount into.
 */
export function createShadowRoot(host: HTMLElement, cssText: string): HTMLDivElement {
  const shadow = host.attachShadow({ mode: "open" });

  const style = document.createElement("style");
  style.textContent = cssText;
  shadow.appendChild(style);

  const container = document.createElement("div");
  shadow.appendChild(container);

  return container;
}

/** Read an attribute, returning `fallback` if absent or empty. */
export function getAttr(el: Element, name: string, fallback = ""): string {
  return el.getAttribute(name) ?? fallback;
}
