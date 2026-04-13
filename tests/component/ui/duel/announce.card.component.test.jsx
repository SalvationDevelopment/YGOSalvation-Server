import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/announce.card.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("announce.card.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
