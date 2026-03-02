import { getLlmConfig } from "./runtimeConfig";

/** Override from request (per-browser key). When set, only this client's key is used. */
export type LlmOverride = {
  apiKey: string;
  apiUrl?: string;
  provider?: "openai" | "google" | "vertex";
};

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4";
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice = ToolChoicePrimitive | ToolChoiceByName | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (value: MessageContent | MessageContent[]): MessageContent[] =>
  Array.isArray(value) ? value : [value];

const normalizeContentPart = (part: MessageContent): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map((part) => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined,
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error("tool_choice 'required' was provided but no tools were configured");
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly",
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

function resolveApiUrl(overrideUrl?: string): string {
  const base = (overrideUrl ?? getLlmConfig().llmApiUrl ?? "").trim();
  if (base) {
    return base.endsWith("/") ? `${base.slice(0, -1)}/v1/chat/completions` : `${base}/v1/chat/completions`;
  }
  return "https://api.openai.com/v1/chat/completions";
}

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error("responseFormat json_schema requires a defined schema object");
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

// Gemini API base +默认模型。
// 使用 v1 版本与当前在线文档一致，模型选用通用的 gemini-2.0-flash。
const GEMINI_BASE = "https://generativelanguage.googleapis.com/v1";
const GEMINI_MODEL = "gemini-2.0-flash";

/** Google Gemini API (Google AI / Vertex 兼容): generateContent */
async function invokeGemini(messages: Message[], apiKey: string): Promise<InvokeResult> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const m of messages) {
    const text =
      typeof m.content === "string"
        ? m.content
        : ensureArray(m.content)
            .filter((c): c is TextContent => c.type === "text")
            .map((c) => c.text)
            .join("\n");
    // Gemini 公共 API 不要求单独的 systemInstruction，这里统一按对话内容传入。
    const role = m.role === "assistant" ? "model" : "user";
    if (text) contents.push({ role, parts: [{ text }] });
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  };

  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent`;
  console.log("[llm] Gemini request", {
    url,
    hasKey: Boolean(apiKey),
    messages: messages.length,
  });
  const response = await fetch(`${url}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("[llm] Gemini response status", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[llm] Gemini error", response.status, response.statusText, errorText.slice(0, 300));
    throw new Error(`Gemini 调用失败: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  console.log("[llm] Gemini success", {
    preview: text.slice(0, 120),
    length: text.length,
  });

  return {
    id: "",
    created: Math.floor(Date.now() / 1000),
    model: GEMINI_MODEL,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: data.candidates?.[0]?.finishReason ?? "STOP",
      },
    ],
  };
}

/** Vertex AI generateContent via API key and user-provided endpoint URL. */
async function invokeVertex(
  messages: Message[],
  endpointUrl: string,
  apiKey: string,
): Promise<InvokeResult> {
  const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

  for (const m of messages) {
    const text =
      typeof m.content === "string"
        ? m.content
        : ensureArray(m.content)
            .filter((c): c is TextContent => c.type === "text")
            .map((c) => c.text)
            .join("\n");
    const role = m.role === "assistant" ? "model" : "user";
    if (text) contents.push({ role, parts: [{ text }] });
  }

  const body: Record<string, unknown> = {
    contents,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
    },
  };

  console.log("[llm] Vertex request", {
    endpointUrl,
    hasKey: Boolean(apiKey),
    messages: messages.length,
  });

  const response = await fetch(`${endpointUrl}?key=${encodeURIComponent(apiKey.trim())}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  console.log("[llm] Vertex response status", response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[llm] Vertex error", response.status, response.statusText, errorText.slice(0, 300));
    throw new Error(`Vertex 调用失败: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
      finishReason?: string;
    }>;
  };

  const text =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";

  console.log("[llm] Vertex success", {
    preview: text.slice(0, 120),
    length: text.length,
  });

  return {
    id: "",
    created: Math.floor(Date.now() / 1000),
    model: "vertex",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        finish_reason: data.candidates?.[0]?.finishReason ?? "STOP",
      },
    ],
  };
}

export async function invokeLLM(params: InvokeParams, override?: LlmOverride): Promise<InvokeResult> {
  const apiKey = override?.apiKey ?? getLlmConfig().llmApiKey;
  if (!apiKey || !apiKey.trim()) {
    throw new Error("请先在「设置」中配置 LLM API Key（仅当前浏览器/设备可用，他人无法使用）。");
  }

  const provider = override?.provider ?? "openai";
  if (provider === "google") {
    return invokeGemini(params.messages, apiKey);
  }
  if (provider === "vertex") {
    const endpointUrl = (override?.apiUrl ?? getLlmConfig().llmApiUrl)?.trim();
    if (!endpointUrl) {
      throw new Error("Vertex 模式需要在设置中配置完整的 API 地址。");
    }
    return invokeVertex(params.messages, endpointUrl, apiKey);
  }

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
  } = params;

  const payload: Record<string, unknown> = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage),
  };

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(toolChoice || tool_choice, tools);
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  payload.max_tokens = 32768;
  payload.thinking = {
    budget_tokens: 128,
  };

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const url = resolveApiUrl(override?.apiUrl);
  console.log("[llm] OpenAI-compatible request", {
    url,
    hasKey: Boolean(apiKey),
    messages: messages.length,
  });
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[llm] OpenAI-compatible error", response.status, response.statusText, errorText.slice(0, 300));
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  return (await response.json()) as InvokeResult;
}
