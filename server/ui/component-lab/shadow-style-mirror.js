function isMirrorableStyleNode(node) {
  if (!(node instanceof Element)) {
    return false;
  }

  if (node.tagName === "STYLE") {
    return true;
  }

  return node.tagName === "LINK" && node.getAttribute("rel") === "stylesheet";
}

function getStyleMirrorKey(node, index) {
  if (node.tagName === "LINK") {
    return `link:${node.getAttribute("href") || index}`;
  }

  return `style:${node.getAttribute("data-n-href") || node.getAttribute("data-precedence") || index}`;
}

export function syncShadowStyles(styleRoot) {
  if (!styleRoot) {
    return;
  }

  const sourceNodes = Array.from(document.head.children).filter(isMirrorableStyleNode);
  const nextKeys = new Set();

  sourceNodes.forEach((node, index) => {
    const key = getStyleMirrorKey(node, index);
    nextKeys.add(key);

    const existing = styleRoot.querySelector(`[data-style-mirror-key="${key}"]`);
    if (existing) {
      if (node.tagName === "STYLE") {
        const nextText = node.textContent || "";
        if (existing.textContent !== nextText) {
          existing.textContent = nextText;
        }
      }
      return;
    }

    const clone = node.cloneNode(true);
    clone.setAttribute("data-style-mirror-key", key);
    styleRoot.appendChild(clone);
  });

  Array.from(styleRoot.children).forEach((node) => {
    const key = node.getAttribute("data-style-mirror-key");
    if (key && !nextKeys.has(key)) {
      node.remove();
    }
  });
}
