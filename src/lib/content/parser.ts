import { marked } from 'marked';

// marked 옵션 설정 (동기 렌더러 사용)
marked.setOptions({
  gfm: true,    // GitHub Flavored Markdown (표·코드블록 지원)
  breaks: false,
});

/**
 * 마크다운 문자열을 HTML로 변환한다.
 * marked.parse()는 string | Promise<string>을 반환하므로 await 처리.
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const html = await marked.parse(markdown);
  return html;
}
