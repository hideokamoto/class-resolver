import { describe, expect, it } from 'vitest';
// @ts-expect-error -- plain JS build script without type declarations
import { toCjsDeclaration } from '../scripts/emit-cts-types.js';

const esmDeclaration = `export declare interface Foo<T = string> {
    value: T;
}

export declare namespace interfaces {
    export interface Bar {
    }
}

declare class Resolver {
    foo: Foo;
}
export default Resolver;

export { }
`;

describe('toCjsDeclaration', () => {
  it('turns the default export into export = and keeps named types on a merged namespace', () => {
    const result: string = toCjsDeclaration(esmDeclaration);

    expect(result).toContain('declare interface Foo<T = string> {');
    expect(result).toContain('declare namespace interfaces {');
    expect(result).toContain('    export interface Bar {');
    expect(result).toContain('declare namespace Resolver {\n  export { Foo, interfaces };\n}');
    expect(result.trimEnd().endsWith('export = Resolver;')).toBe(true);
    expect(result).not.toMatch(/^export default /m);
    expect(result).not.toMatch(/^export declare /m);
    expect(result).not.toMatch(/^export \{ \}/m);
  });

  it('fails when the declaration has no default export', () => {
    expect(() => toCjsDeclaration('export declare interface Foo {}\n')).toThrow(/default export/);
  });

  it('fails on top-level export forms it does not know how to convert', () => {
    const withReexport = `${esmDeclaration}export { Foo as Baz };\n`;
    expect(() => toCjsDeclaration(withReexport)).toThrow(/Unsupported export/);
  });
});
