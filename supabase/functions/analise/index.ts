import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// To disable JWT verification, set --no-verify-jwt on deploy
// or configure in config.toml
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { criancaNome, contextoTitulo, avaliacoes } = await req.json();

    if (!avaliacoes || avaliacoes.length === 0) {
      return new Response(
        JSON.stringify({ error: "Nenhuma avaliação fornecida." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build a structured summary for Claude
    const sessionsText = avaliacoes.map((session: any) => {
      const date = session.date;
      const avaliador = session.avaliador;
      const ratings = session.ratings
        .map((r: any) => `  - ${r.indicador}: ${r.valor}/5`)
        .join("\n");
      return `Sessão ${date} (por ${avaliador}), média ${session.avg.toFixed(1)}:\n${ratings}`;
    }).join("\n\n");

    const prompt = `Você é um conselheiro especialista em desenvolvimento infantil. Analise os dados de avaliação abaixo para a criança "${criancaNome}" no contexto "${contextoTitulo}".

Os indicadores são avaliados em uma escala de 1 a 5:
1 = Muito Baixo, 2 = Baixo, 3 = Regular, 4 = Bom, 5 = Excelente

Dados das avaliações (da mais recente para a mais antiga):

${sessionsText}

Com base nesses dados, forneça:

1. **Resumo Geral**: Uma visão geral do desenvolvimento da criança neste contexto.
2. **Pontos Fortes**: Indicadores com bom desempenho ou melhoria consistente.
3. **Pontos de Atenção**: Indicadores com baixo desempenho ou tendência de queda.
4. **Evolução**: Análise da tendência geral (melhora, estabilidade ou regressão).
5. **Sugestões Práticas**: 3-5 recomendações concretas e aplicáveis para os responsáveis.

Responda em português brasileiro, de forma acolhedora e construtiva. Evite jargão técnico excessivo. Seja específico nos dados ao mencionar indicadores.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar análise. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await response.json();
    const text = result.content?.[0]?.text ?? "Não foi possível gerar a análise.";

    return new Response(
      JSON.stringify({ analise: text }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("Edge function error:", e);
    return new Response(
      JSON.stringify({ error: "Erro interno. Tente novamente." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
