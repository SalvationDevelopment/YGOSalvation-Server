"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { emit, on } from "../services/listener.service";
import LoginScreen from "../components/screens/login.component";
import { userAlert, closeModal } from "../services/modal";
import { connect, write, setSession } from "../services/connection.service";
import { useAuthState } from "../hooks/use-auth-state";
import { boot } from "../services/boot.service";

let toolTipData = "";
let runtimeInitialized = false;
let tooltipListenerAttached = false;
let unloadHandlerAttached = false;
let sessionCheckInterval;
let hostRequestPending = false;
let runtimeListenerCleanup = [];
let lastOpenedLobby = {
  port: undefined,
  at: 0,
};

const SESSION_VALIDATION_INTERVAL_MS = 5 * 60 * 1000;

function updateTooltip(event) {
  const tooltip = document.querySelector("#tooltip");
  const nextTooltip =
    typeof window !== "undefined" && typeof window.toolTipData === "string"
      ? window.toolTipData
      : toolTipData;

  if (!tooltip) {
    return;
  }

  tooltip.style.left = event.pageX + "px";
  tooltip.style.top = event.pageY + "px";
  tooltip.style.display = nextTooltip ? "block" : "none";
  tooltip.innerHTML = nextTooltip;
}

function ensureTooltipListener() {
  if (typeof document === "undefined" || tooltipListenerAttached) {
    return;
  }

  document.addEventListener("mousemove", updateTooltip, false);
  tooltipListenerAttached = true;
}

function clearRuntimeListeners() {
  runtimeListenerCleanup.forEach((unsubscribe) => {
    if (typeof unsubscribe === "function") {
      unsubscribe();
    }
  });
  runtimeListenerCleanup = [];
}

export function ApplicationRuntime() {
  const { loggedIn, setLoggedIn } = useAuthState();
  const router = useRouter();
  const pathname = usePathname();
  const runtimeRef = useRef({
    admin: false,
    loggedIn,
    router,
    setLoggedIn,
    username: "",
  });

  useEffect(() => {
    runtimeRef.current.loggedIn = loggedIn;
    runtimeRef.current.router = router;
    runtimeRef.current.setLoggedIn = setLoggedIn;
  }, [loggedIn, router, setLoggedIn]);

  useEffect(() => {
    if (pathname === "/ygopro" || runtimeInitialized) {
      return;
    }

    runtimeInitialized = true;
    ensureTooltipListener();

    const runtime = runtimeRef.current;

    function logOutAccount() {
      write({
        action: "irc_disconnect",
      });
      runtime.admin = false;
      runtime.loggedIn = false;
      runtime.username = "";
      runtime.setLoggedIn(false);
      setSession(false);
      window.localStorage.removeItem("remember");
      window.localStorage.removeItem("username");
      window.localStorage.removeItem("session");
      emit({ action: "LOAD_DECKS", decks: [] });
      emit({ action: "IRC_RESET" });
    }

    function logInAccount({ username, password }) {
      runtime.username = username;
      write({
        action: "listen",
        username,
        password,
      });
    }

    function ack() {
      if (!runtime.username) {
        return;
      }

      write({
        action: "ack",
        name: runtime.username,
      });
    }

    function lobby(roompass, password, port) {
      const numericPort = Number(port);
      const now = Date.now();

      if (
        Number.isFinite(numericPort) &&
        lastOpenedLobby.port === numericPort &&
        now - lastOpenedLobby.at < 3000
      ) {
        hostRequestPending = false;
        return;
      }

      if (password && runtime.admin !== false) {
        let guess = "";
        guess = window.prompt("Password?", guess);
        if (password !== guess) {
          userAlert("Wrong Password!");
          return;
        }
      }

      if (navigator.userAgent.toLowerCase().indexOf("firefox") > -1) {
        userAlert(
          "Firefox isnt supported at this time, please use Google Chrome.",
        );
        return;
      }

      if (window.Cypress) {
        window.__port = port;
        hostRequestPending = false;
        return;
      }

      lastOpenedLobby = {
        port: numericPort,
        at: now,
      };
      hostRequestPending = false;
      window.open("/ygopro?room=" + port);
    }

    function login(data) {
      if (runtime.loggedIn) {
        return;
      }

      if (data.error) {
        window.sessionStorage.removeItem("postLoginRedirect");
        userAlert(data.info.message);
        return;
      }

      const info = data.info || data.result;

      if (info.session && info.blocked) {
        return;
      }

      runtime.admin = info.admin;
      runtime.loggedIn = true;
      runtime.username = info.username;
      setSession(info.session);
      runtime.setLoggedIn(true);

      write({
        action: "load",
        username: info.username,
      });

      localStorage.session = info.session;
      localStorage.username = info.username;
      emit({ action: "LOAD_DECKS", decks: info.decks });
      emit({ action: "LOGIN_SUPER_HEADER" });
      emit({ action: "LOGGEDIN" });

      const redirectPath = window.sessionStorage.getItem("postLoginRedirect");
      if (redirectPath && redirectPath !== "/") {
        window.sessionStorage.removeItem("postLoginRedirect");
        runtime.router.replace(redirectPath);
      }
    }

    function onData(data) {
      if (data && data.type) {
        switch (data.type) {
          case "welcome":
          case "room_list":
          case "room_state":
            return;
          case "room_event":
            if (data.payload?.event === "chat") {
              emit({ action: "CHATLINE", data: data.payload });
            }
            return;
          case "error":
            userAlert(data.payload?.message || "Server error");
            return;
          default:
            return;
        }
      }

      switch (data.clientEvent) {
        case "ack":
          ack();
          break;
        case "gamelist":
          emit({ action: "GAME_LIST", ...data });
          break;
        case "global":
          break;
        case "lobby":
          lobby(data.roompass, data.password, data.port);
          break;
        case "irc_state":
          emit({ action: "IRC_STATE", ...data });
          break;
        case "irc_history":
          emit({
            action: "IRC_HISTORY",
            messages: Array.isArray(data.messages) ? data.messages : [],
          });
          break;
        case "irc_message":
          emit({ action: "IRC_MESSAGE", message: data.message });
          break;
        case "irc_error":
          emit({
            action: "IRC_ERROR",
            message: data.message || "Unable to reach chat.",
          });
          break;
        case "login":
          login(data);
          break;
        case "registrationRequest":
          return;
        case "savedDeck":
          if (data.error) {
            userAlert(data.error.message || data.error.error || "Failed to save deck");
            return;
          }
          userAlert("Saved Deck");
          emit({ action: "LOAD_DECKS", decks: data.savedDecks || [] });
          window.setTimeout(() => {
            closeModal();
          }, 1000);
          break;
        case "deletedDeck":
          userAlert("Deleted Deck");
          emit({ action: "LOAD_DECKS", decks: data.savedDecks || [] });
          window.setTimeout(() => {
            closeModal();
          }, 1000);
          break;
        default:
          return;
      }
    }

    async function validateStoredSession() {
      const storedSession = localStorage.session;

      if (!storedSession) {
        return;
      }

      try {
        const response = await fetch(`/api/session/${storedSession}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (payload?.success) {
          return;
        }

        if (payload?.error === "Invalid session") {
          emit({ action: "LOGOUT_ACCOUNT" });
        }
      } catch (error) {
        console.warn("Failed to validate stored session", error);
      }
    }

    if (!unloadHandlerAttached) {
      window.addEventListener("unload", () => {
        if (localStorage.remember === "true") {
          return;
        }
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("session");
      });
      unloadHandlerAttached = true;
    }

    clearRuntimeListeners();
    runtimeListenerCleanup = [
      on("LOGIN_ACCOUNT", logInAccount),
      on("LOGOUT_ACCOUNT", logOutAccount),
      on("TOOL_TIP", ({ data }) => {
        toolTipData = data;
      }),
      on("LOAD_SESSION", () => {
        setSession(localStorage.session);
        write({
          action: "loadSession",
          username: localStorage.username,
          session: localStorage.session,
        });
      }),
      on("HOST", ({ hostConfig }) => {
        if (hostRequestPending) {
          return;
        }

        hostRequestPending = true;
        write({
          action: "host",
          hostConfig,
        });
        userAlert("Requesting new game room...");
        window.setTimeout(() => {
          hostRequestPending = false;
          closeModal();
        }, 5000);
      }),
      on("DUEL", (action) => {
        lobby(action.roompass || action.key, action.password || action.locked, action.port);
      }),
      on("REQUEST_GAME_LIST", () => {
        write({
          action: "gamelistrequest",
        });
      }),
      on("SAVE_DECK", ({ deck }) => {
        write({
          action: "save",
          deck,
          session: localStorage.session,
          username: localStorage.username,
        });
      }),
      on("DELETE_DECK", ({ deck }) => {
        write({
          action: "delete",
          deck,
          session: localStorage.session,
          username: localStorage.username,
        });
      }),
    ];

    connect(onData);
    localStorage.imageURL =
      localStorage.imageURL || "https://images.ygoprodeck.com/images/cards";

    if (!sessionCheckInterval) {
      sessionCheckInterval = window.setInterval(
        validateStoredSession,
        SESSION_VALIDATION_INTERVAL_MS,
      );
    }

    window.setTimeout(() => {
      boot().catch((error) => {
        console.error("UI boot failed", error);
      });
    }, 0);
  }, [pathname]);

  return null;
}

export default function Application() {
  return (
    <main id="application">
      <LoginScreen />
    </main>
  );
}
