import { ContactFormData } from '../types';

/**
 * Discordにお問い合わせデータを送信
 * @param webhookUrl DiscordのWebhook URL
 * @param data お問い合わせデータ
 * @returns 送信成功フラグ
 */
export async function sendToDiscord(
	webhookUrl: string,
	data: Omit<ContactFormData, 'turnstileToken'> & { corporateName?: string }
): Promise<boolean> {
	const payload = {
		content:
			`**新しいお問い合わせが届きました**\n\n` +
			`- **お名前:** ${data.name}\n` +
			`- **メールアドレス:** ${data.email}\n` +
			(data.corporateName ? `- **会社名:** ${data.corporateName}\n` : '') + // 追加
			`- **メッセージ:** ${data.message}`,
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
