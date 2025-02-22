/**
 * CORS用ヘッダーを生成する
 * @param origin リクエスト元のオリジン
 * @returns CORS設定を含むヘッダーオブジェクト
 */
export function corsHeaders(origin: string | null): Record<string, string> {
	const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');

	// リクエスト元のオリジンが許可されているか確認
	const isAllowed = origin ? allowedOrigins.includes(new URL(origin).origin) : false;

	// 許可されたオリジンのみヘッダーを返す
	if (isAllowed) {
		return {
			'Access-Control-Allow-Origin': origin || allowedOrigins[0],
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			Vary: 'Origin',
		};
	}

	// 許可されていない場合はヘッダーを返さない
	return {};
}
