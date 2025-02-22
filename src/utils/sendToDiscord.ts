import { ContactFormData } from '../types';

/**
 * Sends contact form data to Discord
 * @param webhookUrl The Discord webhook URL
 * @param data The contact form data
 * @returns A flag indicating whether the message was successfully sent
 */
export async function sendToDiscord(
	webhookUrl: string,
	data: Omit<ContactFormData, 'turnstileToken'> & { corporateName?: string }
): Promise<boolean> {
	const payload = {
		content:
			`📩 **New Contact Form Submission!**\n\n` +
			`👤 **Name:** ${data.name}\n` +
			`📧 **Email:** ${data.email}\n` +
			(data.corporateName ? `🏢 **Company:** ${data.corporateName}\n` : '') + // Optional company name
			`💬 **Message:**\n${data.message}`,
	};


	const response = await fetch(webhookUrl, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		console.error('Failed to send message to Discord:', await response.text());
	}

	return response.ok;
}
