#!/usr/bin/env python3
"""
Buffer Post Uploader
Reads social content from directories and adds posts to Buffer queue
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

BUFFER_API_URL = "https://api.bufferapp.com/1"
SOCIAL_CONTENT_BASE = Path("/Users/MacAttack/Library/Mobile Documents/com~apple~CloudDocs/Downloads/social-content")

class BufferPoster:
    def __init__(self, token):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        self.profile_id = None
    
    def get_profiles(self):
        """Fetch all Buffer profiles"""
        response = requests.get(f"{BUFFER_API_URL}/profiles.json", params={"access_token": self.token})
        response.raise_for_status()
        return response.json()
    
    def find_profile_by_email(self, email):
        """Find profile ID by email address"""
        profiles = self.get_profiles()
        for profile in profiles:
            if profile.get("email") == email:
                return profile.get("id")
        return None
    
    def upload_media(self, image_path):
        """Upload image to Buffer and return URL"""
        with open(image_path, 'rb') as f:
            files = {'media': f}
            response = requests.post(
                f"{BUFFER_API_URL}/uploads.json",
                params={"access_token": self.token},
                files=files
            )
            response.raise_for_status()
            return response.json().get("url")
    
    def create_post(self, profile_id, text, image_url=None, schedule_time=None):
        """Create a post in the queue"""
        payload = {
            "profile_ids": [profile_id],
            "text": text,
            "shorten": True,
            "should_retweet": False
        }
        
        if image_url:
            payload["media"] = {"link": image_url}
        
        if schedule_time:
            payload["scheduled_at"] = schedule_time
        else:
            # Add to queue without scheduling
            payload["now"] = False
        
        response = requests.post(
            f"{BUFFER_API_URL}/updates.json",
            params={"access_token": self.token},
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def process_social_content(self, email, platforms=None):
        """Process and post social content"""
        profile_id = self.find_profile_by_email(email)
        if not profile_id:
            print(f"ERROR: Could not find Buffer profile for {email}")
            return False
        
        print(f"✓ Found profile ID: {profile_id}")
        
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
            
            # Upload each post
            for post_num in sorted(posts.keys()):
                post_data = posts[post_num]
                
                if "text" not in post_data:
                    print(f"  ⚠ Post {post_num}: Missing text file, skipping")
                    continue
                
                # Read text
                with open(post_data["text"], 'r') as f:
                    text = f.read().strip()
                
                # Upload image if available
                image_url = None
                if "image" in post_data:
                    try:
                        image_url = self.upload_media(str(post_data["image"]))
                        print(f"  ✓ Uploaded image for post {post_num}")
                    except Exception as e:
                        print(f"  ⚠ Failed to upload image for post {post_num}: {e}")
                
                # Create post
                try:
                    result = self.create_post(profile_id, text, image_url)
                    print(f"  ✓ Post {post_num} added to queue")
                    total_posts += 1
                except Exception as e:
                    print(f"  ✗ Failed to create post {post_num}: {e}")
        
        print(f"\n✓ Successfully queued {total_posts} posts!")
        return True

def main():
    email = "christophefoulon@gmail.com"
    
    print("🚀 Buffer Post Uploader")
    print(f"📧 Target email: {email}")
    print(f"📁 Source: {SOCIAL_CONTENT_BASE}\n")
    
    poster = BufferPoster(BUFFER_API_TOKEN)
    
    try:
        poster.process_social_content(email)
    except Exception as e:
        print(f"\n✗ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
