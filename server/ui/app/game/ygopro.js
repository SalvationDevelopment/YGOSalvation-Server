"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Renders the YGOPro Client component and returns the UI used by the ygopro view.
 * @returns {React.ReactNode} Returns the rendered UI used by the ygopro view.
 */
function YGOProClient() {
  const searchParams = useSearchParams();
  const room = searchParams.get("room");

  useEffect(() => {
            /**
     * Executes the cleanup helper used by the ygopro module.
     * @returns {void} Does not return a value.
     */
    let cleanup = () => {};
    let active = true;

    if (!room) {
      return cleanup;
    }

    import("../../services/game.service").then(({ default: startGame }) => {
      if (!active) {
        return;
      }

      return startGame(room).then((dispose) => {
        cleanup = dispose || cleanup;
      });
    });

    return () => {
      active = false;
      cleanup();
    };
  }, [room]);

  if (!room) {
    return (
      <div id="ygopro">
        <main id="main">
          <section id="lobby">
            <div id="lobbymenu">
              <div id="lobbygameinfo">
                <span id="translatefl">YGOPro Lobby</span>
                <br />
                <span id="lobbyflist">Missing room number</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div id="ygopro" data-room={room}>
      <main id="main" />
    </div>
  );
}

/**
 * Renders the YGOPro component and returns the UI used by the ygopro view.
 * @returns {React.ReactNode} Returns the rendered UI used by the ygopro view.
 */
export default function YGOPro() {
  return (
    <Suspense fallback={<div id="ygopro"><main id="main" /></div>}>
      <YGOProClient />
    </Suspense>
  );
}
