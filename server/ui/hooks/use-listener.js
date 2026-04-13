"use client";

import { useEffect, useRef } from "react";
import {
  emit as emitEvent,
  on as onEvent,
  subscribe as subscribeEvent,
} from "../services/listener.service";

function useLatestHandler(handler) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  return handlerRef;
}

export function on(action, handler) {
  const handlerRef = useLatestHandler(handler);

  useEffect(() => {
    if (!action) {
      return undefined;
    }

    return onEvent(action, (event, state) => {
      if (typeof handlerRef.current === "function") {
        handlerRef.current(event, state);
      }
    });
  }, [action, handlerRef]);
}

export function subscribe(action, handler) {
  const handlerRef = useLatestHandler(handler);

  useEffect(() => {
    if (!action) {
      return undefined;
    }

    return subscribeEvent(action, (event) => {
      if (typeof handlerRef.current === "function") {
        handlerRef.current(event);
      }
    });
  }, [action, handlerRef]);
}

export function emit() {
  return emitEvent;
}
