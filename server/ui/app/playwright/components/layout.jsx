import ComponentLabShell from "@/component-lab/component-lab-shell";
import { componentLabEntries } from "@/component-lab/registry";

export default function ComponentLabLayout({ children }) {
  const menuEntries = componentLabEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    group: entry.group,
    fileBaseName: entry.fileBaseName,
    routePath: entry.routePath,
    previewStrategy: entry.preview.strategy
  }));

  return <ComponentLabShell menuEntries={menuEntries}>{children}</ComponentLabShell>;
}
