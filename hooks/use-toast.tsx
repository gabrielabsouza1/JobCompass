"use client";

import { useState } from "react";

export function useToast() {
  const [toastMessage, setToastMessage] = useState("");

  function showToast(message: string) {
    setToastMessage(message);

    window.setTimeout(() => {
      setToastMessage("");
    }, 2500);
  }

  return {
    toastMessage,
    showToast,
  };
}