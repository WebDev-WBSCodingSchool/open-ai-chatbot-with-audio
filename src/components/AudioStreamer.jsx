import { forwardRef, useState } from 'react';

const AudioStreamer = forwardRef(({ loading, prompt }, ref) => {
  const [showControls, setShowControls] = useState(false);

  const getAudio = async text => {
    try {
      if (!prompt) throw new Error('Prompt is required');
      const res = await fetch(`${import.meta.env.VITE_OPENAI_PROXY}/api/v1/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json ',
          provider: 'open-ai',
          mode: import.meta.env.VITE_OPENAI_PROXY_MODE
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: 'echo',
          input: text
        })
      });
      if (!res.ok) throw new Error(await res.json());
      // Create a new MediaSource and set the audio source to the URL
      const mediaSource = new MediaSource();
      ref.current.src = URL.createObjectURL(mediaSource);
      setShowControls(true);
      // Add an event listener to the MediaSource to handle the sourceopen event
      mediaSource.addEventListener('sourceopen', () => {
        // Create a new SourceBuffer and set the MIME type to audio/mpeg
        const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
        // Create a new ReadableStream from the response body
        const reader = res.body.getReader();
        // Create a queue to store the chunks of data
        const queue = [];
        // Create a flag to check if the source buffer is updating
        let sourceBufferUpdating = false;

        // Create a function to process the queue
        const processQueue = () => {
          // If the source buffer is not updating and the queue is not empty
          if (!sourceBufferUpdating && queue.length > 0) {
            // Set the source buffer updating flag to true
            sourceBufferUpdating = true;
            // Shift the first chunk from the queue
            const chunk = queue.shift();
            // Append the chunk to the source buffer
            sourceBuffer.appendBuffer(chunk);
          }
        };
        // Add an event listener to the source buffer to handle the updateend event
        sourceBuffer.addEventListener('updateend', () => {
          // Set the source buffer updating flag to false
          sourceBufferUpdating = false;
          // Process the queue
          processQueue();
        });
        // Create a function to read the stream
        const readStream = async () => {
          // Create a function to process the chunks
          const processChunk = async () => {
            // Read a chunk from the stream
            const { done, value } = await reader.read();
            // If the stream is done, end the media source
            if (done) return mediaSource.endOfStream();
            // Push the next chunk to the queue
            queue.push(value);
            // Process the queue
            processQueue();
            // Recursively process the next chunk
            await processChunk();
          };
          // Process the first chunk
          await processChunk();
        };
        // Start reading the stream
        readStream().catch(error => console.error('Stream error:', error));
      });
      // Play the audio
      ref.current.play();
    } catch (error) {
      console.error(error);
    }
  };
  if (loading) return null;
  return (
    <div className='flex  items-center justify-end gap-5'>
      <audio ref={ref} controls={showControls} className='w-full bg-transparent'></audio>
      <button className='btn' onClick={() => getAudio(prompt)} disabled={showControls}>
        Read it to me
      </button>
    </div>
  );
});

AudioStreamer.displayName = 'AudioStreamer';

export default AudioStreamer;
