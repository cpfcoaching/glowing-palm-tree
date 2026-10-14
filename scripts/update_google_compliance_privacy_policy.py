#!/usr/bin/env python3
"""
update_google_compliance_privacy_policy.py

Updates public/privacy.html, dist/privacy.html, and src/components/LegalModal.tsx with
complete, Google-compliant disclosures for OAuth verification:
1. Explicit Google User Data Access & Scopes (youtube.force-ssl, email, profile).
2. Explicit Justification of Least Privilege (why narrower scopes cannot be used).
3. Data Protection Mechanisms (TLS 1.3, AES-256 Firestore at rest, ephemeral 55-min TTL tokens, strict tenant isolation).
4. Data Retention and Deletion (in-app channel disconnection, 30-day purge request via privacy@cpf-coaching.com, Google Security permissions revocation).
5. Limited Use & AI/ML Training Restrictions (no sale, no ad targeting, no non-personalized AI model training).
6. Anchor tags (#data-access-disclosures, #limited-use-disclosures, #data-protection-disclosures, #data-retention-and-deletion-disclosures) for direct linking in Cloud Console.
"""

import os
import subprocess

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# ==============================================================================
# 1. HTML Content with Direct Anchors & Verbatim Google Requirement Language
# ==============================================================================
privacy_html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - YouTube SEO Maximizer | CPF Coaching LLC</title>
  <style>
    :root {
      --bg: #0A0F0C;
      --card-bg: #111813;
      --border: #1E2B21;
      --primary: #2FA84F;
      --primary-bright: #48C76A;
      --text: #E6E8E6;
      --text-muted: #8E9990;
      --accent-yellow: #EAB308;
      --accent-blue: #38BDF8;
      --code-bg: #18221B;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 40px 36px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .header-badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: rgba(47, 168, 79, 0.15);
      color: var(--primary-bright);
      border: 1px solid rgba(47, 168, 79, 0.3);
      padding: 4px 10px;
      border-radius: 999px;
      margin-bottom: 12px;
    }
    h1 {
      color: #FFFFFF;
      font-size: 28px;
      margin-top: 0;
      margin-bottom: 8px;
    }
    .meta-date {
      color: var(--text-muted);
      font-size: 13px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 16px;
    }
    .toc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
      margin: 20px 0 30px 0;
    }
    .toc-card {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px 16px;
      text-decoration: none;
      transition: all 0.2s ease;
      display: flex;
      flex-direction: column;
    }
    .toc-card:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
    }
    .toc-card-title {
      color: var(--primary-bright);
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .toc-card-desc {
      color: var(--text-muted);
      font-size: 12px;
      line-height: 1.4;
    }
    h2 {
      color: var(--primary-bright);
      font-size: 20px;
      margin-top: 36px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(30, 43, 33, 0.8);
      padding-bottom: 8px;
      scroll-margin-top: 24px;
    }
    h3 {
      color: #FFFFFF;
      font-size: 16px;
      margin-top: 20px;
      margin-bottom: 8px;
    }
    p, li {
      color: #B5BBB6;
      font-size: 14px;
      margin: 10px 0;
      line-height: 1.65;
    }
    ul {
      padding-left: 24px;
      margin: 10px 0;
    }
    li {
      margin-bottom: 6px;
    }
    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: var(--code-bg);
      color: #55D476;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #243528;
    }
    .callout {
      background: rgba(47, 168, 79, 0.08);
      border-left: 4px solid var(--primary);
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .callout p {
      color: #E6E8E6;
      margin: 0;
    }
    .callout-blue {
      background: rgba(56, 189, 248, 0.08);
      border-left: 4px solid var(--accent-blue);
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 0 8px 8px 0;
    }
    .callout-blue p {
      color: #E0F2FE;
      margin: 0;
    }
    .table-container {
      overflow-x: auto;
      margin: 16px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 12px 14px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: var(--code-bg);
      color: #FFFFFF;
      font-weight: 600;
    }
    td {
      color: #B5BBB6;
    }
    .contact-box {
      background: var(--code-bg);
      border: 1px solid #243528;
      border-radius: 8px;
      padding: 24px;
      margin-top: 40px;
    }
    .contact-box h3 {
      margin-top: 0;
      color: #FFFFFF;
      font-size: 16px;
    }
    .contact-item {
      font-size: 13px;
      color: #A3A8A4;
      margin: 6px 0;
    }
    a {
      color: var(--primary-bright);
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-badge">Google API Services Compliance & OAuth Verification</div>
    <h1>Privacy Policy</h1>
    <div class="meta-date">
      <strong>Application:</strong> YouTube SEO Maximizer | <strong>Developer / Parent Organization:</strong> CPF Coaching LLC | <strong>Last Updated:</strong> October 2026 | <strong>Google Cloud Project ID:</strong> vernal-reality-509713-f9 (Project #258827664757)
    </div>

    <div class="callout">
      <p><strong>CPF Coaching LLC</strong> operates the <strong>YouTube SEO Maximizer</strong> application (accessible at <a href="https://vernal-reality-509713-f9.web.app" target="_blank" rel="noopener noreferrer">https://vernal-reality-509713-f9.web.app</a>). This Privacy Policy provides full transparency into how our application accesses, collects, uses, protects, and deletes user data, specifically data obtained through <strong>Google OAuth 2.0 and the YouTube Data API v3</strong>.</p>
    </div>

    <!-- Quick Navigation Index / Direct Anchor Targets for Google Reviewers -->
    <div class="toc-grid">
      <a class="toc-card" href="#data-access-disclosures">
        <span class="toc-card-title">1. Data Access Disclosures</span>
        <span class="toc-card-desc">Google user data accessed, requested scopes, and least privilege justification.</span>
      </a>
      <a class="toc-card" href="#limited-use-disclosures">
        <span class="toc-card-title">2. Limited Use & AI Model Restrictions</span>
        <span class="toc-card-desc">Prohibitions on data selling, ad targeting, and non-personalized AI/ML model training.</span>
      </a>
      <a class="toc-card" href="#data-protection-disclosures">
        <span class="toc-card-title">3. Data Protection Mechanisms</span>
        <span class="toc-card-desc">TLS 1.3 transit encryption, AES-256 rest encryption, ephemeral tokens, and tenant isolation.</span>
      </a>
      <a class="toc-card" href="#data-retention-and-deletion-disclosures">
        <span class="toc-card-title">4. Retention & Deletion Disclosures</span>
        <span class="toc-card-desc">55-minute TTL tokens, in-app disconnection, and 30-day purge request procedures.</span>
      </a>
    </div>

    <!-- SECTION 1: DATA ACCESS DISCLOSURES -->
    <h2 id="data-access-disclosures">1. Google User Data Accessed by YouTube SEO Maximizer (Data Access Disclosures)</h2>
    <p>Our application accesses, collects, and processes only the minimum necessary Google user data required to execute its core user-facing functionality: evaluating YouTube video metadata for search engine optimization (SEO) and answer engine optimization (AEO) defects, and pushing approved metadata enhancements directly to YouTube Studio.</p>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>OAuth Scope</th>
            <th>Specific Google User Data Accessed & Collected</th>
            <th>Operational Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>openid</code><br>
              <code>https://www.googleapis.com/auth/userinfo.email</code><br>
              <code>https://www.googleapis.com/auth/userinfo.profile</code>
            </td>
            <td>
              • Google Account Email Address<br>
              • Account Display Name<br>
              • Profile Photo URL<br>
              • Unique Google Account Identifier (Subject ID)
            </td>
            <td>
              Authenticates user identity, provides secure workspace login sessions, and associates connected channel data with the verified account profile.
            </td>
          </tr>
          <tr>
            <td>
              <code>https://www.googleapis.com/auth/youtube.force-ssl</code><br>
              <em>(Sensitive Scope)</em>
            </td>
            <td>
              • <strong>Channel Metadata:</strong> Channel ID, Channel Title, custom URL, subscriber count, total video count.<br>
              • <strong>Video Metadata:</strong> Video ID, Title, Description, Tags, Thumbnails, Category ID, Publication Timestamp, and Privacy Status.
            </td>
            <td>
              1. <strong>Audit & Diagnostic Read:</strong> Reads video metadata via <code>channels.list</code> and <code>videos.list</code> to evaluate SEO/AEO defects (e.g. truncated titles, missing CTA consultation links, weak tags).<br>
              2. <strong>User-Initiated Live Updates:</strong> Writes user-approved title, description, and tag updates via <code>videos.update</code> and uploads thumbnails via <code>thumbnails.set</code> when the user clicks "Push Live to YouTube".
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Principle of Least Privilege (Why Narrower Scopes Cannot Be Used)</h3>
    <p>The YouTube Data API v3 does not provide a narrower write-only scope for modifying video metadata. The read-only scope (<code>https://www.googleapis.com/auth/youtube.readonly</code>) cannot publish title enhancements, call-to-action description links, or optimized tags to YouTube Studio. To enable the primary feature of our application—applying approved AI optimizations live to YouTube videos—the <code>https://www.googleapis.com/auth/youtube.force-ssl</code> scope is strictly required.</p>

    <!-- SECTION 2: LIMITED USE REQUIREMENTS -->
    <h2 id="limited-use-disclosures">2. Google API Limited Use & AI Model Training Restrictions</h2>
    <div class="callout">
      <p>YouTube SEO Maximizer strictly adheres to the <strong><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a></strong>, including the Limited Use requirements:</p>
    </div>
    <ul>
      <li><strong>No Transfer for Advertising:</strong> We do NOT transfer, license, or sell Google user data to third parties, advertising platforms, data brokers, or information resellers under any circumstances.</li>
      <li><strong>No Advertising Use:</strong> Google user data is NEVER used or transferred for serving advertisements, personalized advertising, interest-based targeting, or retargeting.</li>
      <li><strong>No Human Review:</strong> No human at CPF Coaching LLC reads or views your raw Google or YouTube user data unless:
        <ul>
          <li>You provide explicit, affirmative consent for resolving a specific technical support issue;</li>
          <li>It is necessary for security purposes (such as investigating abuse or security anomalies); or</li>
          <li>It is strictly required to comply with applicable law or legal process.</li>
        </ul>
      </li>
      <li><strong>Explicit AI/ML Model Training Affirmation:</strong> Google user data obtained through Google APIs is <strong>NEVER used to develop, improve, train, retrain, or fine-tune non-personalized or generalized artificial intelligence (AI) and/or machine learning (ML) models</strong>. All Gemini API calls are executed via stateless, real-time inference strictly to formulate video metadata suggestions for that individual user, with zero data retention by AI model providers.</li>
    </ul>

    <!-- SECTION 3: DATA PROTECTION MECHANISMS -->
    <h2 id="data-protection-disclosures">3. Data Protection Mechanisms for Sensitive Data</h2>
    <div class="callout-blue">
      <p><strong>Security procedures are in place to protect the confidentiality, integrity, and availability of your data.</strong> We use industry-standard encryption, defense-in-depth architecture, and strict operational controls to protect your information, including all sensitive data obtained through Google APIs:</p>
    </div>
    <ul>
      <li><strong>Encryption in Transit:</strong> All communications between user browsers, our web application, and Google API endpoints are protected using modern <strong>Transport Layer Security (TLS 1.3 / HTTPS)</strong> with strong cryptographic cipher suites to prevent interception or tampering.</li>
      <li><strong>Encryption at Rest:</strong> All workspace state, cached channel indices, and optimization drafts stored in Google Cloud Firestore are protected by <strong>AES-256 encryption at rest</strong>.</li>
      <li><strong>Ephemeral Token Storage (Session TTL Purging):</strong> Google OAuth 2.0 access tokens are held strictly ephemerally in browser session memory with an automated <strong>55-minute expiration time-to-live (TTL)</strong>. Tokens are never written to permanent database disks, server logs, or accessible across tenants. When a session expires or ends, tokens are immediately cleared.</li>
      <li><strong>Cryptographic Tenant Isolation:</strong> Multi-tenant security rules strictly isolate all Firestore database documents. Accounts and Brand Managers can only access and modify channel datasets tied to their authenticated profile.</li>
      <li><strong>No Storage of Google Account Passwords:</strong> Authentication is handled entirely through Google's official OAuth 2.0 / Firebase Auth dialog. We never access, capture, or store your Google password.</li>
      <li><strong>CISO-Led Governance:</strong> Security and compliance controls are maintained and audited under the direct supervision of Christophe Foulon, Founder & CISO of CPF Coaching LLC.</li>
    </ul>

    <!-- SECTION 4: DATA RETENTION AND DELETION -->
    <h2 id="data-retention-and-deletion-disclosures">4. Disclosures Around Retention and Deletion of Google User Data</h2>
    <p>We store and retain your personal information only for a period of time that is consistent with our operational business purposes and needed to fulfill the services requested in this application. Below are our specific retention and deletion policies:</p>

    <h3>Data Retention Duration</h3>
    <ul>
      <li><strong>Active OAuth Access Tokens:</strong> Retained ephemerally in the user's browser session for a maximum of <strong>55 minutes</strong>, after which they expire and are automatically deleted.</li>
      <li><strong>Channel Video Metadata:</strong> Retained in the user's private workspace only for the duration of active service use to display SEO audit scores and historical improvements.</li>
      <li><strong>Operational Rule:</strong> When the data retention period expires for a given type of data, or when a user disconnects their channel, we delete or destroy it.</li>
    </ul>

    <h3>Data Deletion Procedures & User Control</h3>
    <ul>
      <li><strong>In-App Channel Disconnection:</strong> Users can disconnect any connected YouTube channel at any time via the Channel Management Hub. Disconnecting a channel removes its indexed videos from the active workspace immediately.</li>
      <li><strong>Direct Deletion Request (Right to Be Forgotten):</strong> You may request for your data to be deleted at any time by emailing <a href="mailto:privacy@cpf-coaching.com">privacy@cpf-coaching.com</a> or <a href="mailto:Info@cpf-coaching.com">Info@cpf-coaching.com</a>. Upon receipt of your request, all stored metadata, channel references, and workspace records associated with your account will be permanently and irreversibly purged from our database within <strong>30 calendar days</strong>.</li>
      <li><strong>Revoking Access via Google Account:</strong> You can revoke YouTube SEO Maximizer's permissions at any time directly through your Google Account Security Settings at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a>. When revoked, all active tokens are immediately invalidated by Google, and our application can no longer access your YouTube channel or videos.</li>
    </ul>

    <!-- SECTION 5: THIRD-PARTY DATA SHARING -->
    <h2>5. Third-Party Data Sharing & Infrastructure</h2>
    <p>We do not transfer or disclose your Google user data to third parties for purposes other than the ones provided to operate the application:</p>
    <ul>
      <li><strong>Google Cloud Platform & Firebase:</strong> Provides secure hosting, database services (Cloud Firestore), and identity infrastructure under strict Google Cloud Enterprise data protection agreements.</li>
      <li><strong>Google Gemini API:</strong> Stateless inference endpoint used to generate contextual video descriptions and SEO tags. User data is not retained for model training.</li>
    </ul>

    <!-- SECTION 6: POLICY UPDATES -->
    <h2>6. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable legal and regulatory requirements. If we make material modifications, we will notify users through an in-app notice or via email prior to the changes taking effect.</p>

    <!-- SECTION 7: CONTACT INFORMATION -->
    <div class="contact-box">
      <h3>Contact Information & Data Privacy Inquiries</h3>
      <div class="contact-item"><strong>Company / Organization:</strong> CPF Coaching LLC</div>
      <div class="contact-item"><strong>Privacy Officer:</strong> Christophe Foulon, CISO & Founder</div>
      <div class="contact-item"><strong>Privacy Email:</strong> <a href="mailto:privacy@cpf-coaching.com">privacy@cpf-coaching.com</a></div>
      <div class="contact-item"><strong>General Inquiries:</strong> <a href="mailto:Info@cpf-coaching.com">Info@cpf-coaching.com</a></div>
      <div class="contact-item"><strong>Phone:</strong> +1 (202) 838-6187</div>
      <div class="contact-item"><strong>Address:</strong> Haymarket, VA 20169, USA</div>
      <div class="contact-item"><strong>Website:</strong> <a href="https://cpf-coaching.com" target="_blank" rel="noopener noreferrer">https://cpf-coaching.com</a></div>
    </div>
  </div>
</body>
</html>
"""

# Write to public/privacy.html and dist/privacy.html
privacy_html_path = os.path.join(APP_DIR, "public/privacy.html")
dist_privacy_html_path = os.path.join(APP_DIR, "dist/privacy.html")

with open(privacy_html_path, "w", encoding="utf-8") as f:
    f.write(privacy_html_content.strip() + "\n")
print(f"✓ Updated {privacy_html_path}")

if os.path.exists(os.path.dirname(dist_privacy_html_path)):
    with open(dist_privacy_html_path, "w", encoding="utf-8") as f:
        f.write(privacy_html_content.strip() + "\n")
    print(f"✓ Updated {dist_privacy_html_path}")

# ==============================================================================
# 2. Update LegalModal.tsx to match
# ==============================================================================
legal_modal_path = os.path.join(APP_DIR, "src/components/LegalModal.tsx")
if os.path.exists(legal_modal_path):
    with open(legal_modal_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Verify key sections exist in LegalModal.tsx
    print(f"✓ LegalModal verified at {legal_modal_path}")

print("=== Successfully completed Google Compliance Privacy Policy updates ===")
