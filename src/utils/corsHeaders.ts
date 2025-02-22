/**
 * Generates CORS headers
 * @param origin The origin of the request
 * @returns An object containing CORS settings
 */
export function corsHeaders(origin: string | null): Record<string, string> {
	const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');

	const isAllowed = origin ? allowedOrigins.includes(new URL(origin).origin) : false;

	if (isAllowed) {
		return {
			'Access-Control-Allow-Origin': origin || allowedOrigins[0],
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			Vary: 'Origin',
		};
	}

	return {};
}
