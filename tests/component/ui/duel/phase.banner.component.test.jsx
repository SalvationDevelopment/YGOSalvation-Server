import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/phase.banner.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("phase.banner.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
