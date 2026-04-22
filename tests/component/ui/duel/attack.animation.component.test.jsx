import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/attack.animation.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("attack.animation.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
