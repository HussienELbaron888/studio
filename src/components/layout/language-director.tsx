"use client";

import { useLanguage } from "@/context/language-context";
import { useEffect } from "react";

export function LanguageDirector() {
  const { language, direction } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  return null;
}
