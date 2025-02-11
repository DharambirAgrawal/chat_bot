export async function POST(request: Request) {
    const { message } = await request.json()

    // Make the POST request to the chatbot API and start streaming
    const response = await fetch('https://special-space-sniffle-qwpp7j5w4q2xjw-11434.app.github.dev/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: "deepseek-r1",
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: message }
            ],
            stream: true, // Enable streaming
        }),
    })

    // Check if the response body exists and is readable
    if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let done
        let content = ""

        // Create a new Response stream that the frontend can consume
        const stream = new ReadableStream({
            async start(controller) {
                // Read chunks of data from the stream and process them
                while (!done) {
                    const { value, done } = await reader.read()
                    if (done) {
                        break
                    }


                    // Decode the chunk
                    const temp = decoder.decode(value, { stream: true })
                    if (temp.includes('data: [DONE]')) {
                        break
                    }
                    try {
                        // Remove the 'data: ' prefix if it exists
                        const jsonString = temp.startsWith('data: ') ? temp.slice(6) : temp
                      
                        const json = JSON.parse(jsonString)

                        // Append the new content to the stream
                        if (json.choices && json.choices[0].delta && json.choices[0].delta.content) {
                            content = json.choices[0].delta.content
                        }

                        // Push the content to the frontend in real-time
                        controller.enqueue(content)
                    } catch (error) {
                        console.error('Error parsing JSON:', error)
                    }
                }

                controller.close()
            },
        })

        return new Response(stream, {
            headers: { 'Content-Type': 'application/json' },
        })
    }

    return new Response('Failed to connect to chatbot API', { status: 500 })
}
