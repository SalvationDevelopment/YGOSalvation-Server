import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/sidechat.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("sidechat.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
