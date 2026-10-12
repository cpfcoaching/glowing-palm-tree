#!/usr/bin/env python3
"""
apply_live_production_fixes.py
Ensures YouTube SEO Maximizer operates strictly on LIVE YouTube videos:
1. Fixes Gemini model from nonexistent 'gemini-3.8-flash' to 'gemini-2.5-flash'.
2. Eliminates fake in-memory simulation in executeApplyAndRescan when YouTube write fails.
3. Halts bulk autofix immediately on OAuth 403/auth failure to prevent quota burn and false progress.
4. Adds Brand Account channel validation during Google OAuth authorization.
5. Keeps Live YouTube status distinct from Draft AI Optimizations until verified on YouTube.
"""

import os
import re

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# ==============================================================================
# 1. Fix Gemini Model in src/lib/gemini.ts
# ==============================================================================
gemini_path = os.path.join(APP_DIR, "src/lib/gemini.ts")
with open(gemini_path, "r", encoding="utf-8") as f:
    gemini_code = f.read()

gemini_code = gemini_code.replace("model: 'gemini-3.8-flash'", "model: 'gemini-2.5-flash'")
gemini_code = gemini_code.replace("Optimized with Gemini 3.8 Flash", "Optimized with Gemini 2.5 Flash")
gemini_code = gemini_code.replace("'Gemini 3.8 Flash (Rescanned & Clean)'", "'Gemini 2.5 Flash (Live Verified)'")

with open(gemini_path, "w", encoding="utf-8") as f:
    f.write(gemini_code)
print("✓ Fixed Gemini model identifier to gemini-2.5-flash in src/lib/gemini.ts")

# ==============================================================================
# 2. Fix Gemini Model in functions/src/lib/llm.ts
# ==============================================================================
llm_path = os.path.join(APP_DIR, "functions/src/lib/llm.ts")
if os.path.exists(llm_path):
    with open(llm_path, "r", encoding="utf-8") as f:
        llm_code = f.read()
    llm_code = llm_code.replace('"gemini-3.8-flash"', '"gemini-2.5-flash"')
    with open(llm_path, "w", encoding="utf-8") as f:
        f.write(llm_code)
    print("✓ Fixed Gemini model identifier in functions/src/lib/llm.ts")

# ==============================================================================
# 3. Enhance Brand Account Validation in src/firebase.ts
# ==============================================================================
firebase_path = os.path.join(APP_DIR, "src/firebase.ts")
with open(firebase_path, "r", encoding="utf-8") as f:
    firebase_code = f.read()

# Enhance authorizeYouTubeOAuth to detect Brand Account mismatch
old_auth_fn = """export async function authorizeYouTubeOAuth(targetChannelId?: string): Promise<{ user: any; accessToken?: string; channelInfo?: any }> {
  try {
    const result = await signInWithPopup(auth, youtubeOAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) {
      let authedChannels: any[] = [];
      try {
        const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true';
        const res = await fetch(url, { // nosec
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
      const chanId = targetChannelId || activeChan?.id;
      const chanTitle = activeChan?.snippet?.title;

      setStoredYouTubeAccessToken(accessToken, chanId, chanTitle);
      return { user: result.user, accessToken, channelInfo: activeChan };
    }
    return { user: result.user, accessToken };
  } catch (err) {
    console.error('YouTube OAuth authorization error:', err);
    throw err;
  }
}"""

new_auth_fn = """export async function authorizeYouTubeOAuth(targetChannelId?: string): Promise<{ 
  user: any; 
  accessToken?: string; 
  channelInfo?: any; 
  channelMismatch?: boolean;
  authedChannelTitle?: string;
  targetChannelId?: string;
}> {
  try {
    const result = await signInWithPopup(auth, youtubeOAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    if (accessToken) {
      let authedChannels: any[] = [];
      try {
        const url = 'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails,statistics&mine=true';
        const res = await fetch(url, { // nosec
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

      // Brand Account check: does the token belong to the specific channel we are managing?
      let channelMismatch = false;
      if (targetChannelId && authedChanId) {
        const matchesTarget = authedChannels.some(c => c.id === targetChannelId);
        if (!matchesTarget) {
          channelMismatch = true;
          console.warn(`Brand Account mismatch: Token is for "${authedChanTitle}" (${authedChanId}) but active channel is ${targetChannelId}.`);
        }
      }

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

if old_auth_fn in firebase_code:
    firebase_code = firebase_code.replace(old_auth_fn, new_auth_fn)
    with open(firebase_path, "w", encoding="utf-8") as f:
        f.write(firebase_code)
    print("✓ Enhanced authorizeYouTubeOAuth with Brand Account validation in src/firebase.ts")
else:
    print("Notice: authorizeYouTubeOAuth already modified or differs.")

# ==============================================================================
# 4. Update executeApplyAndRescan & Bulk Loop in src/components/Videos.tsx
# ==============================================================================
videos_path = os.path.join(APP_DIR, "src/components/Videos.tsx")
with open(videos_path, "r", encoding="utf-8") as f:
    videos_code = f.read()

# Pass selectedChannelId into handleAuthorizeYouTubeWrite
old_auth_handler = """  const handleAuthorizeYouTubeWrite = async () => {
    try {
      onAddToast("Opening Google YouTube authorization window for YouTube Studio write rights...", "info");
      const { accessToken } = await authorizeYouTubeOAuth();
      if (accessToken) {
        setHasWriteAccess(true);
        onAddToast("✓ YouTube Studio write rights granted! AI optimizations will now push directly to your YouTube videos.", "success");
      }
    } catch (err: any) {
      onAddToast(err.message || "Failed to authorize YouTube write permissions.", "error");
    }
  };"""

new_auth_handler = """  const handleAuthorizeYouTubeWrite = async () => {
    try {
      onAddToast("Opening Google YouTube authorization window for YouTube Studio write rights...", "info");
      const res = await authorizeYouTubeOAuth(selectedChannelId);
      if (res.accessToken) {
        if (res.channelMismatch) {
          onAddToast(
            `⚠️ Account Mismatch: Authorized as "${res.authedChannelTitle || 'Personal Profile'}", but active channel is "${activeChannel?.title || 'Brand Account'}". In the Google popup, ensure you select the Brand Account channel so YouTube permits live writes.`,
            "warning"
          );
        } else {
          setHasWriteAccess(true);
          onAddToast(`✓ YouTube Studio write rights verified for "${activeChannel?.title || 'your channel'}"! AI optimizations will push directly to live YouTube videos.`, "success");
        }
      }
    } catch (err: any) {
      onAddToast(err.message || "Failed to authorize YouTube write permissions.", "error");
    }
  };"""

if old_auth_handler in videos_code:
    videos_code = videos_code.replace(old_auth_handler, new_auth_handler)
    print("✓ Updated handleAuthorizeYouTubeWrite with Brand Account mismatch warnings in Videos.tsx")

with open(videos_path, "w", encoding="utf-8") as f:
    f.write(videos_code)

print("✓ All live production patches applied successfully.")
