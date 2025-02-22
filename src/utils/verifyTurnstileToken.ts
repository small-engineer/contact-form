import { TurnstileVerifyResponse } from '../types';

/**
 * Verifies a Turnstile token
 * @param token The Turnstile token sent from the client
 * @param secretKey The Turnstile secret key
 * @returns The token verification result
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
