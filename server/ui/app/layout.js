"use client";
import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/normalize.scss";
import "../styles/main.scss";
import "../styles/roboto.scss";
import "../styles/animation.scss";
import "../styles/AlegreyaSans.scss";
import "../styles/PoiretOne.scss";
import { ApplicationRuntime } from "./index";
import SuperHeaderComponent from "../components/screens/superheader.component";
import SuperFooterComponent from "../components/screens/superfooter.component";
import { on } from "../hooks/use-listener";
import { AuthStateProvider, useAuthState } from "../hooks/use-auth-state";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Renders the Alert Modal component and returns the UI used by the app view.
 * @param {Object} modalProps The modalProps object supplies the structured input used by the app module, including the `isActive`, `message`, and `onClose` properties.
 * @param {boolean} modalProps.isActive The `isActive` property supplies structured input used by the app module.
 * @param {string} modalProps.message The `message` property supplies structured input used by the app module.
 * @param {Function} modalProps.onClose The `onClose` property supplies structured input used by the app module.
 * @returns {React.ReactNode} Returns the rendered UI used by the app view.
 */
function AlertModal({ isActive, message, onClose }) {
  if (!isActive) {
    return <></>;
  }

  return (
    <div id="lightbox">
      <p id="error">
        {message}
        <button id="modal-ok" onClick={onClose} type="button">
          OK
        </button>
      </p>
    </div>
  );
}

/**
 * Renders the Screen component and returns the UI used by the app view.
 * @param {Object} props The props object supplies the structured input used by the app module, including the `children` property.
 * @param {React.ReactNode} props.children The `children` property supplies structured input used by the app module.
 * @returns {React.ReactNode} Returns the rendered UI used by the app view.
 */
function Screen({ children }) {
  const [isModalActive, setModalModalActive] = useState(false),
    [modalMessage, setModalMessage] = useState("");
  const pathname = usePathname();
  const isPlaywrightRoute = pathname === "/playwright" || pathname.startsWith("/playwright/");

      /**
   * Executes the page title helper used by the app module.
   * @param {string} path The path value provides an input used by the app module.
   * @returns {string} Returns the value produced by the app module.
   */
  function pageTitle(path) {
    if (path === "/playwright" || path.startsWith("/playwright/")) {
      return "Component Lab";
    }
    if (path.startsWith("/news/")) {
      return "News Article";
    }
    if (path === "/tournaments/create") {
      return "Create Tournament";
    }
    if (path === "/calendar") {
      return "Tournament Calendar";
    }
    if (path === "/contact") {
      return "Contact";
    }
    if (path.startsWith("/tournaments/")) {
      return "Tournament";
    }

    const labels = {
      "/": "Home",
      "/chat": "Chat",
      "/credits": "Credits",
      "/calendar": "Tournament Calendar",
      "/contact": "Contact",
      "/deckedit": "Deck Edit",
      "/faqs": "FAQs",
      "/game": "Game",
      "/gamelist": "Game List",
      "/host": "Host",
      "/news": "News",
      "/rankings": "Rankings",
      "/replay": "Replay",
      "/profile": "Profile",
      "/settings": "Profile",
      "/tournaments": "Tournaments",
      "/ygopro": "YGOPro",
    };

    return labels[path] || "Page";
  }

  /**
   * Executes the alert helper used by the app module.
   * @param {Object} alertPayload The alertPayload object supplies the structured input used by the app module, including the `message` property.
   * @param {string} alertPayload.message The `message` property supplies structured input used by the app module.
   * @returns {void} Does not return a value.
   */
  function alert({ message }) {
    setModalModalActive(true);
    setModalMessage(message);
  }

      /**
   * Closes modal used by the app module.
   * @returns {void} Does not return a value.
   */
  function closeModal() {
    setModalModalActive(false);
    setModalMessage("");
  }

  on("ALERT", alert);
  on("CLOSE_ALERT", closeModal);

  useEffect(() => {
    document.title = `YGOSalvation | ${pageTitle(pathname)}`;
  }, [pathname]);

  return (
    <div key="screen-top">
      {(pathname === "/ygopro" || isPlaywrightRoute) ? children : <>
        <SuperHeaderComponent />
        <AuthGuard>{children}</AuthGuard>
        <SuperFooterComponent />
      </>}
      {isPlaywrightRoute ? null : <AlertModal isActive={isModalActive} message={modalMessage} onClose={closeModal} />}
    </div>
  );
}

/**
 * Executes the auth guard helper used by the app module.
 * @param {Object} guardProps The guardProps object supplies the structured input used by the app module, including the `children` property.
 * @param {React.ReactNode} guardProps.children The `children` property supplies structured input used by the app module.
 * @returns {(React.ReactNode|null)} Returns the value produced by the app module.
 */
function AuthGuard({ children }) {
  const { authResolved, loggedIn } = useAuthState();
  const pathname = usePathname();
  const router = useRouter();
  const isYGOProRoute = pathname === "/ygopro";
  const publicRoutes = new Set([
    "/",
    "/news",
    "/calendar",
    "/contact",
    "/rankings",
    "/tournaments",
    "/faqs",
    "/credits",
    "/ygopro",
    "/playwright",
    "/playwright/components",
  ]);
  const isPublicNewsRoute = pathname.startsWith("/news/");
  const isPublicPlaywrightRoute = pathname.startsWith("/playwright/");
  const isPublicRoute = publicRoutes.has(pathname) || isPublicNewsRoute || isPublicPlaywrightRoute;

  useEffect(() => {
    if (isYGOProRoute || !authResolved) {
      return;
    }
    if (!loggedIn && !isPublicRoute) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("postLoginRedirect", pathname);
      }
      router.replace("/");
    }
  }, [authResolved, isPublicRoute, isYGOProRoute, loggedIn, pathname, router]);

  if (isYGOProRoute) {
    return children;
  }

  if (!authResolved && !isPublicRoute) {
    return null;
  }

  if (authResolved && !loggedIn && !isPublicRoute) {
    return null;
  }
  return children;
}

/**
 * Renders the Root Layout component and returns the UI used by the app view.
 * @param {Object} props The props object supplies the structured input used by the app module, including the `children` property.
 * @param {React.ReactNode} props.children The `children` property supplies structured input used by the app module.
 * @returns {React.ReactNode} Returns the rendered UI used by the app view.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="YGOSalvation" />
        <meta name="apple-mobile-web-app-title" content="YGOSalvation" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="msapplication-TileImage" content="/favicon/mstile-150x150.png" />
        <link rel="icon" type="image/x-icon" href="/favicon/favicon.ico" />
        <link rel="shortcut icon" href="/favicon/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthStateProvider>
          <ApplicationRuntime />
          <Screen>{children}</Screen>
        </AuthStateProvider>
      </body>
    </html>
  );
}
