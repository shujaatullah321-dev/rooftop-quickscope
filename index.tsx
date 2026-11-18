import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import lisaanCss from "../lisaan.css?url";
import { AccountPanel } from "@/components/AccountPanel";
import logoAsset from "@/assets/lisaan-conversation-logo.png.asset.json";

// Original app markup; the vanilla script in /lisaan.js renders into #main.
const MARKUP = "<header class=\"top\"><div class=\"wrap\">\n  <div class=\"row\">\n    <div class=\"brand\"><span>Lisaan Ul Arab <small>Easy Arabic Learning</small></span><span class=\"ar\" lang=\"ar\">\u0644\u0650\u0633\u064e\u0627\u0646\u064f \u0627\u0644\u0652\u0639\u064e\u0631\u064e\u0628\u0650</span></div>\n    <div class=\"lvl\" id=\"lvl\" title=\"Your level\"><b id=\"lvlName\">Beginner</b><span class=\"lvlbar\"><i id=\"lvlFill\"></i></span></div><span class=\"pill goal\" id=\"goal\" title=\"Today's goal\">\ud83c\udfaf 0/30</span><span class=\"pill\" id=\"streak\" title=\"Days in a row\">\ud83d\udd25 0</span>\n    <span class=\"pill\" id=\"xp\">\u2b50 0 XP</span><button class=\"acct\" id=\"acctBtn\" aria-label=\"Your account\">\ud83d\udc64 <span id=\"acctLbl\">Sign in</span></button><button class=\"snd\" id=\"snd\" aria-label=\"Toggle sound effects\" title=\"Sound effects\">\ud83d\udd0a</button>\n  </div>\n  <nav aria-label=\"Sections\">\n    <a href=\"#learn\" data-v=\"learn\"><span class=\"ni\" aria-hidden=\"true\">\ud83d\udcd6</span>Lessons</a>\n    <a href=\"#grammar\" data-v=\"grammar\"><span class=\"ni\" aria-hidden=\"true\">\u270d\ufe0f</span>Grammar</a>\n    <a href=\"#vocab\" data-v=\"vocab\"><span class=\"ni\" aria-hidden=\"true\">\ud83e\udde0</span>Vocab trainer</a>\n    <a href=\"#levels\" data-v=\"levels\"><span class=\"ni\" aria-hidden=\"true\">\ud83d\udcf6</span>Levels</a>\n    <a href=\"#words\" data-v=\"words\"><span class=\"ni\" aria-hidden=\"true\">\ud83d\uddc2\ufe0f</span>Words</a>\n    <a href=\"#quiz\" data-v=\"quiz\"><span class=\"ni\" aria-hidden=\"true\">\ud83c\udfaf</span>Quiz</a>\n    <a href=\"#kids\" data-v=\"kids\"><span class=\"ni\" aria-hidden=\"true\">\ud83e\uddf8</span class=\"kid\">Kids zone</a>\n    <a href=\"#library\" data-v=\"library\"><span class=\"ni\" aria-hidden=\"true\">\ud83d\udcda</span>Books and links</a>\n    <a href=\"#rewards\" data-v=\"rewards\"><span class=\"ni\" aria-hidden=\"true\">\ud83c\udfc6</span>Rewards</a>\n    <a href=\"#progress\" data-v=\"progress\"><span class=\"ni\" aria-hidden=\"true\">\ud83d\udcca</span>My progress</a>\n  </nav>\n</div></header>\n<main class=\"wrap\" id=\"main\"></main>\n<div id=\"toast\" role=\"status\"></div>\n\n";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Lisaan Ul Arab — Easy Arabic Learning" },
      { name: "description", content: "Learn Arabic with lessons, 1,600+ words, grammar practice, a smart vocabulary trainer, quizzes, a kids zone and your own saved progress." },
      { property: "og:title", content: "Lisaan Ul Arab — Easy Arabic Learning" },
      { property: "og:description", content: "Learn Arabic with lessons, 1,600+ words, grammar practice, a smart vocabulary trainer, quizzes, a kids zone and your own saved progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;800&family=Noto+Naskh+Arabic:wght@500;700&family=Nunito:wght@400;600;800&display=swap" },
      { rel: "stylesheet", href: lisaanCss },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    const w = window as unknown as { __lisaanLoaded?: boolean };
    if (w.__lisaanLoaded) return;
    w.__lisaanLoaded = true;
    const s = document.createElement("script");
    s.src = "/lisaan.js";
    document.body.appendChild(s);
  }, []);
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: MARKUP.replace('<div class="brand">', `<div class="brand"><img class="brand-logo" src="${logoAsset.url}" alt="" width="48" height="48" />`) }} />
      <AccountPanel />
    </>
  );
}
