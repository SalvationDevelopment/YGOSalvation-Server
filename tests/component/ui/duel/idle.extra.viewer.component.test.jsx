import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/idle.extra.viewer.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("idle.extra.viewer.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
