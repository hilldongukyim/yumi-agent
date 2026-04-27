"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { buildZipSync, dataUrlToUint8Array } from "@/lib/zipSync";
import BannerRenderer, { type BannerConfig } from "./BannerRenderer";

interface PreviewImage {
  url: string;
  label: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  bannerUrls?: string[];
  bannerNames?: string[];
  previewImages?: PreviewImage[];
}

const STEPS = ["매체 선택", "사이즈", "헤드라인", "이미지", "생성"];

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "안녕하세요! 저는 배너 제작 에이전트 **Yumi**입니다.\n\n프로모션 배너를 만들어 드릴게요. 어떤 매체의 배너가 필요하신가요?\n\n**1. DV360** — Display & Video 360\n**2. Social** — Facebook, Instagram 등\n**3. Criteo** — 리타겟팅 광고\n**4. Email** — 이메일 마케팅",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [pendingBanners, setPendingBanners] = useState<BannerConfig[] | null>(null);
  const [pendingMessage, setPendingMessage] = useState("");
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const [zipBlobUrls, setZipBlobUrls] = useState<Record<number, string>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

  // Estimate current step from message count
  useEffect(() => {
    const userMsgCount = messages.filter((m) => m.role === "user").length;
    setCurrentStep(Math.min(userMsgCount, STEPS.length - 1));
  }, [messages]);

  // Pre-generate ZIP blobs for messages with banners (runs synchronously so blob URL is ready before user clicks)
  useEffect(() => {
    messages.forEach((msg, idx) => {
      if (msg.bannerUrls && msg.bannerUrls.length > 0 && !zipBlobUrls[idx]) {
        try {
          const files = msg.bannerUrls.map((url, i) => ({
            name: `${msg.bannerNames?.[i] || `banner-${i + 1}`}.png`,
            data: dataUrlToUint8Array(url),
          }));
          const blob = buildZipSync(files);
          const blobUrl = URL.createObjectURL(blob);
          setZipBlobUrls((prev) => ({ ...prev, [idx]: blobUrl }));
        } catch (e) {
          console.error("ZIP generation error:", e);
        }
      }
    });
  }, [messages]);

  const handleBannersRendered = useCallback(
    (results: { name: string; dataUrl: string }[]) => {
      const assistantMsg: Message = {
        role: "assistant",
        content:
          pendingMessage ||
          `배너 ${results.length}개가 생성되었습니다!\n\n아래에서 확인하고 다운로드해주세요. 수정이 필요하면 말씀해주세요.`,
        bannerUrls: results.map((r) => r.dataUrl),
        bannerNames: results.map((r) => r.name),
      };
      setMessages([...pendingMessages, assistantMsg]);
      setPendingBanners(null);
      setPendingMessage("");
      setPendingMessages([]);
      setIsLoading(false);
    },
    [pendingMessage, pendingMessages]
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();

      if (data.banners && data.banners.length > 0) {
        setPendingBanners(data.banners);
        setPendingMessage(data.message);
        setPendingMessages(newMessages);
        
        // Push the confirmed content to Figma via the new API wrapper.
        // It runs asynchronously. The Relay Server handles the rest.
        if (data.figmaPayload) {
          fetch("/api/figma-update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data.figmaPayload),
          }).catch((err) => console.error("Figma auto-update failed:", err));
        }

        return;
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.message,
        previewImages: data.previewImages,
      };
      setMessages([...newMessages, assistantMsg]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요." },
      ]);
    } finally {
      if (!pendingBanners) setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };



  return (
    <div className="flex flex-col h-full animate-fade-in-up">
      {/* Hidden banner renderer */}
      {pendingBanners && (
        <BannerRenderer banners={pendingBanners} onRendered={handleBannersRendered} />
      )}

      {/* Fixed Nav — Anita style */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-2">
            <img src="/assets/lg-logo-white.png" alt="LG" className="h-7 w-auto invert opacity-80" />
          </div>

          {/* Center: Step dots */}
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentStep
                    ? "bg-primary scale-125"
                    : i < currentStep
                      ? "bg-muted-foreground/60"
                      : "bg-muted"
                }`}
                title={STEPS[i]}
              />
            ))}
          </div>

          {/* Right: Agent name */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full overflow-hidden border border-border">
              <img src="/assets/yumi-avatar.png" alt="Yumi" className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-semibold text-foreground">Yumi</span>
          </div>
        </div>
      </nav>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto chat-scroll pt-18 pb-24">
        {/* Agent intro at top */}
        <div className="flex flex-col items-center pt-8 pb-6 px-6">
          <div className="w-14 h-14 rounded-full border-2 border-border shadow-sm overflow-hidden mb-3">
            <img src="/assets/yumi-avatar.png" alt="Yumi" className="w-full h-full object-cover" />
          </div>
          <p className="text-muted-foreground text-sm text-center">
            Yumi가 배너 제작을 도와드립니다
          </p>
        </div>

        {/* Messages */}
        <div className="max-w-3xl mx-auto px-6 space-y-4">
          {messages.map((msg, msgIdx) => (
            <div
              key={msgIdx}
              className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 mr-2 mt-1">
                  <img src="/assets/yumi-avatar.png" alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card text-card-foreground border border-border rounded-bl-sm"
                }`}
              >
                <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />

                {/* Image previews (product/lifestyle) */}
                {msg.previewImages && msg.previewImages.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.previewImages.map((img, j) => (
                      <div key={j} className="rounded-xl overflow-hidden border border-border bg-surface">
                        <img
                          src={img.url}
                          alt={img.label}
                          className="w-full max-h-64 object-contain bg-white"
                        />
                        <div className="px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                          <span>{img.label}</span>
                          <a
                            href={img.url}
                            download={`${img.label}.png`}
                            className="text-primary hover:underline"
                          >
                            다운로드
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {msg.bannerUrls && msg.bannerUrls.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {msg.bannerUrls.length}개 배너 생성됨
                      </span>
                      {zipBlobUrls[msgIdx] ? (
                        <a
                          href={zipBlobUrls[msgIdx]}
                          download="yumi-banners.zip"
                          className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full hover:bg-primary/90 transition-colors"
                        >
                          전체 다운로드
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground px-3 py-1">준비 중...</span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
                      {msg.bannerUrls.map((url, j) => (
                        <div
                          key={j}
                          className="relative group border border-border rounded-xl overflow-hidden bg-surface"
                        >
                          <img
                            src={url}
                            alt={msg.bannerNames?.[j] || `Banner ${j + 1}`}
                            className="w-full h-auto object-contain"
                          />
                          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors duration-200 flex items-center justify-center">
                            <a
                              href={url}
                              download={`${msg.bannerNames?.[j] || `banner-${j + 1}`}.png`}
                              className="opacity-0 group-hover:opacity-100 text-xs bg-card text-card-foreground px-3 py-1.5 rounded-full font-medium transition-opacity duration-200"
                            >
                              {msg.bannerNames?.[j] || `${j + 1}`}
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start message-enter">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-border flex-shrink-0 mr-2 mt-1">
                <img src="/assets/yumi-avatar.png" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                    <span className="typing-dot w-2 h-2 bg-muted-foreground rounded-full" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pendingBanners ? "배너 렌더링 중..." : "Yumi가 작업 중..."}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input — fixed bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요..."
              rows={1}
              disabled={isLoading}
              className="flex-1 resize-none rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition-all duration-200"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="h-11 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMessage(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
}
