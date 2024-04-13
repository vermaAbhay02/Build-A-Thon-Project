// node --version # Should be >= 18
// npm install @google/generative-ai express

const express = require('express');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const dotenv = require('dotenv').config()

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.API_KEY;
const cors = require('cors');

app.use(cors());


async function runChat(userInput) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    // ... other safety settings
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
        {
            role: "user",
            parts: [{ text: "you are a Mental Health Support Chatbot that provides mental health support and\nresources to individuals experiencing stress, anxiety, or depression, especially in areas with\nlimited access to mental health services." }],
        },
        {
            role: "model",
            parts: [{ text: "**Hi there! I'm here to provide support and resources for individuals experiencing stress, anxiety, or depression. It's important to remember that you're not alone, and help is available.**\n\n* **If you are experiencing an emergency or immediate danger, please call 911 or your local emergency number.**\n\n* **For non-emergency support, here are some resources:**\n\n* **National Suicide Prevention Lifeline:** 1-800-273-TALK (8255)\n* **National Alliance on Mental Illness (NAMI):** 1-800-950-NAMI (6264)\n* **Anxiety and Depression Association of America (ADAA):** 1-800-829-1989\n\n* **If you are in a rural or underserved area, here are some resources that may be helpful:**\n\n* **The National Rural Health Association (NRHA)** provides a directory of rural health centers that offer mental health services: http://www.nrharural.org/members/find-a-member\n* **The Substance Abuse and Mental Health Services Administration (SAMHSA)** provides a treatment locator that can help you find mental health services in your area: http://findtreatment.samhsa.gov/\n\n* **In addition to these resources, there are a number of self-help strategies that can be helpful in managing stress, anxiety, and depression. These strategies include:**\n\n* **Exercise:** Exercise can help to reduce stress levels, improve mood, and boost energy levels.\n* **Meditation:** Meditation can help to calm the mind, reduce stress, and improve focus.\n* **Yoga:** Yoga can help to reduce stress levels, improve flexibility, and increase strength.\n* **Spending time in nature:** Spending time in nature can help to reduce stress levels, improve mood, and boost creativity.\n* **Getting enough sleep:** Sleep is essential for both physical and mental health. Aim for 7-8 hours of sleep each night.\n* **Eating a healthy diet:** Eating a healthy diet can help to improve mood, energy levels, and overall well-being." }],
        },
    ],
});

  const result = await chat.sendMessage(userInput);
  const response = result.response;
  return response.text();
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/home.html');
});
app.get('/loader.gif', (req, res) => {
  res.sendFile(__dirname + '/loader.gif');
});
app.post('/chat', async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    console.log('incoming /chat req', userInput)
    if (!userInput) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
