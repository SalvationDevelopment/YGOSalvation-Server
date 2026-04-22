import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/view_decks.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("view_decks.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
