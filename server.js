const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));  // Serve static files (HTML, JS) from the 'public' directory
app.use(express.json())

// This endpoint streams the chat response
app.post('/chat', async (req, res) => {
  console.log(req.body)
  const message = req.body.message;

  try {
    const data = {
      "model": "deepseek-r1", 
      "messages": [
        { "role": "system", "content": "You are a helpful assistant." },
        { "role": "user", "content": "Hello, how are you?" }
      ]
    };
    
    // fetch('http://127.0.0.1:11434/v1/chat/completions', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(data)
    // })
    //   .then(response => response.json())
    //   .then(data => console.log('Response:', data.choices[0].message))
    //   .catch(error => console.error('Error:', error));
    const response = await axios.post('http://127.0.0.1:11434/v1/chat/completions', {
      model: "deepseek-r1", 
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: message }
      ],
      stream: true,  // Enable streaming
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      responseType: 'stream',  // Receive the response as a stream
    });

    // Stream the response back to the client
    response.data.on('data', (chunk) => {
      res.write(chunk);
    });

    response.data.on('end', () => {
      res.end();
    });
  } catch (error) {
    // console.error('Error:', error);
    res.status(500).send('Error interacting with Ollama API');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
