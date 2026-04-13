import ComponentLabPage from "@/component-lab/component-lab-page";
import {
  componentLabEntries,
  getComponentLabEntryFromSlug,
  loadComponentLabDocModule
} from "@/component-lab/registry";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return componentLabEntries.map((entry) => ({
    slug: [entry.group, entry.fileBaseName]
  }));
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const entry = getComponentLabEntryFromSlug(resolvedParams.slug);

  if (!entry) {
    return {
      title: "Component Lab"
    };
  }

  return {
    title: `Component Lab | ${entry.title}`
  };
}

export default async function ComponentLabEntryPage({ params }) {
  const resolvedParams = await params;
  const entry = getComponentLabEntryFromSlug(resolvedParams.slug);

  if (!entry) {
    notFound();
  }

  const docModule = await loadComponentLabDocModule(entry.id);

  if (!docModule?.default) {
    notFound();
  }

  return <ComponentLabPage entry={entry} Doc={docModule.default} />;
}
