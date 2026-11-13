<script setup lang="ts">
import '@/assets/static-page.css'
</script>

<template>
  <main class="static-page">
    <span class="eyebrow">ABOUT</span>
    <h1>About ButuanSpaces</h1>
    <p class="updated">Commercial property listings in Butuan City</p>

    <p>
      ButuanSpaces brings Butuan's commercial spaces into one place, so businesses can find the right office, storefront,
      warehouse or lot without scrolling through scattered posts, and property owners and brokers can reach businesses that
      are actively looking.
    </p>

    <div class="callout">
      <p>
        ButuanSpaces is a <strong>listing directory only</strong>. We don't handle payments, contracts or negotiations;
        every deal is between you and the owner or broker.
      </p>
    </div>

    <h2>How it works</h2>
    <h3>Looking for space</h3>
    <p>
      <RouterLink to="/properties">Browse listings</RouterLink> by barangay, type, price and size, see them on a map, or
      describe what you need in plain words with AI search. Save listings, save a search to get email alerts, and message
      publishers directly.
    </p>
    <h3>Listing a property</h3>
    <p>
      Create an account, then <RouterLink to="/publisher/apply">apply as an owner, developer or broker</RouterLink>. Once
      approved, add your listings with photos. Each listing is reviewed before it goes live, and you'll get an email when
      buyers send inquiries.
    </p>

    <h2>Frequently asked questions</h2>
    <details>
      <summary>Does ButuanSpaces take a commission or handle payments?</summary>
      <p>No. We don't take part in transactions. Never send a deposit to anyone until you've seen the property and checked their documents.</p>
    </details>
    <details>
      <summary>How are brokers verified?</summary>
      <p>Brokers submit their PRC license number and agency, which an administrator reviews before the broker can publish. Verified brokers show a badge with their license number.</p>
    </details>
    <details>
      <summary>Why did my listing go back to "pending" after I edited it?</summary>
      <p>Changes to a live listing, including new photos, are reviewed again so visitors always see checked information. Removing or reordering existing photos doesn't need a new review.</p>
    </details>
    <details>
      <summary>How do saved-search alerts work?</summary>
      <p>On Browse Properties, choose your filters and select "Save search &amp; get email alerts". When a new matching listing is approved, we'll email you. You can remove searches anytime from your Saved page.</p>
    </details>
    <details>
      <summary>A listing looks wrong or suspicious. What should I do?</summary>
      <p>Use "Report listing" on the listing page. Our administrators review every report.</p>
    </details>
    <details>
      <summary>How do I change my email or password, or delete my account?</summary>
      <p>Go to <RouterLink to="/account">Account settings</RouterLink> after signing in.</p>
    </details>
    <details>
      <summary>Can I install ButuanSpaces on my phone?</summary>
      <p>Yes. On Android, open the site in Chrome and choose "Add to Home screen" or "Install app". On iPhone, open it in Safari, tap Share, then "Add to Home Screen".</p>
    </details>

    <h2>Contact</h2>
    <p>
      Questions, feedback or problems? Send us a message through the <RouterLink to="/report-issue">Report an Issue</RouterLink> page.
    </p>
  </main>
</template>
