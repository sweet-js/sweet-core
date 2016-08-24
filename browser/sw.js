var CACHE_NAME = 'sweet-cache-v1';
var urlsToCache = [
  'editor.html',
  'scripts/jquery.js',
  'scripts/codemirror.js',
  'scripts/vim.js',
  'scripts/emacs.js',
  'scripts/source-map.js',
  'scripts/sweet.js',
  'scripts/underscore.js',
  'scripts/rx.jquery.min.js',
  'scripts/rx.lite.js',
  'scripts/rx.dom.compat.min.js',
  'mode/javascript/javascript.js',
  'scripts/editor.js',
  'scripts/require.js',
  'codemirror.css',
  'solarized.css',
  'http://fonts.googleapis.com/css?family=Lato:100'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
