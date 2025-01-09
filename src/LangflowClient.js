const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const EventSource = require('eventsource');

class LangflowClient {
    constructor(baseURL, applicationToken) {
        this.baseURL = baseURL;
        this.applicationToken = applicationToken;
    }

    async post(endpoint, body, headers = { "Content-Type": "application/json" }) {
        headers["Authorization"] = `Bearer ${this.applicationToken}`;
        const url = `${this.baseURL}${endpoint}`;
        console.log('Making Request:', url);
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
                timeout: 30000 // 30 seconds
            });
    
            const responseMessage = await response.json();
            if (!response.ok) {
                throw new Error(`${response.status} ${response.statusText} - ${JSON.stringify(responseMessage)}`);
            }
            return responseMessage;
        } catch (error) {
            console.error('Request Error:', error);
            throw error;
        }
    }

    async initiateSession(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', stream = false, tweaks = {}) {
        const endpoint = `/lf/${langflowId}/api/v1/run/${flowId}?stream=${stream}`;
        const body = {
            input_value: inputValue,
            input_type: inputType,
            output_type: outputType,
            tweaks: tweaks
        };
        return this.post(endpoint, body);
    }

    handleStream(streamUrl, onUpdate, onClose, onError) {
        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                onUpdate(data);
            } catch (error) {
                console.error('Error parsing stream data:', error);
                onError(error);
            }
        };

        eventSource.onerror = event => {
            console.error('Stream Error:', event);
            onError(event);
            eventSource.close();
        };

        eventSource.addEventListener("close", () => {
            onClose('Stream closed');
            eventSource.close();
        });

        return eventSource;
    }

    async runFlow(flowId, langflowId, inputValue, inputType = 'chat', outputType = 'chat', tweaks = {}, stream = false, onUpdate, onClose, onError) {
        try {
            const response = await this.initiateSession(
                flowId,
                langflowId,
                inputValue,
                inputType,
                outputType,
                stream,
                tweaks
            );

            if (stream && response?.outputs?.[0]?.outputs?.[0]?.artifacts?.stream_url) {
                const streamUrl = response.outputs[0].outputs[0].artifacts.stream_url;
                console.log(`Streaming from: ${streamUrl}`);
                return this.handleStream(
                    streamUrl,
                    onUpdate || console.log,
                    onClose || (() => console.log('Stream closed')),
                    onError || console.error
                );
            }

            if (!response || !response.outputs) {
                throw new Error('Invalid API Response: Missing outputs');
            }

            return response;
        } catch (error) {
            console.error('Error running flow:', error);
            throw error;
        }
    }
}

module.exports = LangflowClient;