/**
 * Inlines the Claude Concepts app into one self-contained .html file.
 *
 *   bun run scripts/build-concepts.ts [outDir]
 *
 * Writes claude-concepts.html to outDir (default ~/outputs) and refreshes the
 * copy checked in at docs/concepts/claude-concepts.html. The multi-file version
 * under docs/concepts/ stays the source of truth — edit that, then re-run this.
 */

const SRC = new URL('../docs/concepts/', import.meta.url);
const outDir = process.argv[2] ?? `${process.env.HOME}/outputs`;

const [html, css, concepts, app] = await Promise.all(
  ['index.html', 'styles.css', 'concepts.js', 'app.js'].map((f) =>
    Bun.file(new URL(f, SRC)).text(),
  ),
);

// a literal </script> inside inlined JS would close the tag early
for (const [name, src] of [['concepts.js', concepts], ['app.js', app]] as const) {
  if (/<\/script/i.test(src)) throw new Error(`${name} contains a </script> sequence — escape it before inlining`);
}

const built = html
  .replace(
    '  <link rel="stylesheet" href="styles.css">',
    `  <style>\n${css.trimEnd()}\n  </style>`,
  )
  .replace(
    '  <script src="concepts.js"></script>\n  <script src="app.js"></script>',
    `  <script>\n${concepts.trimEnd()}\n  </script>\n\n  <script>\n${app.trimEnd()}\n  </script>`,
  )
  .replace(
    '<head>',
    `<head>\n  <!-- Built by scripts/build-concepts.ts from docs/concepts/ — edit there, not here. -->`,
  );

// every placeholder must have been consumed
for (const leftover of ['href="styles.css"', 'src="concepts.js"', 'src="app.js"']) {
  if (built.includes(leftover)) throw new Error(`failed to inline ${leftover} — did index.html change?`);
}

const targets = [`${outDir}/claude-concepts.html`, new URL('claude-concepts.html', SRC).pathname];
for (const t of targets) {
  await Bun.write(t, built);
  console.log(`${(built.length / 1024).toFixed(0)} KB → ${t}`);
}

// --fragment=<path> emits the same app without the document skeleton, for hosts
// that supply their own <html>/<head>/<body> (e.g. publishing it as an Artifact).
const fragArg = process.argv.find((a) => a.startsWith('--fragment='));
if (fragArg) {
  const body = html.match(/<body>([\s\S]*?)<\/body>/);
  if (!body) throw new Error('could not find <body> in index.html');

  const markup = body[1]
    .replace(/[ \t]*<script src="(concepts|app)\.js"><\/script>\n?/g, '')
    .trim();

  const fragment = [
    '<title>Claude Concepts</title>',
    `<style>\n${css.trimEnd()}\n</style>`,
    markup,
    `<script>\n${concepts.trimEnd()}\n</script>`,
    `<script>\n${app.trimEnd()}\n</script>`,
  ].join('\n\n') + '\n';

  if (/<!DOCTYPE|<html|<body/i.test(fragment)) throw new Error('fragment must not carry a document skeleton');

  const path = fragArg.slice('--fragment='.length);
  await Bun.write(path, fragment);
  console.log(`${(fragment.length / 1024).toFixed(0)} KB → ${path} (fragment)`);
}
