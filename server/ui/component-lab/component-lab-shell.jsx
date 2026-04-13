"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { componentLabStyles } from "./component-lab-styles";

function groupMenuEntries(entries) {
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

export default function ComponentLabShell({ menuEntries, children }) {
  const pathname = usePathname();
  const hostRef = useRef(null);
  const [portalNode, setPortalNode] = useState();
  const [query, setQuery] = useState("");
  const filteredEntries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return menuEntries;
    }

    return menuEntries.filter((entry) => {
      return [
        entry.title,
        entry.id,
        entry.routePath
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [menuEntries, query]);
  const groupedEntries = groupMenuEntries(filteredEntries);

  useEffect(() => {
    if (!hostRef.current || portalNode) {
      return;
    }

    const shadowRoot = hostRef.current.shadowRoot || hostRef.current.attachShadow({ mode: "open" });
    const existingPortalNode = shadowRoot.querySelector("[data-component-lab-shell-root]");

    if (existingPortalNode) {
      setPortalNode(existingPortalNode);
      return;
    }

    const nextPortalNode = document.createElement("div");
    nextPortalNode.setAttribute("data-component-lab-shell-root", "true");
    shadowRoot.appendChild(nextPortalNode);
    setPortalNode(nextPortalNode);
  }, [portalNode]);

  return (
    <>
      <div ref={hostRef} />
      {portalNode ? createPortal(
        <>
          <style>{componentLabStyles}</style>
          <div className="component-lab-shell">
            <aside className="component-lab-sidebar">
              <div className="component-lab-sidebar-title">
                <h1>Playwright Component Lab</h1>
                <p>Browse every UI component from one menu, preview it in isolation, then inspect props and docs below.</p>
              </div>

              <label className="component-lab-sidebar-search">
                <span>Filter components</span>
                <ShadowSafeSearchInput
                  initialValue={query}
                  onValueChange={setQuery}
                  placeholder="loading, duel, profile"
                />
              </label>

              <nav className="component-lab-sidebar-menu" aria-label="Component lab menu">
                {Object.entries(groupedEntries).map(([group, entries]) => (
                  <section className="component-lab-sidebar-group" key={group}>
                    <header>
                      <h2>{group}</h2>
                      <span>{entries.length}</span>
                    </header>
                    <div className="component-lab-sidebar-links">
                      {entries.map((entry) => (
                        <Link className="component-lab-nav-link" data-active={pathname === entry.routePath ? "true" : "false"} href={entry.routePath} key={entry.id}>
                          <span className="component-lab-nav-link-title">{entry.title}</span>
                          <span className="component-lab-nav-link-meta">
                            <span>{entry.previewStrategy === "none" ? "Docs only" : "Preview ready"}</span>
                            <span>{entry.fileBaseName}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </section>
                ))}
              </nav>
            </aside>

            <main className="component-lab-main">{children}</main>
          </div>
        </>,
        portalNode
      ) : null}
    </>
  );
}
