/**
 * レスポンスのエラーリスト
 * - 400 Bad Request:
 *   - `Missing required fields` - 必須フィールド(name, email, message, turnstileToken)が不足している
 *   - `Invalid content type` - Content-Type が `multipart/form-data` でない
 *   - `Invalid name` - 名前が空か、50文字を超えている
 *   - `Invalid email address` - メールアドレスの形式が正しくない
 *   - `Invalid message content` - メッセージが空か、500文字を超えている
 * - 403 Forbidden:
 *   - `Turnstile verification failed` - Turnstile トークンが無効
 * - 405 Method Not Allowed:
 *   - `Method not allowed` - POST 以外の HTTP メソッドがリクエストされた
 * - 500 Internal Server Error:
 *   - `Failed to send message` - Discord へのメッセージ送信に失敗した
 *   - `Internal Server Error` - 予期しないエラーが発生した
 * - 200 OK:
 *   - `Form submitted successfully!` - フォーム送信が成功した
 */

import { jsonResponse } from 'utils/jsonResponse';
import { corsHeaders } from 'utils/corsHeaders';
import { verifyTurnstileToken } from 'utils/verifyTurnstileToken';
import { sendToDiscord } from 'utils/sendToDiscord';

/**
 * フォームデータのサニタイズ
 * @param input 入力データ
 * @returns サニタイズされたデータ
 */
function sanitize(input: string): string {
	if (!input) return '';
	const sanitized = input.replace(/<script.*?>.*?<\/script>/gi, '[script removed]').replace(/<.*?on\w+.*?>/gi, '[malicious tag removed]');
	return sanitized.replace(/[<>"'&]/g, (match) => {
		switch (match) {
			case '<':
				return '&lt;';
			case '>':
				return '&gt;';
			case '"':
				return '&quot;';
			case "'":
				return '&#39;';
			case '&':
				return '&amp;';
			default:
				return match;
		}
	});
}

/**
 * フォームデータのバリデーション
 * @param name 名前
 * @param email メールアドレス
 * @param message メッセージ
 * @returns エラーがある場合はエラーメッセージを返す
 */
function validateFormData(name: string, email: string, message: string): string | null {
	if (!name || name.length > 50) return 'Invalid name';
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
	if (!message || message.length > 500) return 'Invalid message content';
	return null;
}

/**
 * Fetchイベントハンドラ
 * @param request リクエストオブジェクト
 * @param env 環境変数
 * @returns レスポンス
 */
export default {
	async fetch(request: Request, env: any): Promise<Response> {
		const origin = request.headers.get('Origin') || null;

		// OPTIONSリクエストの事前検証
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(request.headers.get('Origin')),
			});
		}

		// POST以外のリクエストは許可しない
		if (request.method !== 'POST') {
			console.error('Method not allowed', { method: request.method });
			return jsonResponse({ error: 'Method not allowed' }, 405, origin);
		}

		// Content-Typeの検証
		const contentType = request.headers.get('Content-Type') || '';
		if (!contentType.includes('multipart/form-data')) {
			console.error('Invalid content type', { contentType });
			return jsonResponse({ error: 'Invalid content type' }, 400, origin);
		}

		// フォームデータの処理
		try {
			const formData = await request.formData();
			const name = sanitize(formData.get('name')?.toString() || '');
			const email = sanitize(formData.get('email')?.toString() || '');
			const message = sanitize(formData.get('message')?.toString() || '');
			const corporateName = sanitize(formData.get('intra_name')?.toString() || '');
			const turnstileToken = formData.get('cf-turnstile-response')?.toString();

			// 必須フィールドの検証
			if (!name || !email || !message || !turnstileToken) {
				console.error('Missing required fields', { name, email, message, turnstileToken });
				return jsonResponse({ error: 'Missing required fields' }, 400, origin);
			}

			// 入力内容のバリデーション
			const validationError = validateFormData(name, email, message);
			if (validationError) {
				console.error('Validation error:', validationError);
				return jsonResponse({ error: validationError }, 400, origin);
			}

			// Turnstileトークンの検証
			const isValid = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
			if (!isValid.success) {
				console.error('Turnstile verification failed', {
					token: turnstileToken,
					'error-codes': isValid['error-codes'],
				});
				return jsonResponse({ error: 'Turnstile verification failed' }, 403, origin);
			}

			// Discordへの通知
			const success = await sendToDiscord(env.DISCORD_WEBHOOK_URL, { name, email, message, corporateName });
			if (!success) {
				console.error('Failed to send to Discord', { name, email, message, corporateName });
				return jsonResponse({ error: 'Failed to send message' }, 500, origin);
			}

			return jsonResponse({ message: 'Form submitted successfully!' }, 200, origin);
		} catch (error) {
			console.error('Error handling request', {
				error: error instanceof Error ? error.message : error,
				stack: error instanceof Error ? error.stack : undefined,
			});
			return jsonResponse({ error: 'Internal Server Error' }, 500, origin);
		}
	},
};
