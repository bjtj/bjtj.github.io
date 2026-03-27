import type { MermaidConfig } from 'mermaid';

/** markedMermaid() 및 createMermaidRenderer()에 전달하는 옵션 */
export interface MarkedMermaidOptions extends MermaidConfig {
  /** mermaid 테마 (default | dark | forest | neutral | base) */
  theme?: MermaidConfig['theme'];

  /** 로딩 중에 표시할 플레이스홀더 텍스트 */
  loadingText?: string;

  /** 렌더링 실패 시 에러를 throw 할지 여부 (기본값: false) */
  throwOnError?: boolean;

  /** 커스텀 플레이스홀더 HTML 생성 함수 */
  placeholder?: (id: string) => string;
}

/** renderer 함수에 전달하는 token 형태 (marked 내부 타입 호환) */
export interface MermaidToken {
  type: 'mermaid';
  raw: string;
  code: string;
}
