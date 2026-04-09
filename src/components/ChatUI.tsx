"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import BannerRenderer from "./BannerRenderer";

interface BannerConfig {
  name: string;
  width: number;
  height: number;
  layout: string;
  hasSubcopy: boolean;
  hasCTA: boolean;
  headline: string;
  subcopy?: string;
  ctaText?: string;
  productImageUrl?: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  bannerUrls?: string[];
  bannerNames?: string[];
}

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
  const [pendingBanners, setPendingBanners] = useState<BannerConfig[] | null>(null);
  const [pendingMessage, setPendingMessage] = useState<string>("");
  const [pendingMessages, setPendingMessages] = useState<Message[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) inputRef.current?.focus();
  }, [isLoading]);

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

      // If banners were generated, render them client-side
      if (data.banners && data.banners.length > 0) {
        setPendingBanners(data.banners);
        setPendingMessage(data.message);
        setPendingMessages(newMessages);
        // Loading continues until banners are rendered
        return;
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.message,
      };
      setMessages([...newMessages, assistantMsg]);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.",
        },
      ]);
    } finally {
      if (!pendingBanners) {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadAll = (urls: string[], names: string[]) => {
    urls.forEach((url, i) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = `${names[i] || `banner-${i + 1}`}.png`;
      a.click();
    });
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      {/* Client-side banner renderer (hidden) */}
      {pendingBanners && (
        <BannerRenderer
          banners={pendingBanners}
          onRendered={handleBannersRendered}
        />
      )}

      {/* Header */}
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white">
        <div className="w-10 h-10 rounded-full bg-[#a50034] flex items-center justify-center text-white font-bold text-lg">
          Y
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Yumi</h1>
          <p className="text-xs text-gray-500">LG Banner Creation Agent</p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto chat-scroll px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#a50034] text-white rounded-br-sm"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm"
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: formatMessage(msg.content),
                }}
              />
              {msg.bannerUrls && msg.bannerUrls.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">
                      {msg.bannerUrls.length}개 배너 생성됨
                    </span>
                    <button
                      onClick={() =>
                        downloadAll(msg.bannerUrls!, msg.bannerNames || [])
                      }
                      className="text-xs bg-[#a50034] text-white px-3 py-1 rounded-full hover:bg-[#8a002b] transition-colors"
                    >
                      전체 다운로드
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-[500px] overflow-y-auto">
                    {msg.bannerUrls.map((url, j) => (
                      <div
                        key={j}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
                      >
                        <img
                          src={url}
                          alt={msg.bannerNames?.[j] || `Banner ${j + 1}`}
                          className="w-full h-auto object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                          <a
                            href={url}
                            download={`${msg.bannerNames?.[j] || `banner-${j + 1}`}.png`}
                            className="opacity-0 group-hover:opacity-100 text-xs bg-white text-gray-800 px-3 py-1.5 rounded-full font-medium transition-opacity"
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
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                  <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
                </div>
                <span className="text-xs text-gray-400">
                  {pendingBanners ? "배너 렌더링 중..." : "Yumi가 작업 중..."}
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="메시지를 입력하세요..."
            rows={1}
            disabled={isLoading}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-[#a50034] focus:ring-1 focus:ring-[#a50034] disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="h-11 px-5 rounded-xl bg-[#a50034] text-white text-sm font-medium hover:bg-[#8a002b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            전송
          </button>
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
