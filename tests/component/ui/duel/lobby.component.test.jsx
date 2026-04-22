import test from "node:test";
import * as Module from "../../../../server/ui/components/duel/lobby.component.jsx";
import { expectNamedFunctionExport } from "../component-smoke-test-utils.js";

test("lobby.component.jsx exports LobbyScreen", () => {
  expectNamedFunctionExport(Module, "LobbyScreen");
});
