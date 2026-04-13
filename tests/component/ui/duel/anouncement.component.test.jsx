import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/anouncement.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("anouncement.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
