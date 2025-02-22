/**
 * List of response errors
 * - 400 Bad Request:
 *   - `Missing required fields` - Required fields (name, email, message, turnstileToken) are missing
 *   - `Invalid content type` - Content-Type is not `multipart/form-data`
 *   - `Invalid name` - Name is empty or exceeds 50 characters
 *   - `Invalid email address` - Email address is in an invalid format
 *   - `Invalid message content` - Message is empty or exceeds 500 characters
 * - 403 Forbidden:
 *   - `Turnstile verification failed` - The Turnstile token is invalid
 * - 405 Method Not Allowed:
 *   - `Method not allowed` - A non-POST HTTP method was requested
 * - 500 Internal Server Error:
 *   - `Failed to send message` - Failed to send the message to Discord
 *   - `Internal Server Error` - An unexpected error occurred
 * - 200 OK:
 *   - `Form submitted successfully!` - The form submission was successful
 */

import { jsonResponse } from 'utils/jsonResponse';
import { corsHeaders } from 'utils/corsHeaders';
import { verifyTurnstileToken } from 'utils/verifyTurnstileToken';
import { sendToDiscord } from 'utils/sendToDiscord';

/**
 * Sanitizes form data
 * @param input The input data
 * @returns The sanitized data
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
 * Form data validation
 * @param name Name
 * @param email Email address
 * @param message Message
 * @returns Error message if validation fails
 */
function validateFormData(name: string, email: string, message: string): string | null {
	if (!name || name.length > 50) return 'Invalid name';
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
	if (!message || message.length > 500) return 'Invalid message content';
	return null;
}

/**
 * Fetch event handler
 * @param request Request object
 * @param env Environment variables
 * @returns Response
 */
export default {
	async fetch(request: Request, env: any): Promise<Response> {
		const origin = request.headers.get('Origin') || null;

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(request.headers.get('Origin')),
			});
		}

		if (request.method !== 'POST') {
			console.error('Method not allowed', { method: request.method });
			return jsonResponse({ error: 'Method not allowed' }, 405, origin);
		}

		const contentType = request.headers.get('Content-Type') || '';
		if (!contentType.includes('multipart/form-data')) {
			console.error('Invalid content type', { contentType });
			return jsonResponse({ error: 'Invalid content type' }, 400, origin);
		}

		try {
			const formData = await request.formData();
			const name = sanitize(formData.get('name')?.toString() || '');
			const email = sanitize(formData.get('email')?.toString() || '');
			const message = sanitize(formData.get('message')?.toString() || '');
			const corporateName = sanitize(formData.get('intra_name')?.toString() || '');
			const turnstileToken = formData.get('cf-turnstile-response')?.toString();

			if (!name || !email || !message || !turnstileToken) {
				console.error('Missing required fields', { name, email, message, turnstileToken });
				return jsonResponse({ error: 'Missing required fields' }, 400, origin);
			}

			const validationError = validateFormData(name, email, message);
			if (validationError) {
				console.error('Validation error:', validationError);
				return jsonResponse({ error: validationError }, 400, origin);
			}

			const isValid = await verifyTurnstileToken(turnstileToken, env.TURNSTILE_SECRET_KEY);
			if (!isValid.success) {
				console.error('Turnstile verification failed', {
					token: turnstileToken,
					'error-codes': isValid['error-codes'],
				});
				return jsonResponse({ error: 'Turnstile verification failed' }, 403, origin);
			}

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
