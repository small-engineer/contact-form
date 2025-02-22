/**
 * Type definition for contact form data
 */
export interface ContactFormData {
	/** Name */
	name: string;
	/** Email address */
	email: string;
	/** Message */
	message: string;
	/** Company name (optional) */
	corporateName?: string;
	/** Turnstile token */
	turnstileToken: string;
}

/**
 * Type definition for API response
 */
export interface ApiResponse {
	/** Message on success or error */
	message?: string;
	/** Error message on failure */
	error?: string;
}

/**
 * Type definition for Turnstile verification response
 */
export interface TurnstileVerifyResponse {
	/** Whether the verification was successful */
	success: boolean;
	/** Error messages (if any) */
	'error-codes'?: string[];
}
