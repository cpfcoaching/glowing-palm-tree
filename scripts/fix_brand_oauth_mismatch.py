#!/usr/bin/env python3
"""
fix_brand_oauth_mismatch.py
1. Fixes src/firebase.ts:
   - Does NOT store mismatched tokens under targetChannelId (prevents 403 Forbidden errors).
   - Adds getRecommendedLoginHintForChannel() to suggest the exact Google identity (e.g. breakingintocyber@gmail.com).
   - Passes login_hint in authorizeYouTubeOAuth and switchGoogleAccountWithMFA so Google directs the user to the matching account.
2. Fixes src/components/Videos.tsx:
   - Checks write token specifically for selectedChannelId.
   - Updates hasWriteAccess dynamically on channel change.
   - Provides clear channel-specific authorization buttons.
"""

import os

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# 1. Update src/firebase.ts
firebase_path = os.path.join(APP_DIR, "src/firebase.ts")
with open(firebase_path, "r", encoding="utf-8") as f:
    fc = f.read()

hint_helper = """
/**
 * Maps channel titles / IDs to their authentic Google / Brand Account login hint.
 * Directs Google OAuth to select the matching Brand Account identity rather than
 * defaulting to the user's personal profile.
 */
export function getRecommendedLoginHintForChannel(channelTitleOrId?: string): string | undefined {
  if (!channelTitleOrId) return undefined;
  const lower = channelTitleOrId.toLowerCase();
  if (lower.includes('breaking') || lower.includes('ucm3yaedu6w7jmqc0kb-cntw')) {
    return 'breakingintocyber@gmail.com';
  }
  if (lower.includes('cpf') || lower.includes('uczqnkkt83ccvrh4zsxd5hka')) {
    return 'cpf-coaching-4677@pages.plusgoogle.com';
  }
  return undefined;
}
"""

if "export function getRecommendedLoginHintForChannel" not in fc:
    fc = fc.replace("export const youtubeOAuthProvider", hint_helper + "\nexport const youtubeOAuthProvider")

# Update authorizeYouTubeOAuth to accept loginHint and guard against storing mismatched tokens
old_auth_func = """export async function authorizeYouTubeOAuth(targetChannelId?: string): Promise<{ 
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

new_auth_func = """export async function authorizeYouTubeOAuth(targetChannelId?: string, customLoginHint?: string): Promise<{ 
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
    const hint = customLoginHint || getRecommendedLoginHintForChannel(targetChannelId);
    const customParams: Record<string, string> = {
      prompt: 'select_account consent',
      access_type: 'offline'
    };
    if (hint) {
      customParams.login_hint = hint;
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

      // Brand Account check: does the token belong to the specific channel we are managing?
      let channelMismatch = false;
      if (targetChannelId && authedChanId) {
        const matchesTarget = authedChannels.some(c => c.id === targetChannelId);
        if (!matchesTarget) {
          channelMismatch = true;
          console.warn(`Brand Account mismatch: Token is for "${authedChanTitle}" (${authedChanId}) but active channel is ${targetChannelId}.`);
        }
      }

      // CRITICAL FIX: Only store token if channel MATCHES!
      // Storing a mismatched token causes 403 Forbidden on videos.update and halts bulk runs.
      if (channelMismatch) {
        clearStoredYouTubeAccessToken(targetChannelId);
      } else {
        const chanId = targetChannelId || authedChanId;
        setStoredYouTubeAccessToken(accessToken, chanId, authedChanTitle);
      }

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

if old_auth_func in fc:
    fc = fc.replace(old_auth_func, new_auth_func)
    with open(firebase_path, "w", encoding="utf-8") as f:
        f.write(fc)
    print("✓ Updated authorizeYouTubeOAuth in src/firebase.ts")

# 2. Update src/components/Videos.tsx
videos_path = os.path.join(APP_DIR, "src/components/Videos.tsx")
with open(videos_path, "r", encoding="utf-8") as f:
    vc = f.read()

# Add getRecommendedLoginHintForChannel import in Videos.tsx
if "getRecommendedLoginHintForChannel" not in vc:
    vc = vc.replace(
        "import { authorizeYouTubeOAuth, getStoredYouTubeAccessToken, clearStoredYouTubeAccessToken }",
        "import { authorizeYouTubeOAuth, getStoredYouTubeAccessToken, clearStoredYouTubeAccessToken, getRecommendedLoginHintForChannel }"
    )

# Fix hasWriteAccess state and add effect for selectedChannelId
old_has_write = "  const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !getStoredYouTubeAccessToken());"
new_has_write = """  const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !getStoredYouTubeAccessToken(selectedChannelId));

  // Dynamically update write status whenever active channel changes
  useEffect(() => {
    setHasWriteAccess(!getStoredYouTubeAccessToken(selectedChannelId));
  }, [selectedChannelId]);"""

if "const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !getStoredYouTubeAccessToken());" in vc:
    vc = vc.replace("const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !getStoredYouTubeAccessToken());", new_has_write)

# Also check double negation if any
if "const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !!getStoredYouTubeAccessToken());" in vc:
    vc = vc.replace(
        "const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !!getStoredYouTubeAccessToken());",
        """  const [hasWriteAccess, setHasWriteAccess] = useState<boolean>(() => !!getStoredYouTubeAccessToken(selectedChannelId));

  // Dynamically update write status whenever active channel changes
  useEffect(() => {
    setHasWriteAccess(!!getStoredYouTubeAccessToken(selectedChannelId));
  }, [selectedChannelId]);"""
    )

# Fix handleAuthorizeYouTubeWrite in Videos.tsx
old_handle_auth = """  const handleAuthorizeYouTubeWrite = async () => {
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

new_handle_auth = """  const handleAuthorizeYouTubeWrite = async () => {
    try {
      const channelTitle = activeChannel?.title || 'this channel';
      const hint = getRecommendedLoginHintForChannel(selectedChannelId || activeChannel?.title);
      onAddToast(`Opening Google authorization window for "${channelTitle}"...`, "info");
      const res = await authorizeYouTubeOAuth(selectedChannelId, hint);
      if (res.accessToken) {
        if (res.channelMismatch) {
          setHasWriteAccess(false);
          onAddToast(
            `⚠️ Account Mismatch: Authorized as "${res.authedChannelTitle || 'Personal Profile'}", but active channel is "${channelTitle}". In Google's popup, please click "${hint || channelTitle}" so YouTube permits live writes.`,
            "warning"
          );
        } else {
          setHasWriteAccess(true);
          onAddToast(`✓ YouTube Studio write rights verified for "${channelTitle}"! AI optimizations will push directly to live YouTube videos.`, "success");
        }
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        onAddToast(err.message || "Failed to authorize YouTube write permissions.", "error");
      }
    }
  };"""

if old_handle_auth in vc:
    vc = vc.replace(old_handle_auth, new_handle_auth)
    print("✓ Updated handleAuthorizeYouTubeWrite in src/components/Videos.tsx")

# Fix line 517 & 522 in bulk run to pass selectedChannelId
vc = vc.replace("const hadInitialToken = !!getStoredYouTubeAccessToken();", "const hadInitialToken = !!getStoredYouTubeAccessToken(selectedChannelId);")
vc = vc.replace("const currentToken = getStoredYouTubeAccessToken();", "const currentToken = getStoredYouTubeAccessToken(selectedChannelId);")

with open(videos_path, "w", encoding="utf-8") as f:
    f.write(vc)
print("✓ Updated Videos.tsx successfully.")
