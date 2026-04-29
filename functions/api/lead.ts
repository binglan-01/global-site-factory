type PagesFunctionContext = {
  request: Request;
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

export async function onRequest(context: PagesFunctionContext): Promise<Response> {
  const { request } = context;

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

    if (wantsJson) {
      return jsonResponse(
        {
          ok: true,
          message: "Lead received",
        },
        200,
      );
    }

    const successUrl = result.data.pageUrl ?? "/";
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
