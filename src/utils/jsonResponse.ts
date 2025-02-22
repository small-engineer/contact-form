import { ApiResponse } from '../types';
import { corsHeaders } from './corsHeaders';

/**
 * Generates a JSON response
 * @param body The response body
 * @param status The HTTP status code
 * @param origin The origin of the request
 * @returns A JSON response
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
