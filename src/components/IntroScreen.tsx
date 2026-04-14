"use client";

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 relative">
      {/* Content */}
      <div className="flex flex-col items-center gap-6 stagger max-w-md text-center">
        {/* Avatar */}
        <div className="animate-fade-in-up opacity-0" style={{ animationFillMode: "forwards" }}>
          <div className="w-20 h-20 rounded-full border-2 border-border shadow-sm overflow-hidden">
            <img
              src="/assets/yumi-avatar.png"
              alt="Yumi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Title */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <h1 className="text-3xl font-semibold tracking-tight">
            <span className="text-primary">Yumi&apos;s</span>{" "}
            <span className="text-foreground">Banner Studio</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>
          <p className="text-muted-foreground text-base leading-relaxed">
            AI와 대화하며 손쉽게 프로모션 배너를 만들어보세요.<br />
            매체 선택부터 이미지 생성까지 Yumi가 도와드립니다.
          </p>
        </div>

        {/* Feedback icons */}
        <div className="animate-fade-in-up opacity-0 flex items-center gap-4" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 14V2" /><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L14 22h0a3.13 3.13 0 0 1-3-3.88Z" />
            </svg>
          </button>
          <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all duration-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>

        {/* CTA Button */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
          <button
            onClick={onStart}
            className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-sm"
          >
            배너 만들기 시작
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
          <p className="text-muted-foreground text-sm">
            Powered by Twin Crew · Styled for LG
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 animate-bounce-gentle text-muted-foreground">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </div>
  );
}
