const { OpenAI } = require('openai');
const openai = new OpenAI({ 
  apiKey: 'YOUR_GROQ_API_KEY',
  baseURL: 'https://api.groq.com/openai/v1'
});

async function test() {
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'You are an interviewer. Always respond in JSON format with a \"message\" field.' },
        { role: 'user', content: 'Hello' }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });
    console.log(response.choices[0].message.content);
  } catch (e) {
    console.error('ERROR:', e.message, e.response?.data || e);
  }
}
test();
