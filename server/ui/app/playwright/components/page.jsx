import { componentLabEntries } from "@/component-lab/registry";
import { redirect } from "next/navigation";

export default function ComponentLabIndexPage() {
  redirect(componentLabEntries[0]?.routePath || "/playwright");
}
