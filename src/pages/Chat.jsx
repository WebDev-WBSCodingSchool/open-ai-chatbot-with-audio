import { useEffect, useRef, useState } from 'react';
import { ChatCointainer, RequestForm } from '@/components';

const systemPrompt =
  'You are Gollum, from Lord of the Rings, you became a senior software engineer and are as helpful as you are annoying';

const Chat = () => {
  const chatRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'system',
      content: systemPrompt
    }
  ]);

  useEffect(() => {
    chatRef.current.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages]);

  return (
    <div className='container mx-auto h-[calc(100vh-68px)] flex flex-col justify-around'>
      <div ref={chatRef} className='h-[75%] p-5 bg-base-200 rounded-lg shadow-md overflow-y-scroll'>
        <ChatCointainer loading={loading} messages={messages} />
      </div>
      <div className='h-[20%] p-5 bg-base-200 rounded-lg shadow-md'>
        <RequestForm
          loading={loading}
          setLoading={setLoading}
          messages={messages}
          setMessages={setMessages}
          totalRequests={totalRequests}
          setTotalRequests={setTotalRequests}
        />
      </div>
    </div>
  );
};

export default Chat;
