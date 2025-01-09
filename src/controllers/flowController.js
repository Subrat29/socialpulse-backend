require('dotenv').config();
const LangflowClient = require('../LangflowClient');

const flowIdOrName = '64432a17-62c7-4c33-8c40-9bfdaccb26d5';
const langflowId = '7670fdd8-a178-4a64-b2a4-6e61e489b07a';
const applicationToken = process.env.APPLICATION_TOKEN;

// Ensure the application token is present
if (!applicationToken) {
    console.error("Error: Application token is missing. Please set it in your .env file.");
    process.exit(1);
}

// Initialize Langflow Client
const langflowClient = new LangflowClient('https://api.langflow.astra.datastax.com', applicationToken);

// Controller to handle running a flow
exports.runFlow = async (req, res) => {
    const { inputValue, inputType = 'chat', outputType = 'chat', stream = false } = req.body;

    if (!inputValue) {
        return res.status(400).json({ success: false, error: 'Input value is required' });
    }

    // Initialize tweaks without the ChatInput value to avoid conflict
    const tweaks = {
        "ParseData-WRYuB": {},
        "Prompt-R6nZp": {},
        "OpenAIModel-QnZH3": {},
        "ChatOutput-g328R": {},
        "AstraDB-8DZnm": {},
        "CustomComponent-shd7O": {},
        "CombineText-2et2F": {},
        "Prompt-t5kP1": {},
        "ChatOutput-f8eIP": {},
        "SplitText-vFUSw": {},
        "AstraDB-6ZUKm": {},
        "File-RbRjr": {}
    };

    try {
        if (stream) {
            // Handle streaming response
            const eventSource = await langflowClient.runFlow(
                flowIdOrName,
                langflowId,
                inputValue,
                inputType,
                outputType,
                tweaks,
                true,
                (data) => {
                    if (res.writableEnded) return;
                    res.write(`data: ${JSON.stringify(data)}\n\n`);
                },
                () => {
                    if (!res.writableEnded) res.end();
                },
                (error) => {
                    console.error("Stream Error:", error);
                    if (!res.writableEnded) {
                        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
                        res.end();
                    }
                }
            );

            // Set up SSE headers
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });
        } else {
            // Handle non-streaming response
            const response = await langflowClient.runFlow(
                flowIdOrName,
                langflowId,
                inputValue,
                inputType,
                outputType,
                tweaks,
                false
            );

            if (response?.outputs?.[0]?.outputs?.[0]?.outputs?.message?.text) {
                const output = response.outputs[0].outputs[0].outputs.message.text;
                res.json({ success: true, output });
            } else {
                throw new Error('Invalid response format from Langflow');
            }
        }
    } catch (error) {
        console.error("Run Flow Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};