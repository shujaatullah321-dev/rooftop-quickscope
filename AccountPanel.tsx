import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { notifyNewSignup } from "@/lib/signup-alerts.functions";

type Sync = {
  get: () => Record<string, unknown>;
  merge: (d: unknown) => void;
  reset?: () => void;
  owner?: () => string;
  setOwner?: (id: string) => void;
};
type LisaanUser = { email?: string | undefined; name?: string | undefined } | null;
declare global {
  interface Window {
    LisaanSync?: Sync;
    LisaanUser?: LisaanUser;
  }
}

const GoogleG = () => (
  <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.140 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.240 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

async function waitSync(): Promise<Sync> {
  for (let i = 0; i < 100 && !window.LisaanSync; i++) await new Promise((r) => setTimeout(r, 100));
  if (!window.LisaanSync) throw new Error("App not ready");
  return window.LisaanSync;
}

export function AccountPanel() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [synced, setSynced] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Header button opens the panel
  useEffect(() => {
    const b = document.getElementById("acctBtn");
    const fn = () => setOpen(true);
    b?.addEventListener("click", fn);
    return () => b?.removeEventListener("click", fn);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED" || event === "INITIAL_SESSION")
        setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const lbl = document.getElementById("acctLbl");
    const name = (user?.user_metadata?.["full_name"] as string | undefined) || (user?.user_metadata?.["name"] as string | undefined);
    if (lbl) lbl.textContent = user ? (name || (user.email ?? "Account").split("@")[0] || "Account") : "Sign in";
    // Tell the learning app who is signed in (used by the My progress page)
    window.LisaanUser = user ? { email: user.email ?? undefined, name: name || undefined } : null;
    window.dispatchEvent(new Event("lisaan:user"));
  }, [user]);

  // On sign-in: merge cloud progress into this device, then upload the merged result
  useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      const sync = await waitSync();
      // Each person keeps their own progress: if this device holds someone else's
      // progress, clear it before loading this account.
      const owner = sync.owner?.() ?? "";
      if (owner && owner !== user.id) sync.reset?.();
      const { data } = await supabase.from("progress").select("data").eq("user_id", user.id).maybeSingle();
      if (!alive) return;
      if (!data) {
        try {
          await notifyNewSignup();
        } catch {
          // Sign-in and progress saving must continue while email is unavailable.
        }
      }
      if (!alive) return;
      if (data?.data) sync.merge(data.data);
      sync.setOwner?.(user.id);
      await upload(user.id, sync);
    })().catch(() => setSynced("Could not load saved progress"));
    const onSave = () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => window.LisaanSync && upload(user.id, window.LisaanSync), 1500);
    };
    window.addEventListener("lisaan:save", onSave);
    return () => {
      alive = false;
      window.removeEventListener("lisaan:save", onSave);
    };
  }, [user]);

  async function upload(uid: string, sync: Sync) {
    const { error } = await supabase
      .from("progress")
      .upsert({ user_id: uid, data: sync.get() as never, updated_at: new Date().toISOString() });
    setSynced(error ? "Saving failed, will retry" : "Progress saved to your account");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Check your email to confirm your account, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) setMsg(error.message);
    }
    setBusy(false);
  }

  async function social(p: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin });
    if (r.error) setMsg(r.error.message ?? "Sign-in failed");
  }

  async function signOut() {
    await supabase.auth.signOut();
    // Progress is safe in the account; clear this device so the next person starts fresh.
    window.LisaanSync?.reset?.();
    setSynced("");
  }

  if (!open) return null;
  const p = window.LisaanSync?.get() as
    | { xp?: number; days?: string[]; done?: Record<string, number>; vb?: Record<string, number[]>; gram?: Record<string, { b?: number }> }
    | undefined;
  const words = Object.values(p?.vb ?? {}).filter((e) => (e?.[0] ?? 0) > 0).length;
  const lessons = Object.keys(p?.done ?? {}).length;
  const mastered = Object.values(p?.gram ?? {}).filter((g) => (g?.b ?? 0) >= 90).length;
  return (
    <div className="acct-overlay" role="dialog" aria-modal="true" aria-label="Account" onClick={() => setOpen(false)}>
      <div className="panel acct-panel" onClick={(e) => e.stopPropagation()}>
        <button className="x acct-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
        {user ? (
          <>
            <h2>My progress</h2>
            <p className="note">Signed in as <b>{user.email}</b></p>
            <div className="acct-stats">
              <div><b>{p?.xp ?? 0}</b><span>XP</span></div>
              <div><b>{p?.days?.length ?? 0}</b><span>days learned</span></div>
              <div><b>{lessons}</b><span>lessons done</span></div>
              <div><b>{words}</b><span>words learned</span></div>
              <div><b>{mastered}</b><span>grammar topics mastered</span></div>
            </div>
            <p className="note">{synced || "Syncing…"} Your progress follows you on any device you sign in on.</p>
            <div className="btnrow">
              <button className="btn primary" onClick={() => { setOpen(false); window.location.hash = "progress"; }}>See my full progress</button>
              <button className="btn" onClick={signOut}>Sign out</button>
            </div>
          </>
        ) : (
          <>
            <h2>{mode === "in" ? "Sign in" : "Create account"}</h2>
            <p className="note">Get your own account: your lessons, words and grammar progress are saved to it and follow you to any device. Only you see your progress.</p>
            <div className="acct-social">
              <button type="button" className="gbtn" onClick={() => social("google")}><GoogleG />Continue with Google</button>
              <button type="button" className="btn" onClick={() => social("lovable")}><LovableMark />Continue with Lovable</button>
            </div>
            <div className="acct-or"><span>or</span></div>
            <form className="vform" onSubmit={submit}>
              <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
              <label>Password<input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></label>
              {msg && <p className="acct-msg">{msg}</p>}
              <button className="btn primary" disabled={busy}>{busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}</button>
            </form>
            <p className="note" style={{ marginTop: 12 }}>
              {mode === "in" ? "New here? " : "Have an account? "}
              <button type="button" className="linkbtn" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
                {mode === "in" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
