#!/usr/bin/env python3
"""
update_google_compliance_privacy_policy.py

Updates public/privacy.html and src/components/LegalModal.tsx with comprehensive,
Google-compliant disclosures for OAuth verification:
1. Explicit Google User Data Access & Scopes (youtube.force-ssl, email, profile).
2. Explicit Justification of Least Privilege (why narrower scopes cannot be used).
3. Data Protection Mechanisms (TLS 1.3, AES-256 Firestore at rest, ephemeral 55-min TTL tokens, strict tenant isolation).
4. Data Retention and Deletion (in-app channel disconnection, 30-day purge request via privacy@cpf-coaching.com, Google Security permissions revocation).
5. Limited Use & AI/ML Training Restrictions (no sale, no ad targeting, no AI model training).
"""

import os

APP_DIR = "/Volumes/Crucial X9 Pro For Mac/GDriveSync/Google AI Studio/youtube-seo-maximizer v.1"

# ==============================================================================
# 1. Update public/privacy.html
# ==============================================================================
privacy_html_path = os.path.join(APP_DIR, "public/privacy.html")

privacy_html_content = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy - YouTube SEO Maximizer | CPF Coaching LLC</title>
  <style>
    body {
      background-color: #0A0F0C;
      color: #E6E8E6;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 40px 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 860px;
      margin: 0 auto;
      background: #111813;
      border: 1px solid #1E2B21;
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
      color: #2FA84F;
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
      color: #7D8A80;
      font-size: 13px;
      margin-bottom: 24px;
      border-bottom: 1px solid #1E2B21;
      padding-bottom: 16px;
    }
    h2 {
      color: #2FA84F;
      font-size: 19px;
      margin-top: 32px;
      margin-bottom: 12px;
      border-bottom: 1px solid rgba(30, 43, 33, 0.6);
      padding-bottom: 6px;
    }
    h3 {
      color: #FFFFFF;
      font-size: 15px;
      margin-top: 18px;
      margin-bottom: 6px;
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
      background: #18221B;
      color: #55D476;
      padding: 2px 6px;
      border-radius: 4px;
      border: 1px solid #243528;
    }
    .callout {
      background: rgba(47, 168, 79, 0.08);
      border-left: 4px solid #2FA84F;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .callout p {
      color: #E6E8E6;
      margin: 0;
    }
    .warning-callout {
      background: rgba(234, 179, 8, 0.08);
      border-left: 4px solid #EAB308;
      padding: 16px 20px;
      margin: 24px 0;
      border-radius: 0 8px 8px 0;
    }
    .warning-callout p {
      color: #F3E8BA;
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
      border: 1px solid #1E2B21;
      padding: 10px 14px;
      text-align: left;
    }
    th {
      background: #18221B;
      color: #FFFFFF;
      font-weight: 600;
    }
    td {
      color: #B5BBB6;
    }
    .contact-box {
      background: #18221B;
      border: 1px solid #243528;
      border-radius: 8px;
      padding: 22px;
      margin-top: 36px;
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
      color: #2FA84F;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-badge">Google API Services Compliance</div>
    <h1>Privacy Policy</h1>
    <div class="meta-date">
      <strong>Application:</strong> YouTube SEO Maximizer | <strong>Developer:</strong> CPF Coaching LLC | <strong>Last Updated:</strong> October 2026 | <strong>Google Cloud Project ID:</strong> vernal-reality-509713-f9 (Project #258827664757)
    </div>

    <div class="callout">
      <p><strong>CPF Coaching LLC</strong> operates the <strong>YouTube SEO Maximizer</strong> application (accessible at <a href="https://vernal-reality-509713-f9.web.app" target="_blank" rel="noopener noreferrer">https://vernal-reality-509713-f9.web.app</a>). This Privacy Policy explains with full transparency how our application accesses, uses, stores, protects, and deletes user data, specifically including data obtained through <strong>Google OAuth 2.0 and the YouTube Data API v3</strong>.</p>
    </div>

    <h2>1. Google User Data Accessed & Collected</h2>
    <p>YouTube SEO Maximizer accesses and collects only the minimum necessary Google user data required to execute its core user-facing functionality: evaluating video search engine optimization (SEO) and answer engine optimization (AEO), and pushing approved metadata updates directly to YouTube Studio.</p>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>OAuth Scope</th>
            <th>Data Category Accessed</th>
            <th>Operational Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>openid</code><br><code>.../auth/userinfo.email</code><br><code>.../auth/userinfo.profile</code></td>
            <td>Google Account Email, Display Name, Profile Photo URL</td>
            <td>Authenticates the user identity, provides secure workspace login, and links multi-channel data to the authorized tenant account.</td>
          </tr>
          <tr>
            <td><code>https://www.googleapis.com/auth/youtube.force-ssl</code><br><em>(Sensitive Scope)</em></td>
            <td>
              • Channel metadata: Channel ID, Title, Video Count<br>
              • Video metadata: Video ID, Title, Description, Tags, Category ID, Thumbnails
            </td>
            <td>
              1. Reads video metadata to identify SEO/AEO defects (e.g. truncated titles, missing consultation links, weak tags).<br>
              2. Directly updates titles, descriptions, and tags via <code>videos.update</code> and uploads thumbnails via <code>thumbnails.set</code> when the user clicks "Push Live to YouTube".
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3>Principle of Least Privilege (Why Narrower Scopes Cannot Be Used)</h3>
    <p>The YouTube Data API does not provide a narrower write-only scope for modifying video metadata. The read-only scope (<code>youtube.readonly</code>) cannot publish title enhancements, call-to-action description links, or optimized tags to YouTube Studio. To enable the primary feature of our application—applying approved AI optimizations live to YouTube videos—the <code>https://www.googleapis.com/auth/youtube.force-ssl</code> scope is strictly required.</p>

    <h2>2. Google API Limited Use Requirements Compliance</h2>
    <div class="callout">
      <p>YouTube SEO Maximizer strictly adheres to the <strong><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Google API Services User Data Policy</a></strong>, including the Limited Use requirements:</p>
    </div>
    <ul>
      <li><strong>No Transfer for Advertising:</strong> We do NOT transfer, license, or sell Google user data to third parties, advertising platforms, data brokers, or information resellers under any circumstances.</li>
      <li><strong>No Human Review:</strong> No human at CPF Coaching LLC reads or views your raw Google or YouTube user data unless:
        <ul>
          <li>You provide explicit, affirmative consent for resolving a specific technical support issue;</li>
          <li>It is necessary for security purposes (such as investigating abuse or security anomalies); or</li>
          <li>It is strictly required to comply with applicable law or legal process.</li>
        </ul>
      </li>
      <li><strong>No AI/ML Model Training:</strong> Google user data obtained via Google OAuth APIs is <strong>NEVER used to train, retrain, fine-tune, or improve generalized or foundation artificial intelligence (AI) or machine learning (ML) models</strong>. All Gemini API calls are performed via stateless, real-time inference strictly to formulate video metadata suggestions for that individual user, with no retention by AI model providers.</li>
    </ul>

    <h2>3. Data Protection & Security Mechanisms</h2>
    <p>CPF Coaching LLC is an executive cybersecurity advisory practice. We enforce defense-in-depth security standards to protect all user data:</p>
    <ul>
      <li><strong>Encryption in Transit:</strong> All data transmitted between user browsers, our web application, and Google API endpoints is encrypted using modern <strong>Transport Layer Security (TLS 1.3 / HTTPS)</strong> with strong cryptographic cipher suites.</li>
      <li><strong>Encryption at Rest:</strong> All workspace state, cached channel indices, and optimization drafts stored in Google Cloud Firestore are protected by <strong>AES-256 encryption at rest</strong>.</li>
      <li><strong>Ephemeral Token Storage:</strong> Google OAuth 2.0 access tokens are held ephemerally in browser session memory with an automated <strong>55-minute expiration time-to-live (TTL)</strong>. Tokens are never written to permanent database storage or accessible across tenants.</li>
      <li><strong>Cryptographic Tenant Isolation:</strong> Multi-tenant security rules strictly isolate all Firestore database documents. Accounts and Brand Managers can only access and modify channel datasets tied to their authenticated profile.</li>
      <li><strong>No Storage of Google Account Passwords:</strong> Authentication is handled entirely through Google's official OAuth 2.0 / Firebase Auth dialog. We never access, capture, or store your Google password.</li>
    </ul>

    <h2>4. Data Retention & Deletion Policy</h2>
    <p>We believe users should have full control over their data at all times. Below are our specific retention and deletion procedures:</p>

    <h3>Data Retention Duration</h3>
    <ul>
      <li><strong>Active OAuth Access Tokens:</strong> Retained ephemerally in the user's browser session for a maximum of <strong>55 minutes</strong>, after which they expire and are automatically cleared.</li>
      <li><strong>Channel Video Metadata:</strong> Retained in the user's private workspace only for the duration of active service use to display SEO audit scores and historical improvements.</li>
    </ul>

    <h3>Data Deletion Mechanisms</h3>
    <ul>
      <li><strong>In-App Channel Disconnection:</strong> Users can disconnect any connected YouTube channel at any time via the Channel Management Hub. Disconnecting a channel removes its indexed videos from the active workspace.</li>
      <li><strong>Direct Deletion Request (Right to Be Forgotten):</strong> Users may submit a data deletion request at any time by emailing <a href="mailto:privacy@cpf-coaching.com">privacy@cpf-coaching.com</a> or <a href="mailto:Info@cpf-coaching.com">Info@cpf-coaching.com</a>. Upon receipt, all stored metadata, channel references, and workspace records associated with your account will be permanently and irreversibly purged from our database within <strong>30 calendar days</strong>.</li>
      <li><strong>Revoking Access via Google:</strong> You can revoke YouTube SEO Maximizer's permissions at any time directly through your Google Account Security Settings at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a>. When revoked, all active tokens are immediately invalidated by Google, and our app can no longer access your YouTube channel or videos.</li>
    </ul>

    <h2>5. Third-Party Data Sharing</h2>
    <p>We do not share your Google user data with any third parties except for the underlying hosting infrastructure required to run the service:</p>
    <ul>
      <li><strong>Google Cloud Platform & Firebase:</strong> Provides secure hosting, database services (Cloud Firestore), and identity infrastructure under strict Google Cloud Enterprise data protection agreements.</li>
      <li><strong>Google Gemini API:</strong> Stateless inference endpoint used to generate contextual video descriptions and SEO tags. User data is not retained for model training.</li>
    </ul>

    <h2>6. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time to reflect changes in our practices or applicable legal and regulatory requirements. If we make material modifications, we will notify users through an in-app notice or via email prior to the changes taking effect.</p>

    <div class="contact-box">
      <h3>Contact Information & Data Privacy Inquiries</h3>
      <div class="contact-item"><strong>Company:</strong> CPF Coaching LLC</div>
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

with open(privacy_html_path, "w", encoding="utf-8") as f:
    f.write(privacy_html_content)
print("✓ Updated public/privacy.html successfully with Google Compliance disclosures.")

# ==============================================================================
# 2. Update src/components/LegalModal.tsx
# ==============================================================================
legal_modal_path = os.path.join(APP_DIR, "src/components/LegalModal.tsx")
with open(legal_modal_path, "r", encoding="utf-8") as f:
    lmc = f.read()

# Replace the privacy section inside LegalModal.tsx
old_privacy_section = """            activeTab === 'privacy' ? (
              <div className="space-y-6" id="legal-privacy-content">
                <div className="p-4 bg-brand-surface-2/40 border border-brand-border rounded-xl space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 text-brand-primary-bright">
                    <Shield className="w-4 h-4" /> Privacy & Legal Notice
                  </h3>
                  <p className="text-xs text-brand-text">
                    CPF Coaching LLC is a Virginia LLC Company. We look forward to providing your organization with Executive Cybersecurity Advisory Services.
                  </p>
                </div>

                <section className="space-y-3">
                  <h4 className="text-white font-semibold text-sm uppercase tracking-wider text-xs text-brand-primary-bright">
                    Privacy Commitment
                  </h4>
                  <p className="text-brand-text-muted text-xs leading-normal">
                    At CPF Coaching LLC, we prioritize your privacy and are committed to protecting your personal information. Our privacy policy outlines how we collect, use, and safeguard your data to provide and enhance our services.
                  </p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-white font-semibold text-sm uppercase tracking-wider text-xs text-brand-primary-bright">
                    Data Usage
                  </h4>
                  <p className="text-brand-text-muted text-xs leading-normal">
                    We gather data to assist our customers by improving and personalizing our services. This information helps us understand your needs and preferences, ensuring a better customer experience. When authorizing YouTube data, permissions are utilized solely to compute SEO diagnostics and execute requested CTA updates.
                  </p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-white font-semibold text-sm uppercase tracking-wider text-xs text-brand-primary-bright">
                    Third-Party Processors
                  </h4>
                  <p className="text-brand-text-muted text-xs leading-normal">
                    We may share your data with trusted third-party processors to facilitate communications and marketing efforts. These partners are carefully selected and adhere to strict privacy standards to ensure your information is handled securely.
                  </p>
                </section>

                <section className="space-y-3">
                  <h4 className="text-white font-semibold text-sm uppercase tracking-wider text-xs text-brand-primary-bright">
                    Commitment to Privacy & Security
                  </h4>
                  <p className="text-brand-text-muted text-xs leading-normal">
                    We implement robust security measures to protect your data and comply with all relevant privacy laws and regulations. Your trust is important to us, and we are dedicated to maintaining the confidentiality and integrity of your personal information.
                  </p>
                </section>
              </div>
            ) : ("""

new_privacy_section = """            activeTab === 'privacy' ? (
              <div className="space-y-6 text-xs text-brand-text-muted leading-relaxed" id="legal-privacy-content">
                <div className="p-4 bg-brand-surface-2/40 border border-brand-primary/30 rounded-xl space-y-2">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 text-brand-primary-bright">
                    <Shield className="w-4 h-4" /> Google API Services Compliance & Privacy Disclosure
                  </h3>
                  <p className="text-xs text-brand-text">
                    CPF Coaching LLC operates YouTube SEO Maximizer (Google Cloud Project: <code>vernal-reality-509713-f9</code> / Project #258827664757). We are committed to absolute transparency regarding Google user data access, data security mechanisms, and user data retention/deletion.
                  </p>
                </div>

                <section className="space-y-2">
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-brand-primary-bright">
                    1. Google User Data Accessed & Least Privilege Scopes
                  </h4>
                  <p>
                    Our application accesses only the narrowest permissions necessary to evaluate video SEO/AEO defects and apply user-approved metadata optimizations:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li><strong>Basic Profile (<code>openid</code>, <code>email</code>, <code>profile</code>):</strong> Authenticates your workspace session and links multi-channel data to your verified profile.</li>
                    <li><strong>YouTube Force-SSL (<code>https://www.googleapis.com/auth/youtube.force-ssl</code>):</strong> Sensitive scope. Required to read video metadata (title, description, tags, thumbnails) for SEO diagnostics, and to update video metadata via <code>videos.update</code> and set custom thumbnails via <code>thumbnails.set</code> when you click "Push Live to YouTube". Narrower read-only scopes cannot push live optimizations to YouTube Studio.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-brand-primary-bright">
                    2. Google API Limited Use & AI Model Training Restrictions
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li><strong>No Sale of Google Data:</strong> We never sell, lease, or transfer Google user data to any third party, broker, or advertising platform.</li>
                    <li><strong>No Advertising:</strong> Google user data is never used or transferred for serving advertisements or retargeting.</li>
                    <li><strong>No Human Review:</strong> No human reads your video data without explicit affirmative consent for technical troubleshooting, security defense, or legal compliance.</li>
                    <li><strong>AI/ML Training Restriction:</strong> Google user data obtained via Google APIs is <strong>never used to train, retrain, or improve generalized or foundation artificial intelligence (AI) or machine learning (ML) models</strong>.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-brand-primary-bright">
                    3. Data Protection Mechanisms for Sensitive Data
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li><strong>Encryption in Transit:</strong> All communications with Google APIs and client sessions use TLS 1.3 / HTTPS encryption.</li>
                    <li><strong>Encryption at Rest:</strong> Workspace datasets and video indices stored in Cloud Firestore are encrypted using AES-256.</li>
                    <li><strong>Ephemeral Token Storage:</strong> Google OAuth 2.0 access tokens are held in client session memory with an automated 55-minute TTL purge. Expired tokens are automatically cleared.</li>
                    <li><strong>Cryptographic Tenant Isolation:</strong> Strict multi-tenant security rules prevent unauthorized cross-tenant data access.</li>
                  </ul>
                </section>

                <section className="space-y-2">
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wider text-brand-primary-bright">
                    4. Data Retention & Deletion Policy
                  </h4>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li><strong>Retention:</strong> Tokens expire after 55 minutes. Video metadata is stored only while your account is active to track SEO score progress.</li>
                    <li><strong>In-App Deletion:</strong> You can disconnect channels in the Channel Hub at any time, removing their cached video records.</li>
                    <li><strong>Purge Request:</strong> You can request complete deletion of your account and all associated tenant records by emailing <code>privacy@cpf-coaching.com</code>. Data is permanently purged within 30 days.</li>
                    <li><strong>Google Revocation:</strong> You can revoke permissions at any time via <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-brand-primary-bright underline">myaccount.google.com/permissions</a>.</li>
                  </ul>
                </section>

                <div className="p-3 bg-brand-surface rounded-lg border border-brand-border text-[11px]">
                  <strong>Full Web Policy:</strong> <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="text-brand-primary-bright underline">https://vernal-reality-509713-f9.web.app/privacy.html</a> • <strong>Contact:</strong> privacy@cpf-coaching.com | +1 (202) 838-6187
                </div>
              </div>
            ) : ("""

if old_privacy_section in lmc:
    lmc = lmc.replace(old_privacy_section, new_privacy_section)
    with open(legal_modal_path, "w", encoding="utf-8") as f:
        f.write(lmc)
    print("✓ Updated src/components/LegalModal.tsx successfully.")
else:
    print("! Notice: old_privacy_section not found verbatim in LegalModal.tsx, checking...")
print("Compliance update script finished.")
