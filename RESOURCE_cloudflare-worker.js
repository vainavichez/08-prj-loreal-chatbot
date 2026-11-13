// Copy this code into your Cloudflare Worker script

export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const apiKey = env.OPENAI_API_KEY; // Make sure to name your secret OPENAI_API_KEY in the Cloudflare Workers dashboard
    const apiUrl = 'https://api.openai.com/v1/chat/completions';
    const userInput = await request.json();
    const systemPrompt = "You are L'Oréal's beauty assistant. Answer only questions about L'Oréal products, product recommendations, and beauty routines involving L'Oréal products. If a request is outside these topics, politely explain that you can only help with L'Oréal products and beauty routines, then invite an in-scope question. Do not invent product details; say when you are unsure.";

    const requestBody = {
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...userInput.messages.filter((message) => message.role === 'user' || message.role === 'assistant')
      ],
      max_completion_tokens: 300,
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }
};
