import { ApiResponse } from '../types';
import { corsHeaders } from './corsHeaders';

/**
 * JSON形式のレスポンスを生成
 * @param body レスポンスボディ
 * @param status HTTPステータスコード
 * @param origin リクエスト元のオリジン
 * @returns JSONレスポンス
 */
export function jsonResponse(body: ApiResponse, status: number, origin: string | null): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...corsHeaders(origin),
		},
	});
}
