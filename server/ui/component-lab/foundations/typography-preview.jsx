import React from "react";
import styles from "./typography-preview.module.scss";

const fontFamilies = [
  {
    name: "UI Sans",
    stack: '"Segoe UI", SegoeUI, "Helvetica Neue", Arial, sans-serif',
    use: "Default body copy, labels, buttons, and form controls from `main.scss`."
  },
  {
    name: "Display Sans",
    stack: '"Lato", sans-serif',
    use: "Global `h1` and `h2`, plus the super-header wordmark treatment."
  },
  {
    name: "HUD Serif",
    stack: 'Georgia, "Times New Roman", serif',
    use: "Life point numerals and other high-contrast duel readouts."
  },
  {
    name: "Mono",
    stack: 'var(--font-geist-mono), monospace',
    use: "Code, debug surfaces, and the component lab shell."
  },
  {
    name: "Legacy News Sans",
    stack: "Tahoma, Helvetica, Arial, sans-serif",
    use: "News listing and article bodies that still preserve the legacy reading treatment."
  }
];

const roles = [
  {
    name: "Display heading",
    source: "Global `h1` in `main.scss`",
    summary: "Hero and brand-facing moments use a light Lato treatment with a very large scale.",
    css: 'font-family: "Lato", sans-serif; font-weight: 300; font-variant: small-caps;',
    style: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 300,
      fontVariant: "small-caps",
      lineHeight: 1.05,
      fontSize: "clamp(2.8rem, 8vw, 5.4rem)"
    },
    sample: "YGOSalvation"
  },
  {
    name: "Section heading",
    source: "Global `h2` and screen section heads",
    summary: "Section titles stay restrained, slightly condensed, and brighter than body copy.",
    css: 'font-family: "Lato", sans-serif; font-weight: 600; letter-spacing: -0.01em;',
    style: {
      fontFamily: '"Lato", sans-serif',
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.15,
      fontSize: "2rem"
    },
    sample: "Tournament Calendar"
  },
  {
    name: "Body copy",
    source: "`body` in `main.scss`",
    summary: "The default reading layer uses the Segoe/Helvetica/Arial stack at 16px with open line-height.",
    css: 'font-family: "Segoe UI", SegoeUI, "Helvetica Neue", Arial, sans-serif; font-size: 16px;',
    style: {
      fontFamily: '"Segoe UI", SegoeUI, "Helvetica Neue", Arial, sans-serif',
      fontWeight: 400,
      lineHeight: 1.6,
      fontSize: "1rem"
    },
    sample: "Use the default UI stack for product copy, labels, and most app-facing content."
  },
  {
    name: "Eyebrow and metadata",
    source: "Recurring screen modules like profile, host, tournaments, and calendar",
    summary: "Metadata labels are consistently uppercase, tight, and tracked out for separation.",
    css: "font-size: 0.72rem - 0.82rem; letter-spacing: 0.08em - 0.18em; text-transform: uppercase;",
    style: {
      fontFamily: '"Segoe UI", SegoeUI, "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      lineHeight: 1.3,
      fontSize: "0.78rem"
    },
    sample: "Round Started"
  },
  {
    name: "Action label",
    source: "CTA and button rules in login, host, tournaments, and tournament flows",
    summary: "Buttons reuse the same uppercase, small-size, bold label pattern as metadata, but with denser weight.",
    css: "font-size: 0.76rem - 0.78rem; font-weight: 700; text-transform: uppercase;",
    style: {
      fontFamily: '"Segoe UI", SegoeUI, "Helvetica Neue", Arial, sans-serif',
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      lineHeight: 1.3,
      fontSize: "0.78rem"
    },
    sample: "Create Tournament"
  },
  {
    name: "HUD numerals",
    source: "`#lifepoints .lp-value` in `main.scss`",
    summary: "The duel HUD switches to a serif face for high-impact numbers and scoreboards.",
    css: 'font-family: Georgia, "Times New Roman", serif; font-size: 20px; font-weight: 700;',
    style: {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontWeight: 700,
      letterSpacing: "0.02em",
      lineHeight: 1,
      fontSize: "2rem"
    },
    sample: "8000"
  },
  {
    name: "Code and diagnostics",
    source: "Component lab, logs, and debug surfaces",
    summary: "Monospace is reserved for code snippets, diagnostic output, and implementation details.",
    css: "font-family: var(--font-geist-mono), monospace;",
    style: {
      fontFamily: "var(--font-geist-mono), monospace",
      fontWeight: 400,
      lineHeight: 1.5,
      fontSize: "0.95rem"
    },
    sample: 'grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));'
  },
  {
    name: "Legacy article copy",
    source: "`news.component.module.scss` and `news-article.component.module.scss`",
    summary: "News retains a smaller Tahoma-based editorial treatment and should be treated as an explicit exception.",
    css: "font-family: tahoma, helvetica, arial, sans-serif; font-size: 12px;",
    style: {
      fontFamily: "Tahoma, Helvetica, Arial, sans-serif",
      fontWeight: 400,
      lineHeight: 1.45,
      fontSize: "0.75rem"
    },
    sample: "This route still keeps the legacy article typography instead of the newer application body rhythm."
  }
];

export default function TypographyPreview() {
  return (
    <div className={styles.root}>
      <section className={styles.banner}>
        <p className={styles.kicker}>Current audit</p>
        <h2>Typography in production is role-based, not tokenized.</h2>
        <p>
          Most application UI sits on one sans stack, but the app still carries explicit display, serif HUD, mono, and
          legacy news exceptions. This page consolidates the active rules before a deeper design-system cleanup.
        </p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Active font stacks</h3>
          <p>These are the families the UI currently declares directly in global or screen-owned styles.</p>
        </div>
        <div className={styles.familyGrid}>
          {fontFamilies.map((family) => (
            <article className={styles.familyCard} key={family.name}>
              <div>
                <p className={styles.familyName}>{family.name}</p>
                <p className={styles.familyUse}>{family.use}</p>
              </div>
              <code className={styles.code}>{family.stack}</code>
              <p className={styles.familySample} style={{ fontFamily: family.stack }}>
                Aa Bb Cc 0123456789
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Recurring type roles</h3>
          <p>These are the treatments that repeat across routes and components today.</p>
        </div>
        <div className={styles.roleGrid}>
          {roles.map((role) => (
            <article className={styles.roleCard} key={role.name}>
              <div className={styles.roleMeta}>
                <div>
                  <h4>{role.name}</h4>
                  <p>{role.summary}</p>
                </div>
                <span>{role.source}</span>
              </div>
              <div className={styles.specimen}>
                <p className={styles.specimenLabel}>Specimen</p>
                <p className={styles.specimenSample} style={role.style}>
                  {role.sample}
                </p>
              </div>
              <code className={styles.code}>{role.css}</code>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
