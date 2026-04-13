import test from "node:test";
import * as Module from "../../../../server/ui/components/screens/contact.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("contact.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
