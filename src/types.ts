/**
 * お問い合わせフォームデータの型
 */
export interface ContactFormData {
	/** お名前 */
	name: string;
	/** メールアドレス */
	email: string;
	/** メッセージ */
	message: string;
	/** 会社名 */
	corporateName?: string;
	/** Turnstileトークン */
	turnstileToken: string;
}

/**
 * APIレスポンスの型
 */
export interface ApiResponse {
	/** 成功時のメッセージまたはエラー時のメッセージ */
	message?: string;
	/** エラー時のエラーメッセージ */
	error?: string;
}

/**
 * Turnstile検証結果の型
 */
export interface TurnstileVerifyResponse {
	/** 検証が成功したかどうか */
	success: boolean;
	/** エラーメッセージ（あれば） */
	'error-codes'?: string[];
}
