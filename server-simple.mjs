import 'zone.js/node';
import '@angular/compiler';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const bootstrapModule = require('./dist/angular-ecommerce-3d/server/main.js');

export function app() {
    const server = express();
    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, './dist/angular-ecommerce-3d/browser');
    const indexHtml = join(browserDistFolder, 'index.html');

    const commonEngine = new CommonEngine();

    server.set('view engine', 'html');
    server.set('views', browserDistFolder);

    // Serve static files from /browser
    server.use(express.static(browserDistFolder, {
        maxAge: '1y',
        index: false
    }));

    // All regular routes use the bundle's renderModule
    server.get('*', (req, res, next) => {
        const { protocol, originalUrl, baseUrl, headers } = req;
        const url = `${protocol}://${headers.host}${originalUrl}`;

        bootstrapModule.renderModule(bootstrapModule.AppServerModule || bootstrapModule.default, {
            document: readFileSync(indexHtml, 'utf-8'),
            url: url,
            extraProviders: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
        })
            .then((html) => res.send(html))
            .catch((err) => {
                console.error('SSR Rendering Error:', err);
                next(err);
            });
    });

    return server;
}

function run() {
    const port = process.env['PORT'] || 4000;

    // Start up the Node server
    const server = app();
    server.listen(port, () => {
        console.log(`✅ Node Express server listening on http://localhost:${port}`);
    });
}

run();
