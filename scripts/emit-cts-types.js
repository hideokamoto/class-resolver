// Emit dist/index.d.cts for the CommonJS build.
//
// vite-plugin-dts writes the ESM declarations to dist/index.d.mts (named after the ES
// bundle dist/index.mjs, because package.json has no top-level "types").
// The CJS bundle (dist/index.cjs) is `module.exports = Resolver`, so its types must use
// `export = Resolver`. Reusing the ESM declarations (`export default Resolver`) for
// `require` makes TypeScript under node16/nodenext treat the package as ESM
// ("Masquerading as ESM" in Are the Types Wrong?). Named type exports move onto a
// namespace merged with the class, so CJS users can write `Resolver.ResolveTarget`.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export function toCjsDeclaration(esmDeclaration) {
  const defaultExport = esmDeclaration.match(/^export default (\w+);$/m);
  if (!defaultExport) {
    throw new Error(
      'Expected a single default export (`export default <name>;`) in the declaration file.'
    );
  }
  const defaultName = defaultExport[1];

  const names = [];
  let body = esmDeclaration.replace(
    /^export declare (interface|namespace|type|class|function|const|enum) (\w+)/gm,
    (_match, kind, name) => {
      names.push(name);
      return `declare ${kind} ${name}`;
    }
  );
  body = body.replace(/^export default \w+;\n?/m, '').replace(/^export \{ *\};?\n?/m, '');

  const leftover = body.match(/^export\b.*$/m);
  if (leftover) {
    throw new Error(`Unsupported export in declaration file: ${leftover[0]}`);
  }

  const namespace =
    names.length > 0
      ? `declare namespace ${defaultName} {\n  export { ${names.join(', ')} };\n}\n\n`
      : '';
  return `${body.trimEnd()}\n\n${namespace}export = ${defaultName};\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const source = readFileSync('dist/index.d.mts', 'utf8');
  writeFileSync('dist/index.d.cts', toCjsDeclaration(source));
  console.log('Wrote dist/index.d.cts');
}
