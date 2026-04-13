import React from "react";

function LabCallout({ children, tone = "info" }) {
  return <div className={`component-lab-callout component-lab-callout--${tone}`}>{children}</div>;
}

export function useMDXComponents(components) {
  return {
    h1: (props) => <h1 className="component-lab-docs-title" {...props} />,
    h2: (props) => <h2 className="component-lab-docs-heading" {...props} />,
    h3: (props) => <h3 className="component-lab-docs-subheading" {...props} />,
    p: (props) => <p className="component-lab-docs-copy" {...props} />,
    ul: (props) => <ul className="component-lab-docs-list" {...props} />,
    ol: (props) => <ol className="component-lab-docs-list" {...props} />,
    code: (props) => <code className="component-lab-inline-code" {...props} />,
    pre: (props) => <pre className="component-lab-code-block" {...props} />,
    Callout: LabCallout,
    ...components
  };
}
