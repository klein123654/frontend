
<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div>
        <h3>Butuan<span>Spaces</span></h3>
        <p>Connecting businesses with commercial spaces in Butuan City.</p>
      </div>

      <div>
        <h4>Explore</h4>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/properties">Browse Properties</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#categories' }">Categories</RouterLink>
        <RouterLink to="/about">About &amp; FAQ</RouterLink>
      </div>

      <div>
        <h4>For Publishers</h4>
        <RouterLink to="/publisher/apply">List a Property</RouterLink>
        <RouterLink to="/report-issue">Report an Issue</RouterLink>
        <p>Butuan City, Philippines</p>
      </div>
    </div>

    <div class="copyright">
      <span>© {{ currentYear }} ButuanSpaces · Commercial property listings in Butuan City.</span>
      <span class="legal-links">
        <RouterLink to="/privacy">Privacy Policy</RouterLink>
        <RouterLink to="/terms">Terms of Use</RouterLink>
      </span>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: #142d4e;
  color: white;
  padding: 65px 24px 20px;
}

.footer-container {
  max-width: 1200px;
  margin: auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 45px;
}

h3 { font-size: 23px; margin-top: 0; }
h3 span { color: #60a5fa; }
h4 { margin-top: 0; }

p, a {
  color: #cbd5e1;
  font-size: 14px;
  line-height: 1.9;
}

a {
  display: block;
  text-decoration: none;
  margin-bottom: 8px;
}

a:hover { color: white; }

.copyright {
  border-top: 1px solid #ffffff22;
  max-width: 1200px;
  margin: 50px auto 0;
  padding-top: 20px;
  color: #94a3b8;
  font-size: 12px;
}

.copyright,
.legal-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  justify-content: space-between;
}

.legal-links a {
  color: #cbd5e1;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 650px) {
  .footer-container { grid-template-columns: 1fr; gap: 20px; }
}
</style>
