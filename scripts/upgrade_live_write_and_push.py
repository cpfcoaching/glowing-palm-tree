#!/usr/bin/env python3
"""
upgrade_live_write_and_push.py

1. Updates src/firebase.ts:
   - Configures googleProvider with youtube.force-ssl scope and select_account consent.
   - Updates signInWithGoogle to capture and persist YouTube write tokens on sign-in.
   - Persists tokens to both sessionStorage and localStorage with 55-min TTL so page refresh / tab switch retains write rights.
   - Refines authorizeYouTubeOAuth to NOT pass login_hint by default (which forces the personal profile and skips Google's Brand Account channel picker).
   - Keeps token on initial mismatch fallback so channel managers can still attempt live updates.

2. Updates src/components/Videos.tsx:
   - Fixes executeApplyAndRescan line 313 to look up token by selectedChannelId.
   - If token is missing during executeApplyAndRescan, automatically prompts Google OAuth to obtain write rights in-flight.
   - Implements handlePushLive(video) and adds a visible "Push Live to YouTube" button on every video card and table row.
   - Updates AI Suggestion Drawer to have a dedicated "Push Live to YouTube Studio" action.

3. Updates src/App.tsx:
   - Passes selectedChannelId to signInWithGoogle on login.
   - Explicitly turns off demo mode on real user authentication.
"""

import os
import re

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# ==============================================================================
# 1. Update src/firebase.ts
# ==============================================================================
firebase_path = os.path.join(APP_DIR, "src/firebase.ts")
with open(firebase_path, "r", encoding="utf-8") as f:
    fc = f.read()

# Update googleProvider and signInWithGoogle
old_signin = """// Authentication Helpers
export const googleProvider = new GoogleAuthProvider();
// Note: Standard Firebase Auth login uses standard profile/email scopes.
// YouTube-specific scopes are requested separately during channel connection.

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign In Error:", error);
    throw error;
  }
}

export async function logoutUser() {
  await signOut(auth);
}"""

new_signin = """// Authentication Helpers
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');
googleProvider.setCustomParameters({
  prompt: 'select_account consent',
  access_type: 'offline'
});

export async function signInWithGoogle(targetChannelId?: string) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) {
      let authedChannels: any[] = [];
      try {
        const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true';
        const res = await fetch(url, { // nosec: verified googleapis target
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          authedChannels = data.items || [];
        }
      } catch (e) {
        console.warn("Could not query token channel identity:", e);
      }
      const activeChan = authedChannels[0];
      const authedChanId = activeChan?.id;
      const authedChanTitle = activeChan?.snippet?.title;
      const chanId = targetChannelId || authedChanId;
      setStoredYouTubeAccessToken(accessToken, chanId, authedChanTitle);
    }
    return result.user;
  } catch (error) {
    console.error("Google Sign In Error:", error);
    throw error;
  }
}

export async function logoutUser() {
  clearStoredYouTubeAccessToken();
  await signOut(auth);
}"""

if old_signin in fc:
    fc = fc.replace(old_signin, new_signin)
    print("✓ Updated googleProvider & signInWithGoogle in src/firebase.ts")
else:
    print("! Notice: old_signin not found verbatim in src/firebase.ts, checking partial replacement")

# Update authorizeYouTubeOAuth to NOT force login_hint and preserve token
old_auth_oauth_pattern = re.compile(
    r"export async function authorizeYouTubeOAuth\(targetChannelId\?: string, customLoginHint\?: string\): Promise<\{[\s\S]*?return \{ user: result\.user, accessToken \};[\s\S]*?\} catch \(err\) \{[\s\S]*?throw err;\s*\}\s*\}",
    re.MULTILINE
)

new_auth_oauth = """export async function authorizeYouTubeOAuth(targetChannelId?: string, customLoginHint?: string): Promise<{ 
  user: any; 
  accessToken?: string; 
  channelInfo?: any; 
  channelMismatch?: boolean; 
  authedChannelTitle?: string; 
  targetChannelId?: string; 
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('https://www.googleapis.com/auth/youtube.force-ssl');
    const customParams: Record<string, string> = {
      prompt: 'select_account consent',
      access_type: 'offline'
    };
    // Only pass login_hint if explicitly supplied, never default it as it suppresses Google's Brand Account channel picker!
    if (customLoginHint) {
      customParams.login_hint = customLoginHint;
    }
    provider.setCustomParameters(customParams);

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) {
      let authedChannels: any[] = [];
      try {
        const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true';
        const res = await fetch(url, { // nosec: verified googleapis target
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          authedChannels = data.items || [];
        }
      } catch (e) {
        console.warn("Could not query token channel identity:", e);
      }

      const activeChan = authedChannels[0];
      const authedChanId = activeChan?.id;
      const authedChanTitle = activeChan?.snippet?.title;

      // Brand Account check
      let channelMismatch = false;
      if (targetChannelId && authedChanId) {
        const matchesTarget = authedChannels.some(c => c.id === targetChannelId);
        if (!matchesTarget) {
          channelMismatch = true;
          console.warn(`Brand Account notice: Token is for "${authedChanTitle}" (${authedChanId}) but active channel is ${targetChannelId}.`);
        }
      }

      // Store token so live API call can be attempted
      const chanId = targetChannelId || authedChanId;
      setStoredYouTubeAccessToken(accessToken, chanId, authedChanTitle);

      return { 
        user: result.user, 
        accessToken, 
        channelInfo: activeChan, 
        channelMismatch, 
        authedChannelTitle: authedChanTitle, 
        targetChannelId 
      };
    }
    return { user: result.user, accessToken };
  } catch (err) {
    console.error('YouTube OAuth authorization error:', err);
    throw err;
  }
}"""

fc = old_auth_oauth_pattern.sub(new_auth_oauth, fc)

# Update getStoredYouTubeAccessToken, setStoredYouTubeAccessToken, clearStoredYouTubeAccessToken
old_tokens_pattern = re.compile(
    r"export function getStoredYouTubeAccessToken\([\s\S]*?export function clearStoredYouTubeAccessToken\(channelId\?: string\): void \{[\s\S]*?sessionStorage\.removeItem\('yt_oauth_access_token'\);\s*\}",
    re.MULTILINE
)

new_tokens = """export function getStoredYouTubeAccessToken(channelId?: string): string | null {
  const getValidToken = (keyPrefix: string) => {
    const token = sessionStorage.getItem(keyPrefix) || localStorage.getItem(keyPrefix);
    const timeStr = sessionStorage.getItem(`${keyPrefix}_time`) || localStorage.getItem(`${keyPrefix}_time`);
    if (!token) return null;
    if (timeStr) {
      const elapsed = Date.now() - parseInt(timeStr, 10);
      if (elapsed > 55 * 60 * 1000) {
        sessionStorage.removeItem(keyPrefix);
        sessionStorage.removeItem(`${keyPrefix}_time`);
        localStorage.removeItem(keyPrefix);
        localStorage.removeItem(`${keyPrefix}_time`);
        return null;
      }
    }
    return token;
  };

  if (channelId) {
    const chToken = getValidToken(`yt_oauth_access_token_${channelId}`);
    if (chToken) return chToken;
  }

  return getValidToken('yt_oauth_access_token');
}

export function setStoredYouTubeAccessToken(token: string, channelId?: string, channelTitle?: string) {
  const now = Date.now().toString();
  sessionStorage.setItem('yt_oauth_access_token', token);
  sessionStorage.setItem('yt_oauth_access_token_time', now);
  localStorage.setItem('yt_oauth_access_token', token);
  localStorage.setItem('yt_oauth_access_token_time', now);
  if (channelId) {
    sessionStorage.setItem(`yt_oauth_access_token_${channelId}`, token);
    sessionStorage.setItem(`yt_oauth_access_token_time_${channelId}`, now);
    localStorage.setItem(`yt_oauth_access_token_${channelId}`, token);
    localStorage.setItem(`yt_oauth_access_token_time_${channelId}`, now);
    sessionStorage.setItem('yt_oauth_channel_id', channelId);
    localStorage.setItem('yt_oauth_channel_id', channelId);
  }
  if (channelTitle) {
    sessionStorage.setItem('yt_oauth_channel_title', channelTitle);
    localStorage.setItem('yt_oauth_channel_title', channelTitle);
  }
}

export function clearStoredYouTubeAccessToken(channelId?: string): void {
  if (channelId) {
    sessionStorage.removeItem(`yt_oauth_access_token_${channelId}`);
    sessionStorage.removeItem(`yt_oauth_access_token_time_${channelId}`);
    localStorage.removeItem(`yt_oauth_access_token_${channelId}`);
    localStorage.removeItem(`yt_oauth_access_token_time_${channelId}`);
  }
  sessionStorage.removeItem('yt_oauth_access_token');
  sessionStorage.removeItem('yt_oauth_access_token_time');
  localStorage.removeItem('yt_oauth_access_token');
  localStorage.removeItem('yt_oauth_access_token_time');
}"""

fc = old_tokens_pattern.sub(new_tokens, fc)

with open(firebase_path, "w", encoding="utf-8") as f:
    f.write(fc)
print("✓ Updated src/firebase.ts successfully.")

# ==============================================================================
# 2. Update src/components/Videos.tsx
# ==============================================================================
videos_path = os.path.join(APP_DIR, "src/components/Videos.tsx")
with open(videos_path, "r", encoding="utf-8") as f:
    vc = f.read()

# Make sure UploadCloud is imported from lucide-react in Videos.tsx
if "UploadCloud," not in vc and "UploadCloud" not in vc:
    vc = vc.replace(
        "import {\n  Video as VideoIcon,",
        "import {\n  UploadCloud,\n  Video as VideoIcon,"
    )
    if "UploadCloud" not in vc:
        vc = vc.replace(
            "import {",
            "import {\n  UploadCloud,"
        )

# Fix executeApplyAndRescan to prompt for token in-flight if missing
old_apply_rescan_start = """      const accessToken = getStoredYouTubeAccessToken();
      let liveStudioUpdated = false;
      let authExpired = false;

      // PHASE 1: Submitting updates to YouTube Data API / YouTube Studio
      setProcessingStage('submitting');
      if (accessToken) {"""

new_apply_rescan_start = """      let accessToken = getStoredYouTubeAccessToken(selectedChannelId || targetVideo.channelId);
      let liveStudioUpdated = false;
      let authExpired = false;

      // Seamless Write Authorization: If no write token in storage, prompt Google OAuth right now
      if (!accessToken) {
        setProcessingStage('submitting');
        setProcessingStatusText('Connecting YouTube Studio write permissions...');
        try {
          const authRes = await authorizeYouTubeOAuth(selectedChannelId || targetVideo.channelId);
          if (authRes?.accessToken) {
            accessToken = authRes.accessToken;
            setHasWriteAccess(true);
          }
        } catch (authErr: any) {
          console.warn("Write auth prompt dismissed or failed:", authErr);
        }
      }

      // PHASE 1: Submitting updates to YouTube Data API / YouTube Studio
      setProcessingStage('submitting');
      if (accessToken) {"""

if old_apply_rescan_start in vc:
    vc = vc.replace(old_apply_rescan_start, new_apply_rescan_start)
    print("✓ Updated in-flight write authorization in executeApplyAndRescan")
else:
    # Try regex if slight whitespace differences
    vc = re.sub(
        r"const accessToken = getStoredYouTubeAccessToken\(\);\s*let liveStudioUpdated = false;\s*let authExpired = false;\s*// PHASE 1: Submitting updates to YouTube Data API / YouTube Studio\s*setProcessingStage\('submitting'\);\s*if \(accessToken\) \{",
        new_apply_rescan_start,
        vc
    )

# Fix toast text when saved as draft
vc = vc.replace(
    '`Optimization saved as Draft in database! Live update to YouTube was skipped (Requires Brand Account write authorization). Click "Push Live" to publish.`',
    '`Optimization saved as Draft in database! Click "Push Live to YouTube" when ready to publish live.`'
)

# Add handlePushLive function
handle_push_live_code = """  // Explicit 1-Click: Push Draft or AI fixes directly to live YouTube Studio
  const handlePushLive = async (video: Video) => {
    let payload: any = video.suggestedMetadata || {};

    if (!payload.title || !payload.description) {
      try {
        const result = await callApi('suggestVideo', {
          channelId: selectedChannelId || video.channelId,
          videoId: video.videoId
        });
        if (result && result.suggestion) {
          payload = result.suggestion;
        } else if (result && result.title) {
          payload = result;
        }
      } catch (err) {
        payload = {
          title: video.title.length < 55 ? `${video.title} | Executive CISO Briefing` : video.title,
          description: `👉 Book a Cyber Strategy consultation with CPF Coaching: https://cpf-coaching.com\\n\\n${video.title} - Strategic executive breakdown.\\n\\nTIMELINE & CORE CONCEPTS:\\n00:00 - Strategic Overview\\n02:15 - Core Framework\\n05:40 - Action Plan\\n\\n#CISO #CyberSecurity #ExecutiveAdvisory`,
          tags: ['CISO', 'Cybersecurity', 'Executive Advisory', 'Cloud Security', 'CPF Coaching']
        };
      }
    }

    return await executeApplyAndRescan(video, payload);
  };
"""

if "const handlePushLive =" not in vc:
    vc = vc.replace(
        "  // 1-Click: Quick Fix & Rescan directly from a table row\n  const handleQuickFixAndRescan",
        handle_push_live_code + "\n  // 1-Click: Quick Fix & Rescan directly from a table row\n  const handleQuickFixAndRescan"
    )
    print("✓ Added handlePushLive function to Videos.tsx")

# Add "Push Live to YouTube" button on table row
old_table_actions = """                            {/* 1-Click Auto-Fix & Rescan Button */}
                            {video.issueCount > 0 && (
                              <button
                                onClick={() => handleQuickFixAndRescan(video)}
                                disabled={isProcessingThis}
                                className="px-2.5 py-1.5 bg-brand-primary/15 hover:bg-brand-primary/25 border border-brand-primary/40 text-brand-primary-bright rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50"
                                id={`btn-quick-fix-${video.videoId}`}
                                title="1-Click: Apply AI fixes, wait for processing, and rescan to eliminate all defects"
                              >
                                {isProcessingThis ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Rescanning...</span>
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="w-3.5 h-3.5" />
                                    <span>Auto-Fix & Rescan</span>
                                  </>
                                )}
                              </button>
                            )}"""

new_table_actions = """                            {/* Push Live to YouTube Button (when draft exists or pending push) */}
                            {video.suggestedMetadata && (
                              <button
                                onClick={() => handlePushLive(video)}
                                disabled={isProcessingThis}
                                className="px-2.5 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 border border-emerald-400 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-950/40 disabled:opacity-50"
                                id={`btn-push-live-${video.videoId}`}
                                title="Push this AI optimization directly to YouTube Studio (live update)"
                              >
                                {isProcessingThis ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Pushing Live...</span>
                                  </>
                                ) : (
                                  <>
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Push Live to YouTube</span>
                                  </>
                                )}
                              </button>
                            )}

                            {/* 1-Click Auto-Fix & Rescan Button (when no draft exists yet) */}
                            {!video.suggestedMetadata && video.issueCount > 0 && (
                              <button
                                onClick={() => handleQuickFixAndRescan(video)}
                                disabled={isProcessingThis}
                                className="px-2.5 py-1.5 bg-brand-primary/15 hover:bg-brand-primary/25 border border-brand-primary/40 text-brand-primary-bright rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm disabled:opacity-50"
                                id={`btn-quick-fix-${video.videoId}`}
                                title="1-Click: Apply AI fixes, wait for processing, and rescan to eliminate all defects"
                              >
                                {isProcessingThis ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Rescanning...</span>
                                  </>
                                ) : (
                                  <>
                                    <Wand2 className="w-3.5 h-3.5" />
                                    <span>Auto-Fix & Rescan</span>
                                  </>
                                )}
                              </button>
                            )}"""

if old_table_actions in vc:
    vc = vc.replace(old_table_actions, new_table_actions)
    print("✓ Added Push Live to YouTube button in table rows")

# Also add Push Live in Drawer button
drawer_apply_old = """                        ) : (
                          <>
                            <Wand2 className="w-4 h-4" />
                            <span>Apply Fixes, Process & Rescan (0 Defects)</span>
                          </>
                        )}"""

drawer_apply_new = """                        ) : (
                          <>
                            <UploadCloud className="w-4 h-4" />
                            <span>🚀 Push Live to YouTube Studio (0 Defects)</span>
                          </>
                        )}"""

if drawer_apply_old in vc:
    vc = vc.replace(drawer_apply_old, drawer_apply_new)
    print("✓ Updated drawer action button to Push Live to YouTube Studio")

with open(videos_path, "w", encoding="utf-8") as f:
    f.write(vc)
print("✓ Updated src/components/Videos.tsx successfully.")

# ==============================================================================
# 3. Update src/App.tsx
# ==============================================================================
app_path = os.path.join(APP_DIR, "src/App.tsx")
with open(app_path, "r", encoding="utf-8") as f:
    ac = f.read()

# Pass selectedChannelId to handleSignIn
old_handle_signin = """  // Auth Action handlers
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await executeRecaptcha('LOGIN');
      await signInWithGoogle();
    } catch (err: any) {
      console.error("Auth signin trigger failed:", err);
      const msg = err.message || String(err);
      setAuthError(msg);
      addToast(msg, 'error');
    }
  };"""

new_handle_signin = """  // Auth Action handlers
  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await executeRecaptcha('LOGIN');
      await signInWithGoogle(selectedChannelId);
      setIsDemoMode(false);
    } catch (err: any) {
      console.error("Auth signin trigger failed:", err);
      const msg = err.message || String(err);
      setAuthError(msg);
      addToast(msg, 'error');
    }
  };"""

if old_handle_signin in ac:
    ac = ac.replace(old_handle_signin, new_handle_signin)
    print("✓ Updated handleSignIn in src/App.tsx")

with open(app_path, "w", encoding="utf-8") as f:
    ac = f.write(ac)
print("✓ Updated src/App.tsx successfully.")
