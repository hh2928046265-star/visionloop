// 联网搜索 - duck-duck-scrape (8.7万周下载)
import { search, SafeSearchType } from 'duck-duck-scrape';

interface SearchResult {
  title: string;
  body: string;
  href: string;
}

interface SearchResponse {
  results: SearchResult[];
  query: string;
}

export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResponse> {
  if (!query || query.length < 2) return { results: [], query };
  
  console.log('[搜索] ' + query.substring(0, 50));
  
  try {
    var res = await search(query, {
      safeSearch: SafeSearchType.OFF,
      locale: 'zh-cn',
    });
    
    if (res.noResults || !res.results || res.results.length === 0) {
      console.log('[搜索] 无结果');
      return { results: [], query };
    }
    
    var results: SearchResult[] = [];
    for (var r of res.results.slice(0, maxResults)) {
      results.push({
        title: r.title || '',
        body: r.description || '',
        href: r.url || '',
      });
    }
    
    console.log('[搜索] 返回 ' + results.length + ' 条结果');
    return { results, query };
  } catch (e: any) {
    console.warn('[搜索] 失败: ' + (e.message || e));
    return { results: [], query };
  }
}

export function formatSearchContext(response: SearchResponse): string {
  if (!response.results || response.results.length === 0) return '';
  
  var lines = ['【联网搜索结果 - 提取产品信息，禁止复制品牌名/型号】'];
  for (var i = 0; i < response.results.length; i++) {
    var r = response.results[i];
    lines.push((i + 1) + '. ' + r.title);
    lines.push('   ' + r.body.substring(0, 300));
  }
  return lines.join('\n');
}
