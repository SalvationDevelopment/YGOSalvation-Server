import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/select_starting_player.component.jsx";
import { expectDefaultComponentExport } from "../component-smoke-test-utils.js";

test("select_starting_player.component.jsx exports a default component", () => {
  expectDefaultComponentExport(Module);
});
