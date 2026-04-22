import React from "react";
import styles from "./grid-mechanics-preview.module.scss";

const patterns = [
  {
    name: "Split shell",
    formula: "grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.78fr);",
    use: "Primary workbench + rail layouts, especially the host screen.",
    note: "The main column is flexible. The rail keeps a minimum readable width instead of collapsing too early.",
    diagram: (
      <div className={`${styles.diagram} ${styles.splitDiagram}`}>
        <div>Main workspace</div>
        <div>Rail</div>
      </div>
    )
  },
  {
    name: "Three-column dashboard",
    formula: "grid-template-columns: minmax(16rem, 0.9fr) minmax(20rem, 1.1fr) minmax(20rem, 1.1fr);",
    use: "Profile and other data-dense overview surfaces.",
    note: "Tracks are explicit rather than equal, so the narrow summary lane does not steal room from the heavier editing panels.",
    diagram: (
      <div className={`${styles.diagram} ${styles.dashboardDiagram}`}>
        <div>Summary</div>
        <div>Primary panel</div>
        <div>Secondary panel</div>
      </div>
    )
  },
  {
    name: "Auto-fit collection",
    formula: "grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));",
    use: "Tournament cards, side-card lists, and other repeatable content groups.",
    note: "This is the default responsive card pattern. Cards wrap when space is constrained instead of forcing a rigid desktop count.",
    diagram: (
      <div className={`${styles.diagram} ${styles.collectionDiagram}`}>
        <div>Card</div>
        <div>Card</div>
        <div>Card</div>
        <div>Card</div>
      </div>
    )
  },
  {
    name: "Structured form grid",
    formula: "grid-template-columns: repeat(2, minmax(0, 1fr));",
    use: "Host settings, tournament forms, and filter panels.",
    note: "Inputs sit in even pairs, and fields that need full width jump across with `grid-column: 1 / -1`.",
    diagram: (
      <div className={`${styles.diagram} ${styles.formDiagram}`}>
        <div>Field</div>
        <div>Field</div>
        <div className={styles.spanTwo}>Full-width field</div>
        <div>Field</div>
        <div>Field</div>
      </div>
    )
  },
  {
    name: "Calendar matrix",
    formula: "grid-template-columns: repeat(7, minmax(0, 1fr));",
    use: "Month-view calendars and evenly distributed matrix views.",
    note: "Seven equal tracks keep weekday alignment stable. On small screens this collapses to a single column instead of keeping a tiny desktop grid.",
    diagram: (
      <div className={`${styles.diagram} ${styles.calendarDiagram}`}>
        {Array.from({ length: 14 }, (_, index) => (
          <div key={`calendar-cell-${index + 1}`}>{index + 1}</div>
        ))}
      </div>
    )
  },
  {
    name: "Named areas",
    formula: 'grid-template-areas: "search center info";',
    use: "The deck editor shell, where region identity matters more than generic columns.",
    note: "This is the exception, not the default. Named areas are used when the UI has stable, semantic regions that must be rearranged at smaller widths.",
    diagram: (
      <div className={`${styles.diagram} ${styles.areaDiagram}`}>
        <div className={styles.searchArea}>Search</div>
        <div className={styles.centerArea}>Center</div>
        <div className={styles.infoArea}>Info</div>
      </div>
    )
  }
];

const rules = [
  "Use `minmax(0, 1fr)` on flexible tracks so overflowing children do not blow the grid wider than the viewport.",
  "Use explicit side-rail minimums like `minmax(18rem, 0.78fr)` when a column must stay usable at desktop widths.",
  "Use `repeat(auto-fit, minmax(...))` for card sets and lists that can reflow without semantic ordering changes.",
  "Use `grid-column: 1 / -1` for wide fields, banners, and exceptions inside otherwise regular grids.",
  "Collapse to `1fr` in route-level media queries rather than shrinking desktop grids into unreadable miniature tracks."
];

const breakpoints = [
  {
    label: "1100px",
    detail: "Host and tournament create collapse split shells and compact grids."
  },
  {
    label: "760px",
    detail: "Forms, modal actions, and button stacks move to a single column."
  },
  {
    label: "72rem",
    detail: "Tournament calendar collapses its three-lane board into a single column."
  },
  {
    label: "64rem / 44rem",
    detail: "Tournament hub summary grids step from three columns to two and then one."
  }
];

export default function GridMechanicsPreview() {
  return (
    <div className={styles.root}>
      <section className={styles.banner}>
        <p className={styles.kicker}>Current audit</p>
        <h2>The app uses local CSS grids, not one shared twelve-column system.</h2>
        <p>
          Layouts are screen-owned and tuned to the content they carry. The recurring mechanics are still consistent:
          flexible main tracks, guarded side rails, auto-fit card collections, and explicit single-column collapse rules.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Recurring grid patterns</h3>
          <p>These templates appear across the application and define most of the layout behavior in practice.</p>
        </div>
        <div className={styles.patternGrid}>
          {patterns.map((pattern) => (
            <article className={styles.patternCard} key={pattern.name}>
              <div className={styles.patternHeader}>
                <div>
                  <h4>{pattern.name}</h4>
                  <p>{pattern.use}</p>
                </div>
              </div>
              {pattern.diagram}
              <code className={styles.code}>{pattern.formula}</code>
              <p className={styles.note}>{pattern.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sideBySide}>
        <article className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Operating rules</h3>
            <p>These are the mechanics the existing screen modules keep repeating.</p>
          </div>
          <ul className={styles.ruleList}>
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </article>

        <article className={styles.section}>
          <div className={styles.sectionHeader}>
            <h3>Observed breakpoints</h3>
            <p>The exact breakpoint values are route-owned, but these thresholds show up repeatedly.</p>
          </div>
          <div className={styles.breakpointList}>
            {breakpoints.map((breakpoint) => (
              <div className={styles.breakpointItem} key={breakpoint.label}>
                <strong>{breakpoint.label}</strong>
                <span>{breakpoint.detail}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
