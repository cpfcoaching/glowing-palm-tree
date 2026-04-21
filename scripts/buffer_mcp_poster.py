#!/usr/bin/env python3
"""
Buffer MCP Post Uploader
Uses Buffer's MCP endpoint to create and queue posts
"""

import os
import json
import sys
import base64
from pathlib import Path
import requests
from dotenv import load_dotenv

# Load environment variables
env_path = Path("/Volumes/Crucial X9 Pro For Mac/Antigravity/data/antigravity/.env")
load_dotenv(env_path)

BUFFER_API_KEY = os.getenv("BUFFER_API_TOKEN")
if not BUFFER_API_KEY:
    print("ERROR: BUFFER_API_TOKEN not found in .env file")
    sys.exit(1)

BUFFER_MCP_URL = "https://mcp.buffer.com/mcp"
SOCIAL_CONTENT_BASE = Path("/Users/MacAttack/Library/Mobile Documents/com~apple~CloudDocs/Downloads/social-content")
EMAIL = "christophefoulon@gmail.com"

class BufferMCPPoster:
    def __init__(self, api_key):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.profile_id = None
    
    def call_tool(self, tool_name, arguments):
        """Call a Buffer MCP tool"""
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
        return response.json()
    
    def list_profiles(self):
        """List all profiles using MCP"""
        try:
            result = self.call_tool("list_profiles", {})
            return result
        except Exception as e:
            print(f"Error listing profiles: {e}")
            return None
    
    def create_post(self, profile_id, text, image_path=None):
        """Create a post using MCP"""
        arguments = {
            "profileId": profile_id,
            "text": text,
            "shouldRetweet": False,
            "shorten": True
        }
        
        if image_path and Path(image_path).exists():
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            arguments["media"] = {
                "data": image_data,
                "filename": Path(image_path).name
            }
        
        try:
            result = self.call_tool("create_post", arguments)
            return result
        except Exception as e:
            print(f"Error creating post: {e}")
            return None
    
    def process_social_content(self, email, platforms=None):
        """Process and post social content"""
        # Get profiles first
        profiles_result = self.list_profiles()
        if not profiles_result:
            print("ERROR: Could not fetch profiles")
            return False
        
        print(f"✓ Fetched profiles")
        
        if platforms is None:
            platforms = ["facebook", "instagram", "linkedin"]
        
        total_posts = 0
        for platform in platforms:
            platform_dir = SOCIAL_CONTENT_BASE / platform
            if not platform_dir.exists():
                print(f"⚠ Skipping {platform} - directory not found")
                continue
            
            print(f"\n📱 Processing {platform.upper()}:")
            
            # Find all post pairs (text + image)
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
            
            # Create each post
            for post_num in sorted(posts.keys()):
                post_data = posts[post_num]
                
                if "text" not in post_data:
                    print(f"  ⚠ Post {post_num}: Missing text file, skipping")
                    continue
                
                # Read text
                with open(post_data["text"], 'r') as f:
                    text = f.read().strip()
                
                image_path = None
                if "image" in post_data:
                    image_path = str(post_data["image"])
                
                # Create post (using a placeholder profile ID - MCP will handle profile selection)
                try:
                    result = self.create_post("default", text, image_path)
                    if result:
                        print(f"  ✓ Post {post_num} created")
                        total_posts += 1
                    else:
                        print(f"  ✗ Failed to create post {post_num}")
                except Exception as e:
                    print(f"  ✗ Error with post {post_num}: {e}")
        
        print(f"\n✓ Successfully created {total_posts} posts!")
        return True

def main():
    print("🚀 Buffer MCP Post Uploader")
    print(f"📧 Target email: {EMAIL}")
    print(f"📁 Source: {SOCIAL_CONTENT_BASE}\n")
    
    poster = BufferMCPPoster(BUFFER_API_KEY)
    
    try:
        poster.process_social_content(EMAIL)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
