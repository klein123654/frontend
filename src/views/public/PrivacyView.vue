<script setup lang="ts">
import '@/assets/static-page.css'
</script>

<template>
  <main class="static-page">
    <span class="eyebrow">LEGAL</span>
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated 13 November 2026</p>

    <p>
      ButuanSpaces is an online directory of commercial properties in Butuan City. This policy explains what personal
      information we collect, why, who can see it, and the rights you have under the Philippine Data Privacy Act of 2012
      (Republic Act No. 10173).
    </p>

    <div class="callout">
      <p>
        <strong>In short:</strong> we collect only what's needed to run the directory, we don't sell your data, and
        ButuanSpaces never handles payments or contracts. Deals are made directly between you and the property owner or broker.
      </p>
    </div>

    <h2>Information we collect</h2>
    <h3>When you create an account</h3>
    <ul>
      <li>Your name, email address, password (stored only as a secure hash) and, if you choose, a mobile number.</li>
      <li>If you sign in with Google: your name and verified email address from your Google account.</li>
    </ul>
    <h3>When you contact a publisher</h3>
    <ul>
      <li>The name, email, phone number and message you put in an inquiry, and later replies in that conversation.</li>
    </ul>
    <h3>When you publish listings (owners, developers and brokers)</h3>
    <ul>
      <li>Listing details and photos, and the public contact details you choose to show (phone, email, Messenger, Viber).</li>
      <li>For brokers: your PRC license number and agency name, used to verify you. For publisher applications: the details you submit.</li>
    </ul>
    <h3>When you use the site</h3>
    <ul>
      <li>Saved properties and saved searches.</li>
      <li>Your IP address, used briefly to prevent abuse (for example, limiting repeated sign-in attempts) and, in hashed form, to count listing views without identifying you.</li>
      <li>Issue reports you send, including the name and email you provide.</li>
      <li>Privacy-friendly, cookie-free visit statistics and technical error reports, if enabled, to keep the site working well.</li>
    </ul>

    <h2>How we use it</h2>
    <ul>
      <li>To run your account and show your listings and profile to visitors.</li>
      <li>To deliver your inquiries and replies, and to email you about them.</li>
      <li>To send account emails: address confirmation, password resets, security notices, listing review results, availability reminders and the saved-search alerts you sign up for.</li>
      <li>To review listings and verify brokers before they appear publicly.</li>
      <li>To keep the site secure and fix problems.</li>
    </ul>

    <h2>AI features</h2>
    <p>
      Some features use an AI service (DeepSeek) to help: drafting listing descriptions, suggesting listing tags,
      summarising and prioritising inquiry messages for publishers, answering plain-language property searches, and writing
      market summaries from listing statistics. For these, the relevant text (for example, an inquiry message or search
      query) is sent to the AI provider for processing. Avoid putting sensitive personal information in messages.
    </p>

    <h2>Who can see your information</h2>
    <ul>
      <li><strong>Everyone:</strong> published listings, and a publisher's name, verification status and the contact details they chose to make public.</li>
      <li><strong>The publisher you contact:</strong> the details and messages in your inquiry.</li>
      <li><strong>ButuanSpaces administrators:</strong> account, listing, inquiry and report records, to moderate the directory and handle reports.</li>
      <li>
        <strong>Service providers that run the site for us:</strong> website and server hosting (Cloudflare, Render), database and
        photo storage (Supabase), email delivery (Brevo), the AI provider above, and Google if you use Google sign-in. They process
        data only to provide their service.
      </li>
    </ul>
    <p>We do not sell personal information or share it for advertising.</p>

    <h2>How long we keep it</h2>
    <p>
      We keep your information while your account is open. When you delete your account, we delete your account, saved items
      and listings (with their photos). Inquiries you sent stay with the publisher you contacted, but your name, email and phone
      number are removed from them. Some records may remain in backups for a limited time.
    </p>

    <h2>Your rights</h2>
    <p>Under the Data Privacy Act you may:</p>
    <ul>
      <li>Ask what personal information we hold about you and get a copy.</li>
      <li>Correct it. You can update your name, phone, email and password yourself in <RouterLink to="/account">Account settings</RouterLink>.</li>
      <li>Delete your account at any time from Account settings, or ask us to delete specific information.</li>
      <li>Object to processing, and file a complaint with the National Privacy Commission (privacy.gov.ph).</li>
    </ul>

    <h2>Security</h2>
    <p>
      Connections to the site are encrypted, passwords are hashed, and changing your password or email triggers a notice to
      your inbox. No system is perfectly secure, so please use a strong, unique password.
    </p>

    <h2>Contact us</h2>
    <p>
      For privacy questions or requests, send us a message through the <RouterLink to="/report-issue">Report an Issue</RouterLink>
      page and choose the "Privacy / Data Request" category. We aim to respond within 15 days.
    </p>

    <h2>Changes</h2>
    <p>If we change this policy, we'll update the date at the top. Significant changes will be announced on the site.</p>
  </main>
</template>
