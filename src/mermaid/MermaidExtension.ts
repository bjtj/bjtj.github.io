import type { MarkedExtension } from 'marked';
import mermaid from 'mermaid';
import { MarkedMermaidOptions } from './types';

/**
 * Mermaid extension for marked.js
 *
 * 사용법:
 *   import { markedMermaid } from './marked-mermaid-extension.js';
 *   marked.use(markedMermaid({ theme: 'default' }));
 */

(window as any).rendermermaid = (id: string, txt: string) => {
  return mermaid.render(id, txt);
}

export function markedMermaid(options: MarkedMermaidOptions): MarkedExtension {
  const {
    theme = 'default',
    startOnLoad = false,
    securityLevel = 'loose',
    ...rest
  } = options;

  let initialized = false;

  function ensureInit() {
    if (initialized) return;
    mermaid.initialize({ startOnLoad, theme, securityLevel, ...rest });
    initialized = true;
  }

  return {
    extensions: [{
      name: 'mermaid',
      level: 'block',

      tokenizer(src: string) {
        const match = src.match(
          /^```mermaid\r?\n([\s\S]*?)\r?\n```/
        );
        if (!match) return;
        return {
          type: 'mermaid',
          raw: match[0],
          code: match[1].trim(),
        };
      },

      renderer(token: any) {
        ensureInit();
        let escaped = token.code.replace(/\n/g, '\\n').replace(/"/g, '\\"');
        return `<div class="mermaid">
        <div>Loading...</div>
        <script>
        (() => {
        let d = document.currentScript.previousElementSibling;
        window.parent.rendermermaid("m-svg", "${escaped}")
        .then(({svg}) => { d.innerHTML = svg; });
        })();
        </script></div>`;
      },
    }],
  };
}
