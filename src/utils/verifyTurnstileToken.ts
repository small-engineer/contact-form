import { TurnstileVerifyResponse } from '../types';

/**
 * Turnstileのトークンを検証
 * @param token クライアントから送信されたTurnstileトークン
 * @param secretKey Turnstileの秘密鍵
 * @returns トークン検証結果
 */
export async function verifyTurnstileToken(token: string, secretKey: string): Promise<TurnstileVerifyResponse> {
	const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			secret: secretKey,
			response: token,
		}),
	});

	const verificationResult = await response.json();
	return verificationResult as TurnstileVerifyResponse;
}
