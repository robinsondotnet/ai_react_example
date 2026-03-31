/**
 * AEM Headless Web Components loader.
 * Include via: <cq:includeClientLib categories="aem-headless-demo.headless-wc"/>
 *
 * Reads the CDN base URL from data-wc-cdn attribute on this <script> tag,
 * then injects the web-components IIFE bundle idempotently.
 */
(function () {
  'use strict';

  var BUNDLE_ID = 'aem-headless-wc-bundle';

  if (document.getElementById(BUNDLE_ID)) {
    return; // already loaded
  }

  // Resolve CDN base from the script tag that loaded this file
  var scripts = document.getElementsByTagName('script');
  var cdnBase = '';
  for (var i = 0; i < scripts.length; i++) {
    var cdn = scripts[i].getAttribute('data-wc-cdn');
    if (cdn) {
      cdnBase = cdn.replace(/\/$/, '');
      break;
    }
  }

  if (!cdnBase) {
    console.warn('[AEM Headless WC] data-wc-cdn attribute not found on loader script tag.');
    return;
  }

  var script = document.createElement('script');
  script.id = BUNDLE_ID;
  script.src = cdnBase + '/web-components.js';
  script.async = true;
  document.head.appendChild(script);
}());
