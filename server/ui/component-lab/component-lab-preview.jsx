"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ComponentLabDuelHarness from "./component-lab-duel-harness";
import { componentModuleLoaders, getComponentLabEntryById } from "./registry";
import PreviewErrorBoundary from "./preview-error-boundary";
import { syncShadowStyles } from "./shadow-style-mirror";

function safeStringify(value) {
  return JSON.stringify(value, null, 2);
}

function updateTopLevelProp(propsText, prop, value) {
  let currentProps = {};

  try {
    currentProps = JSON.parse(propsText || "{}");
  } catch {
    currentProps = {};
  }

  return safeStringify({
    ...currentProps,
    [prop]: value
  });
}

function useNativeEvent(ref, eventName, handler) {
  useEffect(() => {
    const element = ref.current;

    if (!element || !handler) {
      return undefined;
    }

    element.addEventListener(eventName, handler);

    return () => {
      element.removeEventListener(eventName, handler);
    };
  }, [eventName, handler, ref]);
}

function ShadowSafeButton({ children, onPress, ...props }) {
  const buttonRef = useRef(null);
  useNativeEvent(buttonRef, "click", () => {
    onPress?.();
  });

  return (
    <button {...props} ref={buttonRef} type={props.type || "button"}>
      {children}
    </button>
  );
}

function ShadowSafeCheckbox({ checked, onValueChange, ...props }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.checked = Boolean(checked);
    }
  }, [checked]);

  useNativeEvent(inputRef, "change", () => {
    onValueChange?.(Boolean(inputRef.current?.checked));
  });

  return <input {...props} defaultChecked={Boolean(checked)} ref={inputRef} type="checkbox" />;
}

function ShadowSafeSelect({ children, onValueChange, value, ...props }) {
  const selectRef = useRef(null);

  useEffect(() => {
    if (selectRef.current && value !== undefined) {
      selectRef.current.value = String(value);
    }
  }, [value]);

  useNativeEvent(selectRef, "change", () => {
    onValueChange?.(selectRef.current?.value);
  });

  return (
    <select {...props} defaultValue={value} ref={selectRef}>
      {children}
    </select>
  );
}

function ShadowSafeRange({ onValueChange, value, ...props }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && value !== undefined) {
      inputRef.current.value = String(value);
    }
  }, [value]);

  useNativeEvent(inputRef, "input", () => {
    onValueChange?.(inputRef.current?.value);
  });

  return <input {...props} defaultValue={value} ref={inputRef} type="range" />;
}

function ShadowSafeTextarea({ onValueChange, value, ...props }) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current && textareaRef.current.value !== value) {
      textareaRef.current.value = value || "";
    }
  }, [value]);

  useNativeEvent(textareaRef, "input", () => {
    onValueChange?.(textareaRef.current?.value || "");
  });

  return <textarea {...props} defaultValue={value} ref={textareaRef} />;
}

const previewShadowStyles = `
:host {
  display: block;
  width: 100%;
  height: 100%;
}

.component-lab-preview-runtime-root {
  position: relative;
  width: 100%;
  min-height: 100%;
  isolation: isolate;
}

.component-lab-preview-runtime-surface {
  position: relative;
  width: 100%;
  min-height: 100%;
  color: var(--component-lab-runtime-color, inherit);
  background: var(--component-lab-runtime-background, transparent);
  background-size: var(--component-lab-runtime-background-size, auto);
}

.component-lab-preview-runtime-root--paper {
  --component-lab-runtime-color: #1d160f;
  --component-lab-runtime-background: linear-gradient(180deg, #fffdf8 0%, #f7f1e4 100%);
}

.component-lab-preview-runtime-root--night {
  --component-lab-runtime-color: #fff;
  --component-lab-runtime-background: linear-gradient(180deg, #18232d 0%, #0f1217 100%);
}

.component-lab-preview-runtime-root--grid {
  --component-lab-runtime-color: #1d160f;
  --component-lab-runtime-background:
    linear-gradient(rgba(133, 111, 70, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(133, 111, 70, 0.08) 1px, transparent 1px),
    linear-gradient(180deg, #fffdf8 0%, #f7f1e4 100%);
  --component-lab-runtime-background-size: 24px 24px, 24px 24px, auto;
}
`;

function PreviewRuntimeRoot({ children, tone }) {
  const hostRef = useRef(null);
  const styleRootRef = useRef(null);
  const [portalNode, setPortalNode] = useState();

  useEffect(() => {
    if (!hostRef.current || portalNode) {
      return;
    }

    const shadowRoot = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: "open" });
    const existingStyleRoot = shadowRoot.querySelector("[data-component-lab-preview-styles]");
    const existingPortalNode = shadowRoot.querySelector("[data-component-lab-preview-root]");

    if (existingStyleRoot && existingPortalNode) {
      styleRootRef.current = existingStyleRoot;
      setPortalNode(existingPortalNode);
      return;
    }

    const styleRoot = document.createElement("div");
    const nextPortalNode = document.createElement("div");
    styleRoot.setAttribute("data-component-lab-preview-styles", "true");
    nextPortalNode.setAttribute("data-component-lab-preview-root", "true");
    styleRootRef.current = styleRoot;
    shadowRoot.appendChild(styleRoot);
    shadowRoot.appendChild(nextPortalNode);
    setPortalNode(nextPortalNode);
  }, [portalNode]);

  useEffect(() => {
    if (!styleRootRef.current) {
      return;
    }

    syncShadowStyles(styleRootRef.current);

    const observer = new MutationObserver(() => {
      syncShadowStyles(styleRootRef.current);
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });

    return () => {
      observer.disconnect();
    };
  }, [portalNode]);

  return (
    <>
      <div className="component-lab-preview-runtime-host" ref={hostRef} />
      {portalNode ? createPortal(
        <>
          <style>{previewShadowStyles}</style>
          <div className={`component-lab-preview-runtime-root component-lab-preview-runtime-root--${tone}`}>
            <div className="component-lab-preview-runtime-surface">{children}</div>
          </div>
        </>,
        portalNode
      ) : null}
    </>
  );
}

function PreviewSurface({ entry, propsValue, width, tone }) {
  const [moduleNamespace, setModuleNamespace] = useState();
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadModule() {
      setLoadError("");

      try {
        const nextModule = await componentModuleLoaders[entry.id]?.();
        if (!cancelled) {
          setModuleNamespace(nextModule);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(error?.message || "Unable to load preview module.");
        }
      }
    }

    loadModule();

    return () => {
      cancelled = true;
    };
  }, [entry.id]);

  const PreviewComponent = useMemo(() => {
    if (!moduleNamespace) {
      return undefined;
    }

    if (entry.preview.strategy === "named") {
      return moduleNamespace[entry.preview.exportName];
    }

    return moduleNamespace.default;
  }, [entry.preview.exportName, entry.preview.strategy, moduleNamespace]);

  if (entry.preview.strategy === "none") {
    return (
      <div className="component-lab-preview-empty">
        <h3>Preview harness pending</h3>
        <p>This component is documented, but its standalone harness is still intentionally withheld because the runtime contract is too coupled.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="component-lab-preview-error">
        <h3>Preview failed to load</h3>
        <p>{loadError}</p>
      </div>
    );
  }

  if (!PreviewComponent) {
    return (
      <div className="component-lab-preview-empty">
        <p>Loading preview module...</p>
      </div>
    );
  }

  return (
    <PreviewErrorBoundary resetKey={`${entry.id}:${tone}:${width}:${safeStringify(propsValue)}`}>
      <div className={`component-lab-preview-canvas component-lab-preview-canvas--${tone}`} style={{ width: `${width}px` }}>
        <PreviewRuntimeRoot tone={tone}>
          {entry.group === "duel" ? (
            <ComponentLabDuelHarness entryId={entry.id}>
              <PreviewComponent {...propsValue} />
            </ComponentLabDuelHarness>
          ) : (
            <PreviewComponent {...propsValue} />
          )}
        </PreviewRuntimeRoot>
      </div>
    </PreviewErrorBoundary>
  );
}

export function useComponentLabPreviewModel(componentId) {
  const entry = getComponentLabEntryById(componentId);
  const [surfaceWidth, setSurfaceWidth] = useState(1200);
  const [surfaceTone, setSurfaceTone] = useState("paper");
  const [presetIndex, setPresetIndex] = useState(0);
  const [propsText, setPropsText] = useState(() => safeStringify(entry?.preview?.initialProps || {}));

  useEffect(() => {
    setPresetIndex(0);
    setSurfaceWidth(1200);
    setSurfaceTone("paper");
    setPropsText(safeStringify(entry?.preview?.initialProps || {}));
  }, [entry?.id]);

  const parseResult = useMemo(() => {
    try {
      return {
        props: JSON.parse(propsText || "{}")
      };
    } catch (error) {
      return {
        props: undefined,
        errorMessage: error?.message || "Invalid JSON."
      };
    }
  }, [propsText]);
  const mergedProps = parseResult.props
    ? {
        ...parseResult.props,
        ...(entry?.preview?.fixedProps || {})
      }
    : undefined;
  const selectedPreset = entry?.preview?.presets?.[presetIndex];

  return {
    entry,
    surfaceWidth,
    setSurfaceWidth,
    surfaceTone,
    setSurfaceTone,
    presetIndex,
    setPresetIndex,
    propsText,
    setPropsText,
    parseResult,
    mergedProps,
    selectedPreset,
    reset() {
      setPresetIndex(0);
      setSurfaceWidth(1200);
      setSurfaceTone("paper");
      setPropsText(safeStringify(entry?.preview?.initialProps || {}));
    }
  };
}

export function ComponentLabPreviewCanvas({ model }) {
  if (!model?.entry) {
    return null;
  }

  return (
    <section className="component-lab-panel component-lab-preview-frame">
      <header className="component-lab-preview-header">
        <div>
          <h2>Preview</h2>
          <p>{model.entry.preview.strategy === "none" ? "Documentation-only entry" : "Isolated render surface with runtime styles scoped to the preview only."}</p>
        </div>
        <span className={`component-lab-badge component-lab-badge--${model.entry.preview.strategy === "none" ? "muted" : "ready"}`}>
          {model.entry.preview.strategy === "none" ? "Docs only" : "Live preview"}
        </span>
      </header>

      <div className="component-lab-preview-canvas-wrap">
        {model.parseResult.errorMessage ? (
          <div className="component-lab-preview-error">
            <h3>Props JSON is invalid</h3>
            <p>{model.parseResult.errorMessage}</p>
          </div>
        ) : (
          <PreviewSurface
            entry={model.entry}
            propsValue={model.mergedProps}
            width={model.surfaceWidth}
            tone={model.surfaceTone}
          />
        )}
      </div>
    </section>
  );
}

export function ComponentLabPreviewControls({ model }) {
  if (!model?.entry) {
    return null;
  }

  return (
    <section className="component-lab-controls-panel">
      {model.entry.preview.strategy !== "none" ? (
        <>
          <div className="component-lab-controls">
            {(model.entry.preview.controls || []).map((control) => {
              if (control.type !== "boolean") {
                return null;
              }

              return (
                <label className="component-lab-control" key={`${model.entry.id}-control-${control.prop}`}>
                  <span>{control.label}</span>
                  <ShadowSafeCheckbox
                    checked={Boolean(model.parseResult.props?.[control.prop])}
                    onValueChange={(checked) => model.setPropsText(updateTopLevelProp(model.propsText, control.prop, checked))}
                  />
                </label>
              );
            })}

            <label className="component-lab-control">
              <span>Preset</span>
              <ShadowSafeSelect
                value={model.presetIndex}
                onValueChange={(nextValue) => {
                  const nextIndex = Number(nextValue || 0);
                  const nextPreset = model.entry.preview.presets[nextIndex];
                  model.setPresetIndex(nextIndex);
                  model.setPropsText(safeStringify(nextPreset?.props || model.entry.preview.initialProps || {}));
                }}
              >
                {model.entry.preview.presets.map((preset, index) => (
                  <option key={`${model.entry.id}-preset-${preset.label}-${index}`} value={index}>
                    {preset.label}
                  </option>
                ))}
              </ShadowSafeSelect>
            </label>

            <label className="component-lab-control">
              <span>Preview width</span>
              <ShadowSafeRange
                min="320"
                max="1280"
                step="20"
                value={model.surfaceWidth}
                onValueChange={(nextValue) => model.setSurfaceWidth(Number(nextValue || 1200))}
              />
              <small>{model.surfaceWidth}px</small>
            </label>

            <label className="component-lab-control">
              <span>Surface tone</span>
              <ShadowSafeSelect value={model.surfaceTone} onValueChange={(nextValue) => model.setSurfaceTone(nextValue)}>
                <option value="paper">Paper</option>
                <option value="night">Night</option>
                <option value="grid">Grid</option>
              </ShadowSafeSelect>
            </label>

            <ShadowSafeButton className="component-lab-reset" onPress={() => model.reset()}>
              Reset controls
            </ShadowSafeButton>
          </div>

          <label className="component-lab-control">
            <span>Props JSON</span>
            <ShadowSafeTextarea onValueChange={(nextValue) => model.setPropsText(nextValue)} rows={18} spellCheck={false} value={model.propsText} />
          </label>
        </>
      ) : (
        <div className="component-lab-empty-state">
          <h2>No live props editor</h2>
          <p>This component is still documentation-only. Use the docs tab to review its contract before building a safer isolated harness.</p>
        </div>
      )}

      <div>
        <strong>Import</strong>
        <pre className="component-lab-code-block">{model.entry.preview.strategy === "named"
          ? `import { ${model.entry.preview.exportName} } from "${model.entry.importPath}";`
          : model.entry.documentationImportStatement}</pre>
      </div>
    </section>
  );
}
