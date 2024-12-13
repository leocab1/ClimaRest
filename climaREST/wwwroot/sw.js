const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'//Keys de la memoria en chache
const INMUTABLE_CACHE = 'inmutable-v1'

const APP_SHELL = [ 
    '/',
    '/Home/Index',
    '/css/Estilo.css',
    '/images/LogoClima.png',
    '/favicon.ico'
]

const APP_SHELL_INMUTABLE = [ 
    '/lib/bootstrap/dist/css/bootstrap.min.css',
    '/lib/bootstrap/dist/js/bootstrap.bundle.min.js',
    '/font-awesome/css/fontawesome.css',
    '/font-awesome/webfonts/fa-solid-900.woff2',
    '/font-awesome/css/solid.css',
    '/font-awesome/css/brands.css',

]


self.addEventListener('install', e => {
    const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
        cache.addAll(APP_SHELL));

    const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache =>
        cache.addAll(APP_SHELL_INMUTABLE));

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener('install', e => {
    console.log("evento Install")
});

self.addEventListener('activate', e => {
    const respuesta = caches.keys().then(keys => {
        keys.forEach(key => {
            if (key != STATIC_CACHE && key.includes('static'))
                return caches.delete(key);
        });
    });

    e.waitUntil(respuesta);
});

self.addEventListener('fetch', e => {
 

    const respuesta = caches.match(e.request).then(res => {
        if (res) {
            return res;
        }
        else {
            return fetch(e.request).then(response => {
                caches.open(DYNAMIC_CACHE).then(cache => {
                    cache.put(e.request, response)
                })
                return response.clone();
            }).catch(err => {
                return null;
            })
        }

    }).catch(err => {
        return null;
    })
    e.respondWith(respuesta);
});