/**
 * Dev server for the Claude Concepts app.
 *
 *   bun run scripts/serve-concepts.ts        # http://localhost:3000
 *   PORT=8080 bun run scripts/serve-concepts.ts
 *
 * The app is plain static files, so this is only a convenience — opening
 * docs/concepts/index.html directly in a browser works too.
 */

const ROOT = new URL('../docs/concepts/', import.meta.url);

const server = Bun.serve({
  port: Number(process.env.PORT ?? 3000),
  async fetch(req) {
    const url = new URL(req.url);
    const name = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);

    // keep the server inside docs/concepts
    if (name.includes('..')) return new Response('Not found', { status: 404 });

    const file = Bun.file(new URL(name, ROOT));
    if (!(await file.exists())) return new Response('Not found', { status: 404 });

    return new Response(file, {
      headers: { 'Cache-Control': 'no-store' },
    });
  },
});

console.log(`Claude Concepts → ${server.url}`);
