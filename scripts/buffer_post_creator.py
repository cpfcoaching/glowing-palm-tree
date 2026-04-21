#!/usr/bin/env python3
"""
Buffer API Post Creator - Uploads Christophe Foulon vCISO content
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

BUFFER_GRAPHQL_URL = "https://api.buffer.com"
SOCIAL_CONTENT_BASE = Path("/Users/MacAttack/Library/Mobile Documents/com~apple~CloudDocs/Downloads/social-content")

class BufferPostCreator:
    def __init__(self, api_token):
        self.api_token = api_token
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
        self.channel_map = {}
    
    def graphql_query(self, query, variables=None):
        """Execute a GraphQL query"""
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
        
        response = requests.post(BUFFER_GRAPHQL_URL, headers=self.headers, json=payload)
        result = response.json()
        
        if "errors" in result:
            return None
        return result
    
    def get_channels(self, org_id):
        """Get all channels for organization"""
        query = """
        {
          channels(input: {organizationId: "%s"}) {
            id
            name
            service
          }
        }
        """ % org_id
        
        result = self.graphql_query(query)
        if result and "data" in result:
            return result["data"]["channels"]
        return None
    
    def get_organization_id(self):
        """Get organization ID from account"""
        query = """
        {
          account {
            organizations {
              id
            }
          }
        }
        """
        
        result = self.graphql_query(query)
        if result and "data" in result and "account" in result["data"]:
            orgs = result["data"]["account"]["organizations"]
            if orgs:
                return orgs[0]["id"]
        return None
    
    def create_post(self, channel_id, text, service):
        """Create a post in the queue"""
        mutation = """
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            ... on PostActionSuccess {
              post {
                id
                dueAt
              }
            }
            ... on MutationError {
              message
            }
          }
        }
        """
        
        variables = {
            "input": {
                "text": text,
                "channelId": channel_id,
                "schedulingType": "automatic",
                "mode": "addToQueue"
            }
        }
        
        result = self.graphql_query(mutation, variables)
        if result and "data" in result and "createPost" in result["data"]:
            post_result = result["data"]["createPost"]
            if "post" in post_result:
                return {"success": True, "id": post_result["post"]["id"], "due": post_result["post"]["dueAt"]}
            elif "message" in post_result:
                return {"success": False, "error": post_result["message"]}
        return {"success": False, "error": "Unknown error"}
    
    def load_posts(self):
        """Load all posts from directory"""
        posts_by_platform = {}
        
        for platform in ["facebook", "instagram", "linkedin"]:
            platform_dir = SOCIAL_CONTENT_BASE / platform
            if not platform_dir.exists():
                continue
            
            posts_by_platform[platform] = {}
            
            # Group posts by number
            for txt_file in platform_dir.glob("post-*.txt"):
                post_num = txt_file.stem.split("-")[1]
                if post_num not in posts_by_platform[platform]:
                    posts_by_platform[platform][post_num] = {}
                
                with open(txt_file, 'r') as f:
                    posts_by_platform[platform][post_num]["text"] = f.read().strip()
                
                # Check for image
                img_file = platform_dir / f"post-{post_num}-*.png"
                for img in platform_dir.glob(f"post-{post_num}-*.png"):
                    posts_by_platform[platform][post_num]["image"] = str(img)
                    break
        
        return posts_by_platform
    
    def upload_all_posts(self):
        """Main flow: fetch channels, load posts, create them"""
        print("🚀 Buffer Post Creator - Christophe Foulon vCISO Content")
        print(f"📁 Source: {SOCIAL_CONTENT_BASE}\n")
        
        # Get organization
        org_id = self.get_organization_id()
        if not org_id:
            print("ERROR: Could not fetch organization")
            return False
        
        print(f"✓ Organization ID: {org_id}")
        
        # Get channels
        channels = self.get_channels(org_id)
        if not channels:
            print("ERROR: Could not fetch channels")
            return False
        
        print(f"✓ Found {len(channels)} channels:")
        
        # Map channels by service
        for channel in channels:
            service = channel["service"].lower()
            self.channel_map[service] = channel
            print(f"  - {channel['name']} ({service}): {channel['id']}")
        
        # Load posts
        posts_by_platform = self.load_posts()
        print(f"\n✓ Loaded {sum(len(p) for p in posts_by_platform.values())} posts")
        
        # Create posts
        total_created = 0
        total_skipped = 0
        
        for platform in sorted(posts_by_platform.keys()):
            posts = posts_by_platform[platform]
            
            # Check if channel exists
            if platform not in self.channel_map:
                print(f"\n⚠ {platform.upper()}: No channel found in Buffer")
                total_skipped += len(posts)
                continue
            
            channel = self.channel_map[platform]
            print(f"\n📱 {platform.upper()} ({channel['name']}):")
            
            for post_num in sorted(posts.keys()):
                post_data = posts[post_num]
                
                if "text" not in post_data:
                    print(f"  ⚠ Post {post_num}: No text found")
                    total_skipped += 1
                    continue
                
                # Create post
                result = self.create_post(channel["id"], post_data["text"], platform)
                
                if result["success"]:
                    due_date = result["due"][:10]  # Just the date part
                    print(f"  ✓ Post {post_num} queued (ID: {result['id'][:8]}..., due: {due_date})")
                    total_created += 1
                else:
                    print(f"  ✗ Post {post_num}: {result['error']}")
                    total_skipped += 1
        
        print(f"\n{'='*60}")
        print(f"✓ Successfully created: {total_created} posts")
        if total_skipped > 0:
            print(f"⚠ Skipped: {total_skipped} posts")
        print(f"{'='*60}\n")
        
        return True

def main():
    creator = BufferPostCreator(BUFFER_API_TOKEN)
    
    try:
        creator.upload_all_posts()
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
