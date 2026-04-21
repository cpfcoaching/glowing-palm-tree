#!/usr/bin/env python3
"""
Buffer GraphQL Post Uploader
Creates and queues posts using Buffer's GraphQL API
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
EMAIL = "christophefoulon@gmail.com"

class BufferGraphQLPoster:
    def __init__(self, api_token):
        self.api_token = api_token
        self.headers = {
            "Authorization": f"Bearer {api_token}",
            "Content-Type": "application/json"
        }
    
    def query(self, graphql_query, variables=None):
        """Execute a GraphQL query"""
        payload = {
            "query": graphql_query
        }
        if variables:
            payload["variables"] = variables
        
        response = requests.post(
            BUFFER_GRAPHQL_URL,
            headers=self.headers,
            json=payload
        )
        
        result = response.json()
        
        if response.status_code != 200 or "errors" in result:
            print(f"GraphQL Response ({response.status_code}):")
            print(json.dumps(result, indent=2))
            return None
        
        return result
    
    def get_organizations(self):
        """Get all organizations for this account"""
        query = """
        query GetOrganizations {
          account {
            organizations {
              id
              name
            }
          }
        }
        """
        result = self.query(query)
        if result and "data" in result:
            return result["data"]["account"]["organizations"]
        return None
    
    def get_channels(self, org_id):
        """Get all channels for an organization"""
        query = """
        query GetChannels($organizationId: String!) {
          organization(id: $organizationId) {
            channels {
              id
              name
              service
            }
          }
        }
        """
        result = self.query(query, {"organizationId": org_id})
        if result and "data" in result:
            return result["data"]["organization"]["channels"]
        return None
    
    def create_post(self, channel_id, text, media_url=None):
        """Create a post in the queue"""
        mutation = """
        mutation CreatePost($input: CreatePostInput!) {
          createPost(input: $input) {
            post {
              id
              text
              status
            }
          }
        }
        """
        
        input_data = {
            "channelId": channel_id,
            "text": text,
            "scheduleAt": None  # Add to queue without scheduling
        }
        
        if media_url:
            input_data["media"] = [{"url": media_url}]
        
        result = self.query(mutation, {"input": input_data})
        if result and "data" in result:
            return result["data"]["createPost"]["post"]
        elif result and "errors" in result:
            print(f"Error creating post: {result['errors']}")
        return None
    
    def process_social_content(self, platforms=None):
        """Process and post social content"""
        # Get organizations
        orgs = self.get_organizations()
        if not orgs:
            print("ERROR: Could not fetch organizations")
            return False
        
        org_id = orgs[0]["id"]
        print(f"✓ Found organization: {org_id}")
        
        # Get channels
        channels = self.get_channels(org_id)
        if not channels:
            print("ERROR: Could not fetch channels")
            return False
        
        print(f"✓ Found {len(channels)} channels")
        
        # Map service names to channel IDs
        channel_map = {}
        for channel in channels:
            service = channel["service"].lower()
            channel_map[service] = channel["id"]
            print(f"  - {channel['name']} ({service}): {channel['id']}")
        
        if platforms is None:
            platforms = ["facebook", "instagram", "linkedin"]
        
        total_posts = 0
        for platform in platforms:
            platform_dir = SOCIAL_CONTENT_BASE / platform
            if not platform_dir.exists():
                print(f"⚠ Skipping {platform} - directory not found")
                continue
            
            # Map platform name to Buffer service name
            service_map = {
                "facebook": "facebook",
                "instagram": "instagram", 
                "linkedin": "linkedin"
            }
            service = service_map.get(platform)
            
            if service not in channel_map:
                print(f"⚠ Skipping {platform} - no channel found in Buffer")
                continue
            
            channel_id = channel_map[service]
            print(f"\n📱 Processing {platform.upper()} (channel: {channel_id}):")
            
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
                
                image_url = None
                if "image" in post_data:
                    # For now, use local file path - Buffer will need to handle this
                    image_url = str(post_data["image"])
                    print(f"  ℹ Post {post_num}: Image at {image_url}")
                
                # Create post
                try:
                    result = self.create_post(channel_id, text, image_url)
                    if result:
                        print(f"  ✓ Post {post_num} created (ID: {result['id']})")
                        total_posts += 1
                    else:
                        print(f"  ✗ Failed to create post {post_num}")
                except Exception as e:
                    print(f"  ✗ Error with post {post_num}: {e}")
        
        print(f"\n✓ Successfully created {total_posts} posts!")
        return True

def main():
    print("🚀 Buffer GraphQL Post Uploader")
    print(f"📧 Target email: {EMAIL}")
    print(f"📁 Source: {SOCIAL_CONTENT_BASE}\n")
    
    poster = BufferGraphQLPoster(BUFFER_API_TOKEN)
    
    try:
        poster.process_social_content()
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
