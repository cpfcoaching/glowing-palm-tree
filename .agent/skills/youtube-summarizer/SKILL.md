---
name: youtube-summarizer
description: "Extract transcripts from YouTube videos and generate comprehensive, detailed summaries using intelligent analysis frameworks"
category: content
risk: safe
source: community
tags: "[video, summarization, transcription, youtube, content-analysis]"
date_added: "2026-02-27"
---

# youtube-summarizer

## Purpose

This skill extracts transcripts from YouTube videos and generates comprehensive, verbose summaries using the STAR + R-I-S-E framework. It validates video availability, extracts transcripts using the `youtube-transcript-api` Python library, and produces detailed documentation capturing all insights, arguments, and key points.

## When to Use This Skill

This skill should be used when:

- User provides a YouTube video URL and wants a detailed summary
- User needs to document video content for reference without rewatching
- User wants to extract insights, key points, and arguments from educational content
- User needs transcripts from YouTube videos for analysis
- User asks to "summarize", "resume", or "extract content" from YouTube videos
- User wants comprehensive documentation prioritizing completeness over brevity

## Step 0: Discovery & Setup

Before processing videos, validate the environment and dependencies:

```bash
# Check if youtube-transcript-api is installed
python3 -c "import youtube_transcript_api" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "⚠️  youtube-transcript-api not found"
    # Offer to install
fi
```

**If dependency is missing, ask the user:**

```
youtube-transcript-api is required but not installed.

Would you like to install it now?
- [ ] Yes - Install with pip (pip install youtube-transcript-api)
- [ ] No - I'll install it manually
```

**If user selects "Yes":**

```bash
pip install youtube-transcript-api
```

## Main Workflow

### Step 1: Validate YouTube URL

**Supported URL Formats:**
- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

```bash
URL="$USER_PROVIDED_URL"

# Pattern 1: youtube.com/watch?v=VIDEO_ID
if echo "$URL" | grep -qE 'youtube\.com/watch\?v='; then
    VIDEO_ID=$(echo "$URL" | sed -E 's/.*[?&]v=([^&]+).*/\1/')
# Pattern 2: youtu.be/VIDEO_ID
elif echo "$URL" | grep -qE 'youtu\.be/'; then
    VIDEO_ID=$(echo "$URL" | sed -E 's/.*youtu\.be\/([^?]+).*/\1/')
else
    echo "❌ Invalid YouTube URL format"
    exit 1
fi

echo "📹 Video ID extracted: $VIDEO_ID"
```

### Step 2: Check Video & Transcript Availability

```python
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound
import sys

video_id = sys.argv[1]

try:
    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
    print(f"✅ Video accessible: {video_id}")
    print("📝 Available transcripts:")
    for transcript in transcript_list:
        print(f"  - {transcript.language} ({transcript.language_code})")
        if transcript.is_generated:
            print("    [Auto-generated]")

except TranscriptsDisabled:
    print(f"❌ Transcripts are disabled for video {video_id}")
    sys.exit(1)
except NoTranscriptFound:
    print(f"❌ No transcript found for video {video_id}")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error accessing video: {e}")
    sys.exit(1)
```

### Step 3: Extract Transcript

```python
from youtube_transcript_api import YouTubeTranscriptApi

video_id = "VIDEO_ID"

try:
    transcript = YouTubeTranscriptApi.get_transcript(
        video_id,
        languages=['en']  # Adjust as needed
    )

    full_text = " ".join([entry['text'] for entry in transcript])

    print("✅ Transcript extracted successfully")
    print(f"📊 Transcript length: {len(full_text)} characters")

    with open(f"/tmp/transcript_{video_id}.txt", "w") as f:
        f.write(full_text)

except Exception as e:
    print(f"❌ Error extracting transcript: {e}")
    exit(1)
```

### Step 4: Generate Comprehensive Summary

Apply the STAR + R-I-S-E framework to the extracted transcript:

1. **Load** the full transcript text
2. **Apply** the comprehensive summarization framework
3. **Ensure** output follows the defined structure:
   - Header with video metadata
   - Executive synthesis
   - Detailed section-by-section breakdown
   - Key insights and conclusions
   - Concepts and terminology
   - Resources and references

### Step 5: Format and Present Output

**Output Structure:**

```markdown
# [Video Title]

**Channel:** [Channel Name]
**URL:** [https://youtube.com/watch?v=VIDEO_ID]

## 📝 Detailed Summary

### [Topic 1]

[Comprehensive explanation with examples, data, quotes...]

#### [Subtopic 1.1]

[Detailed breakdown...]

## 📚 Concepts and Terminology

- **[Term 1]:** [Definition and context]
- **[Term 2]:** [Definition and context]

## 📌 Conclusion

[Final synthesis and takeaways]
```

## Error Handling

| Error | Message | Action |
|-------|---------|--------|
| Video not found | "❌ Video does not exist or is private" | Ask user to verify URL |
| Transcripts disabled | "❌ Transcripts are disabled for this video" | Cannot proceed |
| No transcript available | "❌ No transcript found" | Cannot proceed |
| Invalid URL | "❌ Invalid YouTube URL format" | Prompt user for correct format |

## Example Prompts

- "Summarize this YouTube video: https://youtu.be/dQw4w9WgXcQ"
- "Extract the key insights from this lecture: [URL]"
- "Create detailed notes from this tutorial video: [URL]"

**Version:** 1.2.0
**Last Updated:** 2026-02-02
