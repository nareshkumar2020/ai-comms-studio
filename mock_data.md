# Mock Data & Stub Documentation

## Mock Service Stub Overview

The backend uses a `MockLLMService` stub (`mock_service.py`) when the application is run in mock mode. This stub simulates the behavior of a real LLM provider (like OpenAI) to allow predictable UI testing and development without incurring API costs or waiting for network requests.

The stub provides:
- **Capture:** Returns 3 variations of drafts instantly based on the provided parameters.
- **Refine:** Simulates standard text refinement actions such as shortening, expanding, altering tone, or making text more engaging. Quality metrics for the geenratedd draft will be shown.
- **Finalise:** Provides option to copy, download and push to local storage. 

## Mock Data Sets for Predictable Outputs

To trigger the real-world scenarios on Step 1: Capture, upload a `.txt` file or paste the following mock transcripts. Ensure that your form parameters (Content Type, Target Audience, Tone) match the intended use case for the best experience.

### Scenario 1: Q3 Financial Results
**Trigger Keyword:** `Q3 Financial Results`
**Recommended Settings:**
- Content Type: Email
- Tone: Professional
- Target Audience: Internal Employees

**Mock Transcript (Paste this or upload as a text file):**
```text
Welcome to the Q3 Financial Results call. We had a strong quarter with revenue growing by 15% year-over-year to $45 million. Our gross margins improved to 68% due to supply chain optimizations. However, customer acquisition costs increased by 5%. Next quarter, we are focusing on expanding our enterprise sales team and launching the new analytics dashboard. We expect a 20% growth in Q4.
```

### Scenario 2: New Product Launch (Project Nova)
**Trigger Keyword:** `Project Nova`
**Recommended Settings:**
- Content Type: Blog Post
- Tone: Marketing
- Target Audience: Customers

**Mock Transcript (Paste this or upload as a text file):**
```text
Today we are thrilled to announce Project Nova, our next-generation AI platform. Project Nova reduces processing times by up to 40% and integrates seamlessly with existing workflows. We've added robust support for unstructured data and a brand new visual pipeline builder. Beta testers reported a 2x increase in daily throughput. It will be generally available next Tuesday for all premium users.
```

### Scenario 3: Platform Outage / Incident Report
**Trigger Keyword:** `Incident Report`
**Recommended Settings:**
- Content Type: Technical Documentation
- Tone: Technical
- Target Audience: Developers

**Mock Transcript (Paste this or upload as a text file):**
```text
Incident Report for Oct 12: At 08:00 UTC, a database migration caused a primary node failure, resulting in 45 minutes of downtime for the European region. The engineering team rolled back the migration at 08:30 UTC and systems stabilized by 08:45 UTC. No data was lost. We are adding additional pre-flight checks to our CI/CD pipeline and increasing replication lag monitoring to prevent this in the future.
```

## How to test refinement
Once a draft is generated, you can test the mock refinement functionality by typing instructions such as:
- `"shorten"`: Truncates the text to 4 lines.
- `"longer"` / `"expand"`: Adds additional detailed sentences to the end of the text.
- `"engaging"`: Adds emojis and a call-to-action question.
- `"tone"`: Swaps Professional and Enthusiastic tones.
- `"dramatic"`: Replaces words with more impactful synonyms.
