# Contact Form Backend (Cloudflare Workers based)

This is a Cloudflare Workers backend for handling contact form submissions with validation, CAPTCHA verification (Turnstile), and Discord webhook integration.

## Features

- **CORS Support**: Restricts access to specific origins
- **Form Validation**: Ensures name, email, and message meet required criteria
- **Turnstile CAPTCHA Verification**: Prevents spam submissions
- **Discord Webhook Integration**: Sends form submissions to a Discord channel

## Setup

### Prerequisites

- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) installed

### Installation

Clone the repository:

```sh
git clone https://github.com/small-engineer/contact-form.git contact-form-backend
cd contact-form-backend
```

### Configure Environment Variables

Modify `wrangler.toml` with the required environment variables:

```toml
[vars]
DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/your_webhook_url"
TURNSTILE_SECRET_KEY = "your_turnstile_secret_key"
ALLOWED_ORIGINS = "https://yourdomain.com,https://anotherdomain.com"
```

### Deployment

To deploy the Cloudflare Worker:

```sh
wrangler deploy
```

## API Usage

### Endpoint

```
POST / (Root Endpoint)
```

### Headers

- `Content-Type: multipart/form-data`

### Request Body

| Parameter       | Type   | Required | Description                           |
|---------------|--------|----------|---------------------------------------|
| `name`       | String | Yes      | User's full name (max 50 chars)      |
| `email`      | String | Yes      | Valid email address                  |
| `message`    | String | Yes      | Message content (max 500 chars)      |
| `intra_name` | String | No       | (Optional) Company name              |
| `cf-turnstile-response` | String | Yes | Turnstile CAPTCHA response |

### Response

#### Success (200)

```json
{
  "message": "Form submitted successfully!"
}
```

#### Errors

| Status Code | Error Message                  | Reason |
|------------|--------------------------------|--------|
| 400        | `Missing required fields`      | Required fields are empty |
| 400        | `Invalid content type`         | `Content-Type` is not `multipart/form-data` |
| 400        | `Invalid name`                 | Name is empty or exceeds 50 characters |
| 400        | `Invalid email address`        | Email is not in a valid format |
| 400        | `Invalid message content`      | Message is empty or exceeds 500 characters |
| 403        | `Turnstile verification failed` | CAPTCHA verification failed |
| 405        | `Method not allowed`           | Non-POST request received |
| 500        | `Failed to send message`       | Discord webhook error |
| 500        | `Internal Server Error`        | Unexpected server error |

## Frontend Integration

Add the following script to your frontend to handle form submissions:

```html
<script>
    const errorMessages = {
      name: "Invalid name. Please enter up to 50 characters.",
      email: "Invalid email format.",
      message: "Invalid message. Please enter up to 500 characters.",
      default: "An error occurred while submitting the form. Please contact us at: <br> Email: your_email@mail.com",
    };

    async function handleFormSubmit(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const errorMessageDiv = form.querySelector(".error-message");
        errorMessageDiv.innerHTML = "";

        try {
            const response = await fetch(
                "https://contact-form-backend.your.workers.dev/", // Change!!!
                {
                    method: "POST",
                    body: formData,
                }
            );

            const responseData = await response.json();

            if (response.ok && responseData.message === "Form submitted successfully!") {
                errorMessageDiv.innerHTML = "";
                errorMessageDiv.style.display = "none";
                window.location.href = "/submission-complete/";
            } else {
                console.error("Error Response:", responseData);
                let errorMessage = errorMessages.default;
                if (responseData.error === "Invalid name") {
                    errorMessage = errorMessages.name;
                } else if (responseData.error === "Invalid email address") {
                    errorMessage = errorMessages.email;
                } else if (responseData.error === "Invalid message content") {
                    errorMessage = errorMessages.message;
                }
                errorMessageDiv.innerHTML = errorMessage;
            }
        } catch (error) {
            console.error("Error:", error);
            errorMessageDiv.innerHTML = errorMessages.default;
        }
    }


    document
      .getElementById("contactFormElement")
      .addEventListener("submit", handleFormSubmit);
  </script>
  <script
    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
    async
    defer></script>
```

## Development

To test locally:

```sh
wrangler dev
```

## License

This project is licensed under the MIT License.
