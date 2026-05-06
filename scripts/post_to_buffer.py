#!/usr/bin/env python3
"""
Post to Buffer via MCP Server using Catbox image hosting.
Reads vCISO content and uploads as drafts to Facebook and LinkedIn.
"""

import os
import json
import sys
from pathlib import Path
import requests
from dotenv import load_dotenv

# Load environment variables
env_path = Path("/Volumes/Crucial X9 Pro For Mac/Antigravity/data/antigravity/.env")
load_dotenv(env_path)

BUFFER_API_TOKEN = os.getenv("BUFFER_API_TOKEN")
if not BUFFER_API_TOKEN:
    print("ERROR: BUFFER_API_TOKEN not found in .env file")
    sys.exit(1)

BUFFER_MCP_URL = "https://mcp.buffer.com/mcp"
SOCIAL_CONTENT_BASE = Path("/Users/MacAttack/Library/Mobile Documents/com~apple~CloudDocs/Downloads/social-content")

# Target Channels
FACEBOOK_PAGE_ID = "665207aab9b04b2003332f46"  # CPF-Coaching
LINKEDIN_PROFILE_ID = "66520a31b9b04b20034961ac"  # Christophe Foulon Profile
LINKEDIN_PAGE_ID = "6888b220cdb92dce190ada3b"  # CPF Coaching LLC Page

class BufferMCPPoster:
    def __init__(self, token):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }

    def call_tool(self, tool_name, arguments):
        """Invoke a Buffer MCP tool"""
        payload = {
            "jsonrpc": "2.0",
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": arguments
            },
            "id": 1
        }
        
        response = requests.post(
            BUFFER_MCP_URL,
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        res_json = response.json()
        
        if "result" in res_json and "content" in res_json["result"]:
            content = res_json["result"]["content"]
            if content and len(content) > 0:
                inner_text = content[0].get("text", "")
                try:
                    return json.loads(inner_text)
                except json.JSONDecodeError:
                    return inner_text
        return res_json

    def upload_to_catbox(self, image_path):
        """Upload image to catbox.moe and return the public URL"""
        try:
            with open(image_path, 'rb') as f:
                files = {
                    'fileToUpload': (image_path.name, f, 'image/png')
                }
                data = {
                    'reqtype': 'fileupload'
                }
                r = requests.post("https://catbox.moe/user/api.php", data=data, files=files)
                if r.status_code == 200:
                    url = r.text.strip()
                    if url.startswith("https://files.catbox.moe"):
                        return url
                print(f"  ⚠ Catbox upload failed for {image_path}: {r.status_code} {r.text}")
        except Exception as e:
            print(f"  ⚠ Catbox upload exception for {image_path}: {e}")
        return None

    def post_platform_content(self, platform_name, channel_ids):
        """Post all content from platform directory to specified channel IDs"""
        platform_dir = SOCIAL_CONTENT_BASE / platform_name
        if not platform_dir.exists():
            print(f"⚠ Skipping {platform_name} - directory not found")
            return
        
        print(f"\n📱 Processing {platform_name.upper()} directory...")
        
        # Group posts by number
        posts = {}
        for txt_file in platform_dir.glob("post-*.txt"):
            post_num = txt_file.stem.split("-")[1]
            if post_num not in posts:
                posts[post_num] = {}
            posts[post_num]["text"] = txt_file
        
        for img_file in platform_dir.glob("post-*.png"):
            post_num = img_file.stem.split("-")[1]
            if post_num not in posts:
                posts[post_num] = {}
            posts[post_num]["image"] = img_file

        for post_num in sorted(posts.keys()):
            post_data = posts[post_num]
            if "text" not in post_data:
                print(f"  ⚠ Post {post_num}: No text caption found, skipping")
                continue
            
            # Read caption
            with open(post_data["text"], 'r', encoding='utf-8') as f:
                text = f.read().strip()
            
            # Prepare image asset if available
            assets = None
            if "image" in post_data:
                img_path = post_data["image"]
                print(f"  ☁ Uploading image for post {post_num} to Catbox...")
                public_url = self.upload_to_catbox(img_path)
                if public_url:
                    assets = {
                        "images": [
                          {
                            "url": public_url
                          }
                        ]
                    }
                    print(f"    ✓ Hosted at: {public_url}")
                else:
                    print(f"    ⚠ Failed to host image, creating text-only post")
            
            # Post to each target channel
            for channel_id in channel_ids:
                channel_label = "Facebook" if channel_id == FACEBOOK_PAGE_ID else ("LinkedIn Profile" if channel_id == LINKEDIN_PROFILE_ID else "LinkedIn Page")
                
                print(f"  📤 Creating draft for Post {post_num} on {channel_label}...")
                
                # Construct arguments
                arguments = {
                    "channelId": channel_id,
                    "schedulingType": "automatic",
                    "mode": "addToQueue",
                    "text": text,
                    "saveToDraft": True
                }
                
                if assets:
                    arguments["assets"] = assets
                
                # Facebook requires 'metadata.facebook.type'
                if channel_id == FACEBOOK_PAGE_ID:
                    arguments["metadata"] = {
                        "facebook": {
                            "type": "post"
                        }
                    }
                
                # Call Buffer MCP
                try:
                    result = self.call_tool("create_post", arguments)
                    if result and result.get("error") is None:
                        post_id = result.get("id", "Unknown ID")
                        print(f"    ✓ Successfully created draft (ID: {post_id})")
                    else:
                        error_msg = result.get("error", "Unknown error") if result else "No response"
                        print(f"    ✗ Failed: {error_msg}")
                except Exception as e:
                    print(f"    ✗ Exception: {e}")

def main():
    print("🚀 Buffer MCP Automated Social Posting (via Catbox Image Hosting)")
    poster = BufferMCPPoster(BUFFER_API_TOKEN)
    
    # 1. Post Facebook content to Facebook Page
    poster.post_platform_content("facebook", [FACEBOOK_PAGE_ID])
    
    # 2. Post LinkedIn content to both LinkedIn Profile and LinkedIn Page
    poster.post_platform_content("linkedin", [LINKEDIN_PROFILE_ID, LINKEDIN_PAGE_ID])
    
    print("\n🎉 Post creation completed!")

if __name__ == "__main__":
    main()
