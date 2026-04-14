"use client";

import { useState } from "react";
import IntroScreen from "@/components/IntroScreen";
import ChatUI from "@/components/ChatUI";

export default function Home() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <IntroScreen onStart={() => setStarted(true)} />;
  }

  return <ChatUI />;
}
