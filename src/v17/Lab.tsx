import React from "react";
import { AbsoluteFill } from "remotion";
import { AnalyticsFunnel } from "@/components/remocn/analytics-funnel";
import { ChatGpt } from "@/components/remocn/chat-gpt";
import { CrashZoom } from "@/components/remocn/crash-zoom";
import { HookPunch } from "@/components/remocn/hook-punch";
import { ImpactShake } from "@/components/remocn/impact-shake";
import { PovSetup } from "@/components/remocn/pov-setup";
import { PromptToApp } from "@/components/remocn/prompt-to-app";
import { SpeedrunTimer } from "@/components/remocn/speedrun-timer";

// Scratch composition: raw Remocn components in the 1080x1920 frame (props.name picks one)
export const Lab17: React.FC<{ name: string }> = ({ name }) => (
  <AbsoluteFill style={{ background: "#fff" }}>
    {name === "hook" && <HookPunch theme="light" stop="Никто" scroll="не признает," lead="но твой стартап —" payoff="обертка." />}
    {name === "pov" && <PovSetup theme="light" setup="ты вайб-кодер и пишешь нейросети" lead="сделай" punch="Uber для котов." />}
    {name === "gpt" && <ChatGpt greeting="Чем помочь?" placeholder="Спросите что-нибудь" prompt="сделай Uber, но для котов" accentColor="#F0361C" />}
    {name === "app" && <PromptToApp prompt="сделай Uber, но для котов" projectName="uber-dlya-kotov" deployUrl="uber-koty.vercel.app" siteName="Котоберь" />}
    {name === "speed" && <SpeedrunTimer theme="light" category="Стартап · Any%" banner="Мировой рекорд" splits={[{ name: "Промпт", time: 20, pb: 60 }, { name: "Градиент", time: 90, pb: 120 }, { name: "Деплой", time: 240, pb: 600 }]} />}
    {name === "funnel" && <AnalyticsFunnel theme="light" title="Воронка" />}
    {name === "crash" && <CrashZoom theme="light" tease="Пользователей…" reveal="1." tagline="и это мама." />}
    {name === "impact" && <ImpactShake text="ОБЕРТКА" backgroundColor="#FFFFFF" foregroundColor="#16161A" />}
  </AbsoluteFill>
);
