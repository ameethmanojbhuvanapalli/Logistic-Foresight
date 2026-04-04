import { useState } from 'react';
import axios from 'axios';
import Spinner from './Spinner';

export default function OrderControls({ onOrdersGenerated, onRegenerated }) {
  const [generateCount, setGenerateCount]       = useState('');
  const [regenerateCount, setRegenerateCount]   = useState('');
  const [generateStatus, setGenerateStatus]     = useState('idle');
  const [regenerateStatus, setRegenerateStatus] = useState('idle');
  const [generateMsg, setGenerateMsg]           = useState('');
  const [regenerateMsg, setRegenerateMsg]       = useState('');

  async function handleGenerate() {
    setGenerateStatus('loading');
    setGenerateMsg('');
    try {
      const { data } = await axios.post('/api/generate-orders', {
        count: generateCount === '' ? undefined : parseInt(generateCount, 10),
      });
      setGenerateStatus('success');
      setGenerateMsg(`${data.count} order${data.count !== 1 ? 's' : ''} published to Kafka`);
      onOrdersGenerated?.(data.orders);
      setTimeout(() => { setGenerateStatus('idle'); setGenerateMsg(''); }, 3000);
    } catch (err) {
      setGenerateStatus('error');
      setGenerateMsg(err.response?.data?.message || 'Failed to publish orders');
    }
  }

  async function handleRegenerate() {
    setRegenerateStatus('loading');
    setRegenerateMsg('');
    try {
      const { data } = await axios.post('/api/regenerate-orders', {
        count: regenerateCount === '' ? undefined : parseInt(regenerateCount, 10),
      });
      setRegenerateStatus('success');
      setRegenerateMsg(`Wiped ${data.deleted} · Inserted ${data.inserted} orders`);
      onRegenerated?.();
      setTimeout(() => { setRegenerateStatus('idle'); setRegenerateMsg(''); }, 3000);
    } catch (err) {
      setRegenerateStatus('error');
      setRegenerateMsg(err.response?.data?.message || 'Failed to regenerate orders');
    }
  }

  return (
    <div className="flex justify-evenly">
      <div className="border p-3 w-full space-y-2">
        <div className="flex justify-center space-x-5">

          {/* Generate Orders */}
          <div>
            <span className="text-xl mr-4 mb-3">Generate Orders: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1 w-24"
              type="number"
              min="1"
              max="3"
              placeholder="1–3"
              defaultValue={2}
              value={generateCount}
              onChange={(e) => setGenerateCount(e.target.value)}
              disabled={generateStatus === 'loading'}
            />
          </div>
          <button
            className="px-3 py-1 bg-[#ff8c8c] hover:bg-[#e96868] rounded-md text-white disabled:opacity-50"
            onClick={handleGenerate}
            disabled={generateStatus === 'loading'}
          >
            {generateStatus === 'loading' ? (
              <>
                Publishing{' '}
                <Spinner
                  spinColor="white"
                  backgroundColor="transparent"
                  width="20"
                  height="20"
                />
              </>
            ) : (
              'Publish'
            )}
          </button>

          {/* Regenerate Orders */}
          <div>
            <span className="text-xl mr-4 mb-3">Regenerate Orders: </span>
            <input
              className="border-2 border-[#ff8c8c] rounded-sm outline-none p-1 w-24"
              type="number"
              min="150000"
              placeholder="min 150000"
              defaultValue={150000}
              value={regenerateCount}
              onChange={(e) => setRegenerateCount(e.target.value)}
              disabled={regenerateStatus === 'loading'}
            />
          </div>
          <button
            className="px-3 py-1 bg-[#ff8c8c] hover:bg-[#e96868] rounded-md text-white disabled:opacity-50"
            onClick={handleRegenerate}
            disabled={regenerateStatus === 'loading'}
          >
            {regenerateStatus === 'loading' ? (
              <>
                Regenerating{' '}
                <Spinner
                  spinColor="white"
                  backgroundColor="transparent"
                  width="20"
                  height="20"
                />
              </>
            ) : (
              'Regenerate'
            )}
          </button>

        </div>

        {/* Status messages */}
        <div className="flex flex-col items-center justify-center space-y-1">
          {generateMsg && (
            <div className="text-xl font-semibold">
              Generate:{' '}
              <span className={`ml-1 text-xl font-bold ${generateStatus === 'error' ? 'text-red-500' : 'text-[#ff8c8c]'}`}>
                {generateMsg}
              </span>
            </div>
          )}
          {regenerateMsg && (
            <div className="text-xl font-semibold">
              Regenerate:{' '}
              <span className={`ml-1 text-xl font-bold ${regenerateStatus === 'error' ? 'text-red-500' : 'text-[#ff8c8c]'}`}>
                {regenerateMsg}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}