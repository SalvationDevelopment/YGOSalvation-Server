import React from "react";
import ComponentLabWorkspace from "./component-lab-workspace";

export default function ComponentLabPage({ entry, Doc }) {
  return (
    <ComponentLabWorkspace componentId={entry.id}>
      <Doc />
    </ComponentLabWorkspace>
  );
}
