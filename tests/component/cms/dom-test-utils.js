import { act } from "react";
import ReactDOMClient from "react-dom/client";
import * as ReactDomTestUtils from "react-dom/test-utils";
import { JSDOM } from "jsdom";

const mountedRoots = [];

function copyWindowProperties(windowObject) {
  for (const key of Object.getOwnPropertyNames(windowObject)) {
    if (key in globalThis) {
      continue;
    }

    globalThis[key] = windowObject[key];
  }
}

export function setupDom() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "http://localhost/"
  });

  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.navigator = dom.window.navigator;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Event = dom.window.Event;
  globalThis.MouseEvent = dom.window.MouseEvent;
  globalThis.KeyboardEvent = dom.window.KeyboardEvent;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.FocusEvent = dom.window.FocusEvent;
  globalThis.FormData = dom.window.FormData;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  globalThis.requestAnimationFrame = (callback) => setTimeout(callback, 0);
  globalThis.cancelAnimationFrame = (handle) => clearTimeout(handle);
  copyWindowProperties(dom.window);

  return {
    window: dom.window,
    async cleanup() {
      while (mountedRoots.length) {
        const root = mountedRoots.pop();
        await act(async () => {
          root.unmount();
        });
      }
      await flush();
      dom.window.close();
      globalThis.window = undefined;
      globalThis.document = undefined;
      globalThis.navigator = undefined;
    }
  };
}

export async function render(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = ReactDOMClient.createRoot(container);
  mountedRoots.push(root);
  await act(async () => {
    root.render(element);
  });
  return container;
}

export async function flush() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export async function waitFor(assertion, timeoutMs = 2000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const result = assertion();
      if (result !== false) {
        return result;
      }
    } catch (error) {
      lastError = error;
    }

    await flush();
  }

  throw lastError || new Error("Timed out waiting for assertion.");
}

export async function changeValue(element, value) {
  await act(async () => {
    element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    const prototype = Object.getPrototypeOf(element);
    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    const previousValue = element.value;
    if (descriptor?.set) {
      descriptor.set.call(element, value);
    } else {
      element.value = value;
    }
    if (typeof element._valueTracker?.setValue === "function") {
      element._valueTracker.setValue(previousValue);
    }
    if (ReactDomTestUtils.Simulate?.change) {
      ReactDomTestUtils.Simulate.change(element);
    } else {
      element.dispatchEvent(new Event("input", { bubbles: true }));
      element.dispatchEvent(new Event("change", { bubbles: true }));
    }
    element.dispatchEvent(new FocusEvent("blur", { bubbles: true }));
  });
}

export async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

export async function submit(form) {
  await act(async () => {
    form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  });
}

export function textContent(node) {
  return node.textContent.replace(/\s+/g, " ").trim();
}
// Run with: npm run test:component
