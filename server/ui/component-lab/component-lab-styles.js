export const componentLabStyles = `
:host {
  color-scheme: light;
  display: block;
  height: 100vh;
  overflow: auto;
  overscroll-behavior: contain;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.component-lab-shell {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(233, 189, 110, 0.24), transparent 24%),
    linear-gradient(180deg, #f8f2e8 0%, #efe6d8 100%);
  color: #1d160f;
  font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
}

.component-lab-sidebar {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 18px;
  padding: 24px 18px 24px 24px;
  border-right: 1px solid rgba(29, 22, 15, 0.12);
  background:
    linear-gradient(180deg, rgba(34, 25, 16, 0.96) 0%, rgba(22, 16, 10, 0.96) 100%);
  color: #f7f0e5;
}

.component-lab-sidebar h1,
.component-lab-sidebar h2,
.component-lab-sidebar h3,
.component-lab-sidebar p {
  margin: 0;
}

.component-lab-sidebar-title {
  display: grid;
  gap: 8px;
}

.component-lab-sidebar-title p {
  color: rgba(247, 240, 229, 0.76);
  line-height: 1.5;
}

.component-lab-sidebar-search {
  display: grid;
  gap: 8px;
}

.component-lab-sidebar-search input {
  width: 100%;
  border: 1px solid rgba(247, 240, 229, 0.14);
  border-radius: 14px;
  padding: 12px 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  font: inherit;
}

.component-lab-sidebar-search input::placeholder {
  color: rgba(247, 240, 229, 0.5);
}

.component-lab-sidebar-menu {
  min-height: 0;
  overflow: auto;
  padding-right: 8px;
  display: grid;
  gap: 20px;
}

.component-lab-sidebar-group {
  display: grid;
  gap: 10px;
}

.component-lab-sidebar-group header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.component-lab-sidebar-group header h2 {
  font-size: 0.88rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(247, 240, 229, 0.76);
}

.component-lab-sidebar-group header span {
  font-size: 0.78rem;
  color: rgba(247, 240, 229, 0.48);
}

.component-lab-sidebar-links {
  display: grid;
  gap: 6px;
}

.component-lab-nav-link {
  display: grid;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 14px;
  color: inherit;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid transparent;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
}

.component-lab-nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(247, 240, 229, 0.18);
  transform: translateX(2px);
}

.component-lab-nav-link[data-active="true"] {
  background: linear-gradient(135deg, rgba(214, 165, 78, 0.28), rgba(255, 255, 255, 0.06));
  border-color: rgba(233, 189, 110, 0.56);
}

.component-lab-nav-link-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.component-lab-nav-link-meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
  color: rgba(247, 240, 229, 0.62);
  font-size: 0.78rem;
}

.component-lab-main {
  min-width: 0;
  min-height: 100%;
  padding: 24px;
}

.component-lab-workspace {
  display: grid;
  grid-template-rows: auto auto minmax(320px, 1fr);
  gap: 18px;
  min-height: calc(100vh - 48px);
}

.component-lab-panel,
.component-lab-preview-shell,
.component-lab-preview-error,
.component-lab-preview-empty {
  border: 1px solid rgba(29, 22, 15, 0.12);
  border-radius: 20px;
  background: rgba(255, 252, 245, 0.94);
  box-shadow: 0 18px 50px rgba(34, 25, 16, 0.08);
}

.component-lab-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: start;
  padding: 22px 24px;
}

.component-lab-header-copy {
  display: grid;
  gap: 8px;
}

.component-lab-header-copy h1 {
  margin: 0;
  font-size: clamp(1.8rem, 2.3vw, 2.8rem);
  line-height: 1.08;
}

.component-lab-header-copy p {
  margin: 0;
  line-height: 1.55;
  color: rgba(29, 22, 15, 0.72);
}

.component-lab-header-meta {
  display: grid;
  gap: 10px;
  justify-items: end;
}

.component-lab-header-meta code,
.component-lab-inline-code,
.component-lab-code-block,
.component-lab-control textarea,
.component-lab-control input,
.component-lab-control select {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.component-lab-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.component-lab-badge--ready {
  background: #d8f2d9;
  color: #12511b;
}

.component-lab-badge--muted {
  background: #ece7dc;
  color: #645843;
}

.component-lab-preview-frame {
  display: grid;
  grid-template-rows: auto auto;
  min-height: fit-content;
}

.component-lab-preview-header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: start;
  padding: 20px 22px 0;
}

.component-lab-preview-header h2,
.component-lab-preview-header p {
  margin: 0;
}

.component-lab-preview-canvas-wrap {
  min-height: fit-content;
  display: grid;
  place-items: start center;
  padding: 20px;
}

.component-lab-preview-canvas {
  position: relative;
  isolation: isolate;
  contain: layout paint;
  width: 100%;
  max-width: 100%;
  height: 945px;
  min-height: 945px;
  overflow: auto;
  padding: 24px;
  border-radius: 18px;
  border: 1px dashed rgba(29, 22, 15, 0.14);
}

.component-lab-preview-runtime-host {
  display: block;
  width: 100%;
  min-height: 100%;
}

.component-lab-duel-harness {
  position: relative;
  width: 100%;
  min-height: 100%;
}

.component-lab-duel-field-slot {
  position: relative;
  min-height: 100%;
}

.component-lab-preview-canvas--paper {
  background: linear-gradient(180deg, #fffdf8 0%, #f7f1e4 100%);
}

.component-lab-preview-canvas--night {
  color: #fff;
  background: linear-gradient(180deg, #18232d 0%, #0f1217 100%);
}

.component-lab-preview-canvas--grid {
  background-color: #faf4eb;
  background-image:
    linear-gradient(rgba(133, 111, 70, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(133, 111, 70, 0.08) 1px, transparent 1px);
  background-size: 24px 24px;
}

.component-lab-bottom-panel {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}

.component-lab-tabbar {
  display: flex;
  gap: 10px;
  padding: 20px 22px 0;
}

.component-lab-tab {
  border: 1px solid rgba(29, 22, 15, 0.12);
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.7);
  color: #1d160f;
  cursor: pointer;
}

.component-lab-tab[data-active="true"] {
  background: #2e5fa7;
  border-color: #2e5fa7;
  color: #fff;
}

.component-lab-bottom-content {
  min-height: 0;
  overflow: auto;
  padding: 18px 22px 22px;
}

.component-lab-controls-panel {
  display: grid;
  gap: 18px;
}

.component-lab-controls {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.component-lab-control {
  display: grid;
  gap: 8px;
}

.component-lab-control input,
.component-lab-control select,
.component-lab-control textarea {
  width: 100%;
  border: 1px solid rgba(29, 22, 15, 0.18);
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  background: #fffdf9;
  color: #1d160f;
}

.component-lab-control textarea {
  min-height: 280px;
  resize: vertical;
}

.component-lab-reset {
  align-self: end;
  border: none;
  border-radius: 12px;
  padding: 12px 14px;
  font: inherit;
  font-weight: 700;
  color: #fff;
  background: #2e5fa7;
  cursor: pointer;
}

.component-lab-code-block {
  overflow-x: auto;
  padding: 14px;
  border-radius: 14px;
  background: #201710;
  color: #f8f3ea;
}

.component-lab-docs {
  display: grid;
  gap: 14px;
}

.component-lab-docs :is(h1, h2, h3) {
  margin: 0.2em 0 0;
}

.component-lab-docs p {
  margin: 0;
  line-height: 1.6;
}

.component-lab-docs ul,
.component-lab-docs ol {
  margin: 0;
  padding-left: 22px;
  line-height: 1.6;
}

.component-lab-docs pre {
  margin: 0;
}

.component-lab-docs blockquote {
  margin: 0;
  padding: 12px 14px;
  border-left: 4px solid #805f26;
  border-radius: 12px;
  background: #f9f1de;
  color: rgba(29, 22, 15, 0.82);
}

.component-lab-empty-state {
  display: grid;
  gap: 10px;
  padding: 28px;
}

.component-lab-empty-state h2,
.component-lab-empty-state p {
  margin: 0;
}

.component-lab-screen-child {
  padding: 24px;
  border-radius: 18px;
  background: rgba(46, 95, 167, 0.08);
}

@media (max-width: 1080px) {
  .component-lab-shell {
    grid-template-columns: 1fr;
  }

  .component-lab-sidebar {
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(29, 22, 15, 0.12);
  }

  .component-lab-main {
    padding: 18px;
  }

  .component-lab-workspace {
    min-height: auto;
    grid-template-rows: auto auto minmax(280px, 1fr);
  }

  .component-lab-header {
    grid-template-columns: 1fr;
    display: grid;
  }

  .component-lab-header-meta {
    justify-items: start;
  }
}
`;
