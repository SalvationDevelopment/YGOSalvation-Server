"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ComponentLabPreviewCanvas,
  ComponentLabPreviewControls,
  useComponentLabPreviewModel
} from "./component-lab-preview";

function ShadowSafeButton({ children, onPress, ...props }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    const element = buttonRef.current;

    if (!element) {
      return undefined;
    }

    const handleClick = () => {
      onPress?.();
    };

    element.addEventListener("click", handleClick);

    return () => {
      element.removeEventListener("click", handleClick);
    };
  }, [onPress]);

  return (
    <button {...props} ref={buttonRef} type={props.type || "button"}>
      {children}
    </button>
  );
}

export default function ComponentLabWorkspace({ componentId, children }) {
  const [activeTab, setActiveTab] = useState("props");
  const model = useComponentLabPreviewModel(componentId);

  if (!model?.entry) {
    return null;
  }

  return (
    <section className="component-lab-workspace">
      <header className="component-lab-panel component-lab-header">
        <div className="component-lab-header-copy">
          <span className={`component-lab-badge component-lab-badge--${model.entry.preview.strategy === "none" ? "muted" : "ready"}`}>
            {model.entry.preview.strategy === "none" ? "Docs only" : "Preview ready"}
          </span>
          <h1>{model.entry.title}</h1>
          <p>{model.entry.summary}</p>
        </div>
        <div className="component-lab-header-meta">
          <code>{model.entry.sourcePath}</code>
        </div>
      </header>

      <ComponentLabPreviewCanvas model={model} />

      <section className="component-lab-panel component-lab-bottom-panel">
        <div className="component-lab-tabbar">
          <ShadowSafeButton className="component-lab-tab" data-active={activeTab === "props" ? "true" : "false"} onPress={() => setActiveTab("props")}>
            Props
          </ShadowSafeButton>
          <ShadowSafeButton className="component-lab-tab" data-active={activeTab === "docs" ? "true" : "false"} onPress={() => setActiveTab("docs")}>
            Docs
          </ShadowSafeButton>
        </div>

        <div className="component-lab-bottom-content">
          {activeTab === "props"
            ? <ComponentLabPreviewControls model={model} />
            : <article className="component-lab-docs">{children}</article>}
        </div>
      </section>
    </section>
  );
}
