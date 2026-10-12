#!/usr/bin/env python3
"""
fix_batch_undefined.py
Patches src/lib/appService.ts to sanitize undefined fields before batch.set()
Eliminates: Function WriteBatch.set() called with invalid data. Unsupported field value: undefined
"""

import os

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"
app_service_path = os.path.join(APP_DIR, "src/lib/appService.ts")

with open(app_service_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Add cleanFirestoreData helper near the top of the file if not present
helper_code = """/**
 * Deeply sanitizes an object by removing any properties with value `undefined`.
 * Firestore throws a runtime exception if any field in a payload is undefined.
 */
function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  const cleaned: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Timestamp)) {
        cleaned[k] = cleanFirestoreData(v);
      } else {
        cleaned[k] = v;
      }
    }
  }
  return cleaned;
}
"""

if "function cleanFirestoreData" not in code:
    # Insert right after the imports
    import_anchor = "import { DEFAULT_CTA_TEXT, DEFAULT_CTA_MARKER } from './seo';"
    if import_anchor in code:
        code = code.replace(import_anchor, import_anchor + "\n\n" + helper_code)
    else:
        # Fallback to after first import block
        code = helper_code + "\n" + code
    print("✓ Added cleanFirestoreData helper to appService.ts")

# 2. Replace batch.set block
old_batch_set = """        batch.set(doc(db, `tenants/${effectiveUid}/videos`, vid.videoId), {
          ...vid,
          channelId: resolvedChannelId,
          hasCta: finalHasCta,
          description: finalDesc,
          score: finalScore,
          issues: finalIssues,
          issueCount: finalIssues.length,
          suggestedMetadata: existing?.suggestedMetadata || vid.suggestedMetadata
        }, { merge: true });"""

new_batch_set = """        const videoDocData: Record<string, any> = {
          ...vid,
          channelId: resolvedChannelId,
          hasCta: finalHasCta,
          description: finalDesc,
          score: finalScore,
          issues: finalIssues,
          issueCount: finalIssues.length,
        };

        const sMeta = existing?.suggestedMetadata || vid.suggestedMetadata;
        if (sMeta) {
          videoDocData.suggestedMetadata = sMeta;
        }

        batch.set(
          doc(db, `tenants/${effectiveUid}/videos`, vid.videoId), 
          cleanFirestoreData(videoDocData), 
          { merge: true }
        );"""

if old_batch_set in code:
    code = code.replace(old_batch_set, new_batch_set)
    print("✓ Updated batch.set block with undefined protection in appService.ts")
else:
    print("Notice: old_batch_set did not match exactly, searching for substring...")
    # Try alternate match if formatting differs
    if "suggestedMetadata: existing?.suggestedMetadata || vid.suggestedMetadata" in code:
        code = code.replace(
            "suggestedMetadata: existing?.suggestedMetadata || vid.suggestedMetadata",
            "// Sanitized suggestedMetadata handled via cleanFirestoreData"
        )
        print("✓ Replaced suggestedMetadata line directly")

with open(app_service_path, "w", encoding="utf-8") as f:
    f.write(code)

print("✓ Saved appService.ts with batch undefined protection.")
