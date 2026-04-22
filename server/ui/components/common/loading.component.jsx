"use client";

import styles from "./loading.component.module.scss";

/**
 * Render contract
 * Purpose:
 * Renders a small loading surface or a fullscreen blocking loading state.
 *
 * Render Props:
 * - `title`: heading text shown in the panel
 * - `message`: supporting copy shown below the title
 * - `fullscreen`: when true, expands to the fullscreen variant
 * - `className`: optional additional owner class hook from the parent
 *
 * Feed Inputs:
 * - none
 *
 * Feed Outputs:
 * - none
 *
 * Ambient Dependencies:
 * - none
 *
 * Refactor target:
 * - keep this component fully prop-driven
 */
export default function LoadingComponent({
  title = "Loading",
  message = "Please wait.",
  fullscreen = true,
  className = "",
}) {
  const classes = [
    styles.root,
    fullscreen ? styles.fullscreen : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes}>
      <div className={styles.panel}>
        <h1>{title}</h1>
        <p>{message}</p>
      </div>
    </section>
  );
}
