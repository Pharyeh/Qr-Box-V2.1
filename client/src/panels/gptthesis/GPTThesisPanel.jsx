import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { FiMaximize2, FiMinimize2, FiCopy, FiCheck } from 'react-icons/fi';
import { Card, CardContent } from '../../components/ui/card';
import { ScrollArea } from '../../components/ui/scroll-area';
import { useSymbolContext } from '../../context/SymbolContext';

export default function GPTThesisPanel({ selectedSymbol }) {
  const { timeframe } = useSymbolContext();
  const [report, setReport] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const [question, setQuestion] = useState('');
  const [followup, setFollowup] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedSymbol) {
      setReport('');
      setError('');
      return;
    }

    const fetchThesis = async () => {
      setLoading(true);
      setError('');
      setReport('');
      try {
        const res = await fetch('/api/gptthesis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: selectedSymbol, timeframe }),
        });
        if (!res.ok) throw new Error('GPT failed.');
        const data = await res.text();
        setReport(data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch GPT response.');
      } finally {
        setLoading(false);
      }
    };

    fetchThesis();
  }, [selectedSymbol, timeframe]);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setFollowup('');
    setFollowupError('');
    setFollowupLoading(true);
    try {
      const res = await fetch('/api/gptthesis/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol, question, timeframe }),
      });
      if (!res.ok) throw new Error('Follow-up failed');
      const data = await res.text();
      setFollowup(data);
    } catch (err) {
      console.error(err);
      setFollowupError('Failed to get follow-up.');
    } finally {
      setFollowupLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-4 h-full ${fullscreen ? 'fixed inset-0 bg-zinc-950 z-50 overflow-y-auto' : ''}`}>
      <Card className="h-full border border-zinc-800 rounded-lg bg-gradient-to-br from-zinc-900 to-zinc-950 shadow-xl">
        <CardContent className="p-4 h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold bg-gradient-to-r from-sky-300 to-sky-500 bg-clip-text text-transparent">
              🧠 GPT Thesis Generator
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFullscreen(!fullscreen)}
                className="text-white text-xl hover:text-sky-400 transition-colors duration-200"
              >
                {fullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
              <button
                onClick={handleCopy}
                className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <FiCheck className="text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <FiCopy />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-white text-sm">
            {loading && (
              <div className="italic text-zinc-400 animate-pulse">
                Generating thesis for <span className="text-pink-300">{selectedSymbol}</span>...
              </div>
            )}

            {!loading && !report && (
              <div className="text-zinc-500 text-center py-8">
                Click a symbol in Trade Ideas to generate a thesis.
              </div>
            )}

            {error && (
              <div className="text-red-400 mt-2 bg-red-900/20 p-3 rounded-lg border border-red-800">
                {error}
              </div>
            )}

            {report && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-sky-300">Summary</h3>
                  <span className="text-xs text-gray-500">
                    {/* Add logic to calculate and display the summary */}
                  </span>
                </div>
                <div className="mt-2">
                  {/* Add logic to display the summary card */}
                </div>
              </div>
            )}

            {report && (
              <ScrollArea className="h-[60vh] mt-2 border border-zinc-700 rounded-lg bg-zinc-950/50 px-4 py-2">
                <div className="prose prose-invert text-gray-100 text-sm">
                  <ReactMarkdown
                    components={{
                      h1: ({ node, ...props }) => (
                        <h1 className="text-xl font-bold mt-4 mb-2 text-sky-300" {...props} />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2 className="text-lg font-semibold mt-3 mb-2 text-sky-200" {...props} />
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-2 text-sm leading-relaxed" {...props} />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul className="list-disc ml-5 mb-2 space-y-1" {...props} />
                      ),
                      li: ({ node, ...props }) => (
                        <li className="text-sm mb-1" {...props} />
                      ),
                      strong: ({ node, ...props }) => (
                        <strong className="font-semibold text-white bg-zinc-800/50 px-1 rounded" {...props} />
                      ),
                    }}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {report}
                  </ReactMarkdown>
                </div>
              </ScrollArea>
            )}

            {report && (
              <form onSubmit={handleAsk} className="mt-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ask follow-up..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200"
                  />
                  <button
                    type="submit"
                    disabled={followupLoading}
                    className="mt-2 px-4 py-1.5 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {followupLoading ? 'Thinking...' : 'Ask'}
                  </button>
                </div>
              </form>
            )}

            {followupLoading && (
              <div className="text-xs text-gray-500 mt-2 animate-pulse">
                Processing your question...
              </div>
            )}
            
            {followupError && (
              <div className="text-red-400 mt-2 bg-red-900/20 p-3 rounded-lg border border-red-800">
                {followupError}
              </div>
            )}

            {followup && (
              <div className="mt-4 border-t border-zinc-700 pt-3 text-sm text-gray-300 bg-zinc-900/50 p-4 rounded-lg animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                <strong className="text-sky-300">Follow-up:</strong>
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => (
                      <p className="text-sm mb-2 leading-relaxed" {...props} />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-semibold text-white bg-zinc-800/50 px-1 rounded" {...props} />
                    ),
                  }}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {followup}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
