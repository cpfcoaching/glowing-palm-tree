#!/usr/bin/env python3
"""
merge_brand_tenants.py
Merges videos and channel metadata from Brand Account tenants into the
canonical primary tenant for Christophe Foulon (GXMus6DACcMaZX0HtBs9XSEi1px2).
This prevents double ingestion and unifies billing under a single active subscription.
"""

import subprocess
import json
import urllib.request
import urllib.error
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

PROJECT_ID = "vernal-reality-509713-f9"
DATABASE_ID = "ai-studio-youtubeseomaximi-76fee745-a1b6-4920-87f1-ddbff6b17dd3"
CANONICAL_UID = "GXMus6DACcMaZX0HtBs9XSEi1px2"

def get_token():
    res = subprocess.run(["gcloud", "auth", "print-access-token"], capture_output=True, text=True, check=True)
    return res.stdout.strip()

TOKEN = get_token()
BASE_URL = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/{DATABASE_ID}/documents"

def api_request(path, method="GET", data=None):
    url = f"{BASE_URL}/{path}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8")
        print(f"HTTPError on {method} {url}: {e.code} - {error_msg}")
        raise

def get_all_videos(tenant_uid):
    videos = []
    page_token = None
    while True:
        path = f"tenants/{tenant_uid}/videos?pageSize=300"
        if page_token:
            path += f"&pageToken={page_token}"
        data = api_request(path)
        docs = data.get("documents", [])
        videos.extend(docs)
        page_token = data.get("nextPageToken")
        if not page_token:
            break
    return videos

def main():
    print(f"Fetching videos from Canonical Tenant ({CANONICAL_UID})...")
    canon_videos = get_all_videos(CANONICAL_UID)
    canon_ids = set()
    for doc in canon_videos:
        # doc['name'] is projects/.../documents/tenants/.../videos/<docId>
        doc_id = doc["name"].split("/")[-1]
        canon_ids.add(doc_id)
    print(f"Canonical tenant has {len(canon_ids)} videos indexed.")

    # Source: Brand Account tenant DY87Cm5Mu5TFkyTPumrDim4GH0q1
    source_uid = "DY87Cm5Mu5TFkyTPumrDim4GH0q1"
    print(f"Fetching videos from Brand Account Tenant ({source_uid})...")
    source_videos = get_all_videos(source_uid)
    print(f"Brand account tenant has {len(source_videos)} videos.")

    missing_count = 0
    copied_count = 0
    for doc in source_videos:
        doc_id = doc["name"].split("/")[-1]
        if doc_id not in canon_ids:
            missing_count += 1
            # Copy to canonical tenant
            target_path = f"tenants/{CANONICAL_UID}/videos/{doc_id}"
            payload = {"fields": doc["fields"]}
            api_request(target_path, method="PATCH", data=payload)
            copied_count += 1
            if copied_count % 25 == 0:
                print(f"Copied {copied_count} missing videos to canonical tenant...")

    print(f"✓ Migration complete: Copied {copied_count} videos into canonical profile.")

    # Update channel document in canonical profile
    channel_id = "UCM3YAEDu6W7JmQc0kb-CNtw"
    print(f"Updating channel {channel_id} in canonical profile to 1,149 videos...")
    patch_url = f"tenants/{CANONICAL_UID}/channels/{channel_id}?updateMask.fieldPaths=ingestedCount&updateMask.fieldPaths=totalVideosCount"
    patch_body = {
        "fields": {
            "ingestedCount": {"integerValue": "1149"},
            "totalVideosCount": {"integerValue": "1149"}
        }
    }
    api_request(patch_url, method="PATCH", data=patch_body)
    print(f"✓ Channel {channel_id} updated with ingestedCount=1149.")

    # Tag all tenants with primaryTenantUid = CANONICAL_UID to establish unified profile link
    all_uids = ["DY87Cm5Mu5TFkyTPumrDim4GH0q1", "ck4hteyg6XXyOWrBeYOIOBdHNQH3", "S0E1yHU1hmOniZb7ubSzTEPVv4C3"]
    for uid in all_uids:
        print(f"Linking tenant {uid} to primaryTenantUid {CANONICAL_UID}...")
        link_url = f"tenants/{uid}?updateMask.fieldPaths=primaryTenantUid&updateMask.fieldPaths=primaryManagerEmail"
        link_body = {
            "fields": {
                "primaryTenantUid": {"stringValue": CANONICAL_UID},
                "primaryManagerEmail": {"stringValue": "christophefoulon@gmail.com"}
            }
        }
        api_request(link_url, method="PATCH", data=link_body)
    print("✓ All brand tenants linked to primary profile!")

if __name__ == "__main__":
    main()
