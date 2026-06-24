const CRISIS_SIGNALS = [
  "죽고 싶다",
  "사라지고 싶다",
  "나를 해치고 싶다",
  "누군가를 해치고 싶다",
  "더 이상 살 수 없다",
  "자해하고 싶다",
];

const RESPONSE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "indra_map_summary",
    "key_relationships",
    "hidden_needs",
    "self_image_reflections",
    "observer_reframe",
    "awareness_sentences",
    "next_questions",
    "safety_note",
  ],
  properties: {
    indra_map_summary: { type: "string" },
    key_relationships: { type: "array", items: { type: "string" } },
    hidden_needs: { type: "array", items: { type: "string" } },
    self_image_reflections: { type: "array", items: { type: "string" } },
    observer_reframe: { type: "string" },
    awareness_sentences: { type: "array", items: { type: "string" } },
    next_questions: { type: "array", items: { type: "string" } },
    safety_note: { type: "string" },
  },
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST 요청만 가능합니다." });
  }

  try {
    const body = await readJsonBody(req);

    if (hasCrisisSignal(body)) {
      return res.status(200).json({
        reflection: crisisReflection(),
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY 환경변수가 설정되어 있지 않습니다.",
      });
    }

    const openAIResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.2",
        input: [
          {
            role: "system",
            content: [
              {
                type: "input_text",
                text: systemPrompt(),
              },
            ],
          },
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: JSON.stringify(body, null, 2),
              },
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "maeum_indra_reflection",
            strict: true,
            schema: RESPONSE_SCHEMA,
          },
        },
      }),
    });

    const result = await openAIResponse.json();

    if (!openAIResponse.ok) {
      return res.status(openAIResponse.status).json({
        error: result.error?.message || "OpenAI API 호출에 실패했습니다.",
      });
    }

    const outputText = extractOutputText(result);
    const reflection = JSON.parse(outputText);

    return res.status(200).json({ reflection });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "AI 반조를 생성하지 못했습니다.",
    });
  }
};

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function hasCrisisSignal(payload) {
  const text = JSON.stringify(payload || {}).toLowerCase();
  return CRISIS_SIGNALS.some((signal) => text.includes(signal.toLowerCase()));
}

function crisisReflection() {
  return {
    indra_map_summary: "입력 안에 위기 신호가 포함되어 있어 일반 마음지도 해석을 멈춥니다.",
    key_relationships: [],
    hidden_needs: [],
    self_image_reflections: [],
    observer_reframe: "지금은 감정을 분석하기보다 안전을 먼저 확보해야 하는 자리로 보입니다.",
    awareness_sentences: [
      "지금 위험 신호가 있음을 알아차림 합니다.",
      "혼자 견디기보다 실제 도움에 연결되는 것이 우선임을 알아차림 합니다.",
    ],
    next_questions: [
      "지금 바로 연락할 수 있는 가까운 사람은 누구인가요?",
      "지역 응급실, 상담전화, 전문기관 중 지금 연결 가능한 곳은 어디인가요?",
    ],
    safety_note:
      "자해, 타해, 극심한 위기 신호가 있을 때는 이 앱의 해석을 중단하고 즉시 주변 사람, 지역 응급실, 상담전화, 전문기관에 연결해 주세요.",
  };
}

function systemPrompt() {
  return `
You are not a therapist, counselor, doctor, or diagnostic assistant.
You are a Korean "mind map guide" for an app called Maeum Indra.

Your role:
- organize the user's input into an Indra-net-like map of conditions
- reflect emotions, time, space, relationship, body sensation, self-image, and hidden needs together
- return the user to the observer position
- never diagnose, treat, or label the user
- never say "당신은 ~한 사람입니다"
- prefer expressions like "~한 마음이 조건 따라 일어난 것으로 보입니다"
- do not blindly take the user's side
- do not give medical or psychotherapy advice
- if the input includes self-harm, harm-to-others, or severe crisis signals, stop ordinary interpretation and recommend immediate real-world help

Return Korean JSON only.
Keep the tone calm, observational, non-diagnostic, and non-possessive.
Do not wrap the JSON in markdown.
`;
}

function extractOutputText(result) {
  if (result.output_text) return result.output_text;

  const chunks = [];
  for (const item of result.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        chunks.push(content.text);
      }
    }
  }

  if (!chunks.length) {
    throw new Error("OpenAI 응답에서 텍스트를 찾지 못했습니다.");
  }

  return chunks.join("");
}
