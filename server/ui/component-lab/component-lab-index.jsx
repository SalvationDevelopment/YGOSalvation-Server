"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { componentLabEntries, componentLabPreviewReadyCount } from "./registry";

function groupEntries(entries) {
  return entries.reduce((groups, entry) => {
    if (!groups[entry.group]) {
      groups[entry.group] = [];
    }

    groups[entry.group].push(entry);
    return groups;
  }, {});
}

function ShadowSafeSearchInput({ initialValue = "", onValueChange, placeholder }) {
  const inputRef = useRef(null);

  useEffect(() => {
    const element = inputRef.current;

    if (!element) {
      return undefined;
    }

    const handleInput = () => {
      onValueChange?.(element.value || "");
    };

    element.addEventListener("input", handleInput);

    return () => {
      element.removeEventListener("input", handleInput);
    };
  }, [onValueChange]);

  return (
    <input
      defaultValue={initialValue}
      placeholder={placeholder}
      ref={inputRef}
      type="search"
    />
  );
}

export default function ComponentLabIndex() {
  const [query, setQuery] = useState("");
  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return componentLabEntries;
    }

    return componentLabEntries.filter((entry) => {
      return [
        entry.title,
        entry.id,
        entry.sourcePath
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [query]);
  const groupedEntries = groupEntries(filteredEntries);

  return (
    <section className="component-lab-page">
      <header className="component-lab-hero">
        <div>
          <p className="component-lab-eyebrow">Playwright Component Lab</p>
          <h1>Component previews, MDX notes, and junior-friendly implementation context</h1>
          <p>
            Each entry gets its own page. Stable components render live with editable props JSON; runtime-heavy ones still ship with MDX guidance and an explicit harness status.
          </p>
        </div>
        <div className="component-lab-hero-metrics">
          <div>
            <strong>{componentLabEntries.length}</strong>
            <span>documented components</span>
          </div>
          <div>
            <strong>{componentLabPreviewReadyCount}</strong>
            <span>live previews</span>
          </div>
        </div>
      </header>

      <label className="component-lab-search">
        <span>Find a component</span>
        <ShadowSafeSearchInput
          initialValue={query}
          onValueChange={setQuery}
          placeholder="Try loading.component, duel, or profile"
        />
      </label>

      {Object.entries(groupedEntries).map(([group, entries]) => (
        <section className="component-lab-group" key={group}>
          <header>
            <h2>{group}</h2>
            <p>{entries.length} entries</p>
          </header>
          <div className="component-lab-card-grid">
            {entries.map((entry) => (
              <Link className="component-lab-card" href={entry.routePath} key={entry.id}>
                <div className="component-lab-card-topline">
                  <span className={`component-lab-badge component-lab-badge--${entry.preview.strategy === "none" ? "muted" : "ready"}`}>
                    {entry.preview.strategy === "none" ? "Docs only" : "Preview ready"}
                  </span>
                  <span>{entry.group}</span>
                </div>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                <code>{entry.sourcePath}</code>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
