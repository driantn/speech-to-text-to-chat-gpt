import { useRef, useState } from 'react';
import { GetServerSideProps } from 'next';
import absoluteUrl from 'next-absolute-url';
import { Layout } from '@/components/layout';
import { Button } from '@/components/button';
import { AudioRecorder } from '@/utils/audioRecorder';

export default function Home({ url }: { url: string }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'initial' | 'recording' | 'waiting'>(
    'initial',
  );
  const [result, setResult] = useState('');
  const intervalTime = useRef<NodeJS.Timer>();

  const onStart = async () => {
    setStatus('recording');
    await AudioRecorder.init();
    AudioRecorder.start();

    let count = 1;

    intervalTime.current = setInterval(() => {
      if (count === 10) return onStop();
      count += 1;
      setProgress(count * 10);
    }, 1000);
  };

  const onStop = async () => {
    clearInterval(intervalTime.current);
    setStatus('initial');
    setProgress(0);
    const { audioBlob, audioUrl } = await AudioRecorder.stop();
    sendTheFile(audioBlob);
  };

  const sendTheFile = (blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'transcribe.mp3');

    setStatus('waiting');

    fetch(url, {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((responseText) => {
        setStatus('initial');
        setResult(responseText.results?.[0]);
      });
  };

  const getButtonContent = () => {
    switch (status) {
      case 'recording':
        return 'Stop';
      case 'waiting':
        return (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );
      default:
        return 'Click me and see the magic happening.';
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 self-center w-[350px]">
        <Button
          onClick={async () => {
            if (status === 'initial') return await onStart();
            if (status === 'recording') return await onStop();
          }}
          className="self-center flex flex-row items-center justify-start"
        >
          {getButtonContent()}
        </Button>

        {status === 'recording' ? (
          <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700 flex flex-row justify-center">
            <div
              className="bg-green-500 h-1 rounded-full flex flex-row text-center"
              style={{ width: `${progress}%` }}
            >
              {`${progress / 10} sec`}
            </div>
          </div>
        ) : null}
      </div>

      {result ? <div className=" w-full p-4 mt-10">{result}</div> : null}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { protocol, host } = absoluteUrl(context.req, 'localhost:3000');
  const apiURL = `${protocol}//${host}/api/transcribe`;

  return {
    props: {
      url: apiURL,
    },
  };
};
