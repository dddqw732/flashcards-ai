"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS } from "@/lib/plans";

const features = [
  {
    title: "AI-Powered Flashcards",
    description: "Automatically generate smart flashcards from long texts or videos.",
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
    ),
  },
  {
    title: "Export to Anki",
    description: "Seamlessly export your flashcards to Anki for efficient study.",
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5M3 7.5v10.125A2.375 2.375 0 005.375 20h13.25A2.375 2.375 0 0021 17.625V7.5M3 7.5h18" /></svg>
    ),
  },
  {
    title: "Supports Text & Video",
    description: "Upload documents or video files and let AI do the rest.",
    icon: (
      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 018.25 19.5V9m7.5 0h-9" /></svg>
    ),
  },
];

const steps = [
  {
    title: "Upload Content",
    description: "Add your long text or video file in seconds.",
  },
  {
    title: "AI Generates Flashcards",
    description: "Our advanced AI instantly creates smart, effective flashcards for you.",
  },
  {
    title: "Export & Study",
    description: "Export to Anki and start mastering your material!",
  },
];

const testimonials = [
  {
    name: "Sarah K.",
    text: "Flashcards AI saved me hours of study prep! The flashcards are spot-on and super helpful.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    name: "James L.",
    text: "I love how easy it is to turn my lecture videos into Anki cards. Game changer!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    name: "Dr. Emily Tran",
    text: "As an educator, this tool helps my students focus on what matters most. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  },
];

const socialProof = [
  "Harvard",
  "MIT",
  "Stanford",
  "Oxford",
  "Yale",
  "UCLA",
];

const shareLinks = [
  {
    name: "Twitter",
    url: "https://twitter.com/intent/tweet?text=Check%20out%20Flashcards%20AI%20to%20turn%20any%20text%20or%20video%20into%20smart%20flashcards!%20https://flashcardsai.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19.633 7.997c.013.176.013.353.013.53 0 5.39-4.104 11.61-11.61 11.61-2.307 0-4.453-.676-6.26-1.84.32.038.637.05.97.05 1.92 0 3.687-.65 5.096-1.747-1.793-.037-3.308-1.217-3.833-2.847.25.037.5.062.763.062.37 0 .74-.05 1.085-.144-1.87-.375-3.28-2.03-3.28-4.017v-.05c.55.306 1.18.49 1.85.513a4.07 4.07 0 01-1.81-3.39c0-.75.2-1.45.55-2.05a11.62 11.62 0 008.42 4.27c-.062-.3-.1-.6-.1-.92 0-2.22 1.8-4.02 4.02-4.02 1.16 0 2.22.487 2.96 1.27a7.97 7.97 0 002.56-.98 4.01 4.01 0 01-1.77 2.22 8.04 8.04 0 002.31-.62 8.6 8.6 0 01-2.01 2.09z" /></svg>
    ),
  },
  {
    name: "Facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=https://flashcardsai.com",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.406.595 24 1.326 24H12.82v-9.294H9.692v-3.622h3.127V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.674V1.326C24 .592 23.406 0 22.675 0" /></svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/shareArticle?mini=true&url=https://flashcardsai.com&title=Flashcards%20AI&summary=Turn%20any%20text%20or%20video%20into%20smart%20flashcards!",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11.75 20h-3v-10h3v10zm-1.5-11.27c-.97 0-1.75-.79-1.75-1.76s.78-1.76 1.75-1.76c.97 0 1.75.79 1.75 1.76s-.78 1.76-1.75 1.76zm15.25 11.27h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z" /></svg>
    ),
  },
];

const changingTexts = [
  "instantly",
  "effortlessly", 
  "intelligently",
  "automatically",
];

// Particle component with fixed positions to prevent hydration mismatch
const Particle = ({ delay, index }: { delay: number; index: number }) => {
  // Use deterministic positions based on index to prevent hydration mismatch
  const leftPosition = ((index * 17.3) % 100);
  
  return (
    <motion.div
      className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
      animate={{
        y: [0, -100, -200, -300, -400],
        x: [0, 30, -20, 10, -5],
        opacity: [0, 1, 1, 1, 0],
      }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{
        left: `${leftPosition}%`,
        bottom: -10,
      }}
    />
  );
};

function SubscriptionPlans({ user }: { user: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (variantId: string) => {
    setLoading(variantId);
    try {
      const email = user?.email;
      if (!email) throw new Error("You must be signed in to subscribe.");
      const returnUrl = window.location.origin + "/dashboard";
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, email, returnUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      alert("Failed to start checkout: " + (err as any).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="max-w-4xl mx-auto w-full py-16 px-6 md:px-0 text-center relative z-10" id="plans">
      <h2 className="text-3xl font-bold text-white mb-8">Subscription Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div key={plan.id} className="bg-gray-800/80 rounded-2xl p-8 border border-gray-700/50 shadow-xl flex flex-col items-center">
            <h3 className="text-xl font-bold text-blue-400 mb-2">{plan.name}</h3>
            <div className="text-2xl font-bold text-white mb-2">{plan.price}</div>
            <div className="text-gray-300 mb-4">{plan.description}</div>
            <ul className="text-gray-400 text-sm mb-6 text-left list-disc list-inside">
              {plan.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-60"
              onClick={() => handleSubscribe(plan.variantId)}
              disabled={loading === plan.variantId}
            >
              {loading === plan.variantId ? "Redirecting..." : "Subscribe"}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % changingTexts.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex flex-col relative overflow-hidden">
      {/* Moving Particles Background */}
      {Array.from({ length: 50 }).map((_, i) => (
        <Particle key={i} delay={i * 0.3} index={i} />
      ))}
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full py-6 px-6 md:px-12 flex justify-between items-center backdrop-blur-sm bg-gray-900/50 border-b border-gray-700/30 relative z-10"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-2xl font-bold text-white"
        >
          Flashcards <span className="text-blue-400">AI</span>
        </motion.div>
        <nav className="hidden md:flex gap-8">
          <motion.a 
            whileHover={{ y: -2 }}
            href="#features" 
            className="text-gray-300 hover:text-blue-400 transition-colors"
          >
            Features
          </motion.a>
          <motion.a 
            whileHover={{ y: -2 }}
            href="#how-it-works" 
            className="text-gray-300 hover:text-blue-400 transition-colors"
          >
            How it Works
          </motion.a>
          <motion.a 
            whileHover={{ y: -2 }}
            href="#testimonials" 
            className="text-gray-300 hover:text-blue-400 transition-colors"
          >
            Reviews
          </motion.a>
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-blue-400 px-4 py-2 transition-colors font-medium"
                >
                  Dashboard
                </motion.button>
              </Link>
              <button
                onClick={() => signOut()}
                className="text-gray-300 hover:text-red-400 px-4 py-2 transition-colors font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-300 hover:text-blue-400 px-4 py-2 transition-colors font-medium"
                >
                  Sign In
                </motion.button>
              </Link>
              <Link href="/convert">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-colors font-medium"
                >
                  Get Started
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </motion.header>

      {/* Hero Section */}
      <header className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-16 pb-12 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight drop-shadow-2xl"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
        >
          Flashcards <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-2xl md:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto font-light"
        >
          Transform your content into smart flashcards{" "}
          <motion.span
            key={currentTextIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-blue-400 font-semibold inline-block"
          >
            {changingTexts[currentTextIndex]}
          </motion.span>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
        >
          Upload text or YouTube videos and watch AI create professional Anki-ready flashcards in seconds.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mb-16"
        >
          {user ? (
            <Link href="/convert">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-full px-10 py-4 text-xl shadow-xl transition-all duration-300"
              >
                Start Creating Flashcards
              </motion.button>
            </Link>
          ) : (
            <Link href="/auth">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-full px-10 py-4 text-xl shadow-xl transition-all duration-300"
              >
                Sign Up & Start Creating
              </motion.button>
            </Link>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 font-semibold rounded-full px-10 py-4 text-xl transition-colors duration-300"
          >
            Watch Demo
          </motion.button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-wrap justify-center gap-4 opacity-70"
        >
          <span className="text-gray-400 text-sm mr-4">Trusted by students at:</span>
          {socialProof.map((name, index) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 + index * 0.1 }}
              className="bg-gray-800/60 text-gray-300 rounded-full px-4 py-1 text-xs font-semibold border border-gray-700/50"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </header>

      {/* Demo Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6 md:px-12 relative z-10"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            className="bg-gray-800/50 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-700/30"
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center h-96 text-gray-400 text-xl">
              🎥 Interactive Demo Coming Soon
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="bg-gray-800/30 backdrop-blur-xl rounded-t-3xl shadow-2xl max-w-6xl mx-auto w-full py-20 px-6 md:px-12 mb-8 border border-gray-700/30 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-white mb-16 text-center drop-shadow-lg"
        >
          Powerful Features
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="flex flex-col items-center text-center bg-gray-800/40 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700/30"
            >
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="mb-6 p-4 bg-gray-700/50 rounded-2xl"
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 text-lg leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="max-w-5xl mx-auto w-full py-20 px-6 md:px-0 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white mb-16 text-center drop-shadow-lg"
        >
          How it Works
        </motion.h2>
        <ol className="relative border-l border-blue-400/30 ml-8">
          {steps.map((step, idx) => (
            <motion.li 
              key={idx}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.3 }}
              viewport={{ once: true }}
              className="mb-16 ml-8"
            >
              <motion.span 
                whileHover={{ scale: 1.2 }}
                className="absolute flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full -left-6 ring-4 ring-gray-800 text-white font-bold text-xl shadow-lg"
              >
                {idx + 1}
              </motion.span>
              <motion.div
                whileHover={{ x: 10 }}
                className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/30"
              >
                <h3 className="font-bold text-white text-2xl mb-3">{step.title}</h3>
                <p className="text-gray-300 text-lg leading-relaxed">{step.description}</p>
              </motion.div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Subscription Plans Section */}
      <SubscriptionPlans user={user} />

      {/* Testimonials Section */}
      <section id="testimonials" className="max-w-6xl mx-auto w-full py-20 px-6 md:px-0 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold text-white mb-16 text-center drop-shadow-lg"
        >
          What People Are Saying
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((t, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 flex flex-col items-center text-center shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-700/30"
            >
              <motion.img 
                whileHover={{ scale: 1.1 }}
                src={t.avatar} 
                alt={t.name} 
                className="w-20 h-20 rounded-full mb-6 border-4 border-blue-400/30 object-cover shadow-lg" 
              />
              <p className="text-gray-300 text-lg mb-6 leading-relaxed italic">"{t.text}"</p>
              <span className="text-blue-400 text-lg font-bold">{t.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Share Section */}
      <section className="max-w-3xl mx-auto w-full py-16 px-6 md:px-0 text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-2xl md:text-3xl font-bold text-white mb-8 drop-shadow-lg"
        >
          Share Flashcards AI
        </motion.h2>
        <div className="flex justify-center gap-8 mt-4">
          {shareLinks.map((link, idx) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.2, y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="bg-gray-800/60 hover:bg-blue-600 text-gray-300 hover:text-white rounded-full p-4 shadow-lg transition-all duration-300 border border-gray-700/30"
              title={`Share on ${link.name}`}
            >
              {link.icon}
            </motion.a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-400 text-sm mt-auto bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/30 relative z-10">
        &copy; {new Date().getFullYear()} Flashcards AI. All rights reserved.
      </footer>
    </div>
  );
}
