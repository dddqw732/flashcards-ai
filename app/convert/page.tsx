"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  question: string;
  answer: string;
}

export default function ConvertPage() {
  const [mode, setMode] = useState<"text" | "youtube">("text");
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  function parseFlashcards(text: string): Flashcard[] {
    // Parse the AI response which should be in Anki format (question|answer per line)
    const lines = text.split('\n').filter(line => line.trim() && line.includes('|'));
    const cards: Flashcard[] = [];
    
    for (const line of lines) {
      const pipeIndex = line.indexOf('|');
      if (pipeIndex > 0 && pipeIndex < line.length - 1) {
        const question = line.substring(0, pipeIndex).trim();
        const answer = line.substring(pipeIndex + 1).trim();
        if (question && answer) {
          cards.push({ question, answer });
        }
      }
    }
    
    // Fallback: if no pipe-separated cards found, try the old format
    if (cards.length === 0) {
      const fallbackLines = text.split('\n').filter(line => line.trim());
      let currentQuestion = '';
      let currentAnswer = '';
      
      for (const line of fallbackLines) {
        if (line.match(/^(\d+\.|\*|-|Q:|Question:)/i)) {
          if (currentQuestion && currentAnswer) {
            cards.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
          }
          currentQuestion = line.replace(/^(\d+\.|\*|-|Q:|Question:)/i, '').trim();
          currentAnswer = '';
        } else if (line.match(/^(A:|Answer:)/i)) {
          currentAnswer = line.replace(/^(A:|Answer:)/i, '').trim();
        } else if (currentQuestion && !currentAnswer) {
          currentQuestion += ' ' + line.trim();
        } else if (currentAnswer) {
          currentAnswer += ' ' + line.trim();
        }
      }
      
      if (currentQuestion && currentAnswer) {
        cards.push({ question: currentQuestion.trim(), answer: currentAnswer.trim() });
      }
    }
    
    return cards.length > 0 ? cards : [{ question: "Generated Content", answer: text }];
  }

  async function handleGenerate() {
    setLoading(true);
    setFlashcards([]);
    setError(null);
    setCurrentCard(0);
    setIsFlipped(false);
    
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          value: mode === "text" ? text : youtubeUrl,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate flashcards");
      }
      
      const data = await res.json();
      const cards = parseFlashcards(data.result || "");
      setFlashcards(cards);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function downloadAnkiFile() {
    if (flashcards.length === 0) return;
    
    const ankiContent = flashcards
      .map(card => `${card.question}|${card.answer}`)
      .join('\n');
    
    const blob = new Blob([ankiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      {/* Animated Gradient Blobs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-400 opacity-20 rounded-full blur-3xl z-0"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-400 opacity-15 rounded-full blur-3xl z-0"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-xl z-10"
      >
        <div className="bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col gap-8 border border-gray-700/50 relative">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 drop-shadow-xl">
            Convert Content to Smart Flashcards
          </h1>
          
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-4">
            <button
              className={`px-5 py-2 rounded-full font-semibold transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${mode === "text" ? "bg-blue-600 text-white shadow-lg scale-105" : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/80"}`}
              onClick={() => setMode("text")}
            >
              Text Input
            </button>
            <button
              className={`px-5 py-2 rounded-full font-semibold transition-all text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-blue-400/60 ${mode === "youtube" ? "bg-blue-600 text-white shadow-lg scale-105" : "bg-gray-700/60 text-gray-300 hover:bg-gray-600/80"}`}
              onClick={() => setMode("youtube")}
            >
              YouTube Link
            </button>
          </div>
          
          {/* Input Area */}
          <AnimatePresence mode="wait" initial={false}>
            {mode === "text" ? (
              <motion.textarea
                key="text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full min-h-[160px] rounded-xl border border-gray-600/40 bg-gray-700/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-4 text-gray-100 text-base resize-none transition-all shadow-inner placeholder-gray-400"
                placeholder="Paste or type your long text here..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
            ) : (
              <motion.input
                key="youtube"
                type="url"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full rounded-xl border border-gray-600/40 bg-gray-700/60 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 p-4 text-gray-100 text-base transition-all shadow-inner placeholder-gray-400"
                placeholder="Paste a YouTube video URL..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.04, backgroundColor: "#2563eb" }}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full py-3 text-lg shadow-xl transition-colors duration-200 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400/60 disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleGenerate}
            disabled={loading || (mode === "text" ? !text.trim() : !youtubeUrl.trim())}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                {mode === "youtube" ? "Processing video... (1-3 min)" : "Generating..."}
              </span>
            ) : (
              "Generate Flashcards"
            )}
          </motion.button>
          
          {/* YouTube Warning */}
          {mode === "youtube" && !loading && (
            <div className="text-yellow-400 text-sm text-center mt-2 bg-yellow-900/20 rounded-lg p-3 border border-yellow-700/30">
              ⚠️ YouTube processing takes 1-3 minutes (download + transcription + AI)
            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-red-900/50 rounded-xl p-4 text-red-300 shadow-inner text-base border border-red-700/50"
            >
              {error}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Flashcard Viewer */}
      {flashcards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-4xl z-10 mt-8 px-4"
        >
          <div className="bg-gray-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-gray-700/50">
            {/* Card Counter & Download */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-300 text-sm font-medium">
                Card {currentCard + 1} of {flashcards.length}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition-colors font-medium shadow-lg"
                onClick={downloadAnkiFile}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export to Anki
              </motion.button>
            </div>
            
            {/* Flashcard */}
            <div 
              className="relative h-80 cursor-pointer perspective-1000"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front (Question) */}
                <div 
                  className="absolute inset-0 bg-white rounded-2xl shadow-xl flex items-center justify-center p-8 text-center border-2 border-gray-200"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="max-w-full">
                    <div className="text-gray-500 text-sm mb-3 font-medium uppercase tracking-wider">Question</div>
                    <p className="text-gray-800 text-xl font-medium leading-relaxed break-words">
                      {flashcards[currentCard]?.question}
                    </p>
                    <div className="text-gray-400 text-sm mt-6">Click to reveal answer</div>
                  </div>
                </div>
                
                {/* Back (Answer) */}
                <div 
                  className="absolute inset-0 bg-blue-50 rounded-2xl shadow-xl flex items-center justify-center p-8 text-center border-2 border-blue-200"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="max-w-full">
                    <div className="text-blue-600 text-sm mb-3 font-medium uppercase tracking-wider">Answer</div>
                    <p className="text-gray-800 text-xl leading-relaxed break-words">
                      {flashcards[currentCard]?.answer}
                    </p>
                    <div className="text-blue-500 text-sm mt-6">Click to see question</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                onClick={() => {
                  setCurrentCard(Math.max(0, currentCard - 1));
                  setIsFlipped(false);
                }}
                disabled={currentCard === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </motion.button>
              
              <div className="text-gray-400 text-sm">
                {flashcards.length} cards generated
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                onClick={() => {
                  setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1));
                  setIsFlipped(false);
                }}
                disabled={currentCard === flashcards.length - 1}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
} 