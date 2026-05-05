type LeadBindings = {
  LEAD_WEBHOOK_URL?: string;
  LEAD_WEBHOOK_SECRET?: string;
};

type PagesFunctionContext = {
  request: Request;
  env?: LeadBindings;
};

type JsonBody = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

type LeadFormData = {
  name: string;
  email: string;
  message: string;
  companySlug: string;
  formId: string;
  phone?: string;
  pageUrl?: string;
  company?: string;
};

/** JSON body forwarded to LEAD_WEBHOOK_URL after validation succeeds */
type LeadWebhookPayload = {
  name: string;
  email: string;
  message: string;
  companySlug: string;
  formId: string;
  createdAt: string;
  userAgent: string;
  phone?: string;
  pageUrl?: string;
  company?: string;
};

function jsonResponse(body: JsonBody, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function readOptionalString(formData: FormData, fieldName: string): string | undefined {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function readRequiredString(
  formData: FormData,
  fieldName: keyof LeadFormData,
  errors: Record<string, string>,
): string {
  const value = readOptionalString(formData, fieldName);

  if (!value) {
    errors[fieldName] = `${fieldName} is required.`;
    return "";
  }

  return value;
}

function validateLeadForm(formData: FormData): { data?: LeadFormData; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const name = readRequiredString(formData, "name", errors);
  const email = readRequiredString(formData, "email", errors);
  const message = readRequiredString(formData, "message", errors);
  const companySlug = readRequiredString(formData, "companySlug", errors);
  const formId = readRequiredString(formData, "formId", errors);
  const phone = readOptionalString(formData, "phone");
  const pageUrl = readOptionalString(formData, "pageUrl");
  const company = readOptionalString(formData, "company");

  if (email && !email.includes("@")) {
    errors.email = "email must be a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    data: {
      name,
      email,
      message,
      companySlug,
      formId,
      phone,
      pageUrl,
      company,
    },
    errors,
  };
}

function expectsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  return accept.includes("application/json");
}

function appendQueryParam(rawUrl: string, key: string, value: string): string {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set(key, value);
    return url.toString();
  } catch {
    const separator = rawUrl.includes("?") ? "&" : "?";
    return `${rawUrl}${separator}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
  }
}

function redirectResponse(targetUrl: string): Response {
  return new Response(null, {
    status: 303,
    headers: {
      location: targetUrl,
    },
  });
}

function configuredWebhookUrl(env: LeadBindings): string | undefined {
  const raw = env.LEAD_WEBHOOK_URL;
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function configuredWebhookSecret(env: LeadBindings): string | undefined {
  const raw = env.LEAD_WEBHOOK_SECRET;
  if (typeof raw !== "string") {
    return undefined;
  }
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildWebhookPayload(data: LeadFormData, request: Request): LeadWebhookPayload {
  const base: LeadWebhookPayload = {
    name: data.name,
    email: data.email,
    message: data.message,
    companySlug: data.companySlug,
    formId: data.formId,
    createdAt: new Date().toISOString(),
    userAgent: request.headers.get("user-agent") ?? "",
  };

  const withOptionals: LeadWebhookPayload = { ...base };
  if (data.phone !== undefined) {
    withOptionals.phone = data.phone;
  }
  if (data.pageUrl !== undefined) {
    withOptionals.pageUrl = data.pageUrl;
  }
  if (data.company !== undefined) {
    withOptionals.company = data.company;
  }
  return withOptionals;
}

function webhookUpstreamFailedResponse(wantsJson: boolean, redirectBaseUrl: string): Response {
  if (wantsJson) {
    return jsonResponse(
      {
        ok: false,
        message: "Lead submission failed. Please try again later.",
      },
      503,
    );
  }
  return redirectResponse(appendQueryParam(redirectBaseUrl, "lead", "error"));
}

async function forwardLeadToWebhook(
  webhookUrl: string,
  payload: LeadWebhookPayload,
  env: LeadBindings,
): Promise<Response> {
  const headers = new Headers();
  headers.set("content-type", "application/json; charset=utf-8");

  const secret = configuredWebhookSecret(env);
  if (secret !== undefined) {
    headers.set("X-Lead-Webhook-Secret", secret);
  }

  const webhookResponse = await fetch(webhookUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  return webhookResponse;
}

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const { request } = context;
  const env: LeadBindings = context.env ?? {};

  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        allow: "POST",
      },
    });
  }

  const wantsJson = expectsJson(request);

  try {
    const formData = await request.formData();
    const result = validateLeadForm(formData);

    if (!result.data) {
      if (wantsJson) {
        return jsonResponse(
          {
            ok: false,
            message: "Invalid lead form submission.",
            errors: result.errors,
          },
          400,
        );
      }

      const fallbackUrl = readOptionalString(formData, "pageUrl") ?? "/";
      return redirectResponse(appendQueryParam(fallbackUrl, "lead", "invalid"));
    }

    const data = result.data;
    const redirectBaseOnError = data.pageUrl ?? "/";

    const webhookUrl = configuredWebhookUrl(env);
    if (webhookUrl !== undefined) {
      const payload = buildWebhookPayload(data, request);
      let webhookResponse: Response;
      try {
        webhookResponse = await forwardLeadToWebhook(webhookUrl, payload, env);
      } catch {
        return webhookUpstreamFailedResponse(wantsJson, redirectBaseOnError);
      }

      if (!webhookResponse.ok) {
        return webhookUpstreamFailedResponse(wantsJson, redirectBaseOnError);
      }
    }

    if (wantsJson) {
      return jsonResponse(
        {
          ok: true,
          message: "Lead received",
        },
        200,
      );
    }

    const successUrl = data.pageUrl ?? "/";
    return redirectResponse(appendQueryParam(successUrl, "lead", "ok"));
  } catch {
    if (wantsJson) {
      return jsonResponse(
        {
          ok: false,
          message: "Failed to process lead submission.",
        },
        500,
      );
    }

    return redirectResponse(appendQueryParam("/", "lead", "error"));
  }
}
