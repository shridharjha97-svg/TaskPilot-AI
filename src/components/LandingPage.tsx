import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, ShieldAlert, Clock, Flame, Zap, CheckCircle2, Star, 
  HelpCircle, ChevronDown, Mail, Users, ArrowRight, ShieldCheck, Cpu 
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "How does the 'AI Deadline Rescue Mode' actually work?",
      a: "When you activate Rescue Mode, our AI companion analyzes your active deadlines, filters out non-critical work, automatically updates teammates of delayed items, silences distracting notification channels, and breaks down your remaining high-priority tasks into sequential 15-minute micro-sprints."
    },
    {
      q: "Can I sync this with Google Calendar, Slack, and JIRA?",
      a: "Absolutely! Last Minute Life Saver integrates natively with Google Calendar, Outlook, Slack, Discord, and popular dev tools to sync your milestones automatically and flag potential risk delays."
    },
    {
      q: "Is my personal work data private?",
      a: "Yes. All task descriptions, documents, and conversation histories are encrypted in transit and at rest. Your data is strictly used to power your personal productivity predictions."
    },
    {
      q: "What is the gamification and Coin economy?",
      a: "As you beat deadlines and complete focus sessions, you accumulate Experience Points (XP) and Life Saver Coins. Coins can be redeemed to unlock custom dashboard skins, focus music tracks, and high-tier helper widgets."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Glow ambient spots */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full filter blur-[120px] pointer-events-none animate-mesh-1"></div>
      <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/15 rounded-full filter blur-[120px] pointer-events-none animate-mesh-2"></div>
      
      {/* Navigation header */}
      <nav id="landing-navbar" className="sticky top-0 z-50 glass-panel-heavy border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <ShieldAlert className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            TaskPilot AI
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300 text-sm">
          <a href="#features" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
          <a href="#timeline" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">How it works</a>
          <a href="#testimonials" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Success Stories</a>
          <a href="#pricing" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <button 
            id="landing-login-btn"
            onClick={onLogin} 
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            Log In
          </button>
          <button 
            id="landing-signup-btn"
            onClick={onGetStarted} 
            className="relative px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
          >
            Claim Rescue Plan
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero-section" className="relative pt-20 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-900/50 px-4 py-1.5 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-400 mb-8 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>Awarded #1 Global AI Workspace Architecture of 2026</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-extrabold text-5xl md:text-7xl tracking-tight leading-tight max-w-5xl text-slate-900 dark:text-white"
        >
          Your AI-Powered <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">Deadline Rescue</span> Companion
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed"
        >
          Stop drowning in micro-tasks and beating yourself up over missed timelines. Let our intelligent coordinator shield your attention, predict burnout, and orchestrate perfect workflow escapes.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
        >
          <button 
            id="hero-start-btn"
            onClick={onGetStarted} 
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-500/20 hover:scale-[1.03] hover:shadow-indigo-500/30 cursor-pointer"
          >
            <span>Initialize Workspace Free</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <a 
            href="#features" 
            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>See Active Demos</span>
          </a>
        </motion.div>

        {/* Live Preview / Stats Counter */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 w-full max-w-5xl rounded-3xl overflow-hidden glass-panel border border-slate-200 dark:border-slate-800 shadow-2xl p-3 md:p-4 group"
        >
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-900 flex flex-col">
            {/* Window control circles */}
            <div className="h-10 px-4 bg-slate-950/90 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
              </div>
              <div className="text-xs text-slate-500 font-mono">https://lifesaver.ai/alex-workspace</div>
              <div className="w-8"></div>
            </div>

            {/* Simulated Live dashboard view inside Landing page */}
            <div className="flex-1 bg-slate-950 flex p-6 text-left gap-6 overflow-hidden relative">
              {/* Overlay shadow */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950/70 pointer-events-none"></div>
              
              {/* Nav */}
              <div className="w-1/4 hidden md:flex flex-col gap-4 border-r border-slate-800/60 pr-4">
                <div className="h-8 w-32 bg-slate-800/80 rounded-lg animate-pulse"></div>
                <div className="space-y-2 mt-4">
                  <div className="h-6 w-full bg-indigo-500/15 rounded-lg border border-indigo-500/30"></div>
                  <div className="h-6 w-4/5 bg-slate-800/40 rounded-lg"></div>
                  <div className="h-6 w-3/4 bg-slate-800/40 rounded-lg"></div>
                  <div className="h-6 w-5/6 bg-slate-800/40 rounded-lg"></div>
                </div>
              </div>

              {/* Main content simulated */}
              <div className="flex-1 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold text-rose-400 tracking-wider uppercase font-mono bg-rose-500/10 px-2 py-1 rounded">Rescue active</span>
                    <h3 className="text-xl font-bold text-white mt-1">Good Morning, Alex 👋</h3>
                  </div>
                  <div className="px-3 py-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-semibold border border-indigo-500/30">
                    Productivity Score: 84%
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400">Current Hot Deadlines</span>
                      <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded font-mono">94% Delay Risk</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rose-500 to-orange-500 w-[94%]"></div>
                    </div>
                    <p className="text-xs text-slate-300 font-medium truncate">Final Product Architecture & API Design</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                    <span className="text-xs font-semibold text-indigo-400">AI Active Recommendations</span>
                    <p className="text-xs text-slate-400 italic">"Delegate slide template design to PM Maya to recover 2.5 hours of focus time for API schematics."</p>
                    <button className="self-start text-[10px] bg-indigo-600 text-white font-semibold px-2.5 py-1 rounded">Execute Action</button>
                  </div>
                </div>

                {/* Simulated Focus Ring */}
                <div className="flex items-center gap-4 bg-slate-900/50 border border-indigo-500/10 p-4 rounded-xl">
                  <div className="w-10 h-10 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20"></div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Active Pomodoro</div>
                    <div className="text-sm font-bold text-white">45m Deep Work Sprint active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Trusted Logos */}
      <section className="py-12 border-y border-slate-200/50 dark:border-slate-900/50 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Trusted by developers and creators at elite global organizations</p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-50 dark:opacity-40 grayscale hover:grayscale-0 transition-all">
            <span className="font-bold tracking-tight text-lg">GOOGLE</span>
            <span className="font-bold tracking-tight text-lg">STRIPE</span>
            <span className="font-bold tracking-tight text-lg">NOTION</span>
            <span className="font-bold tracking-tight text-lg">LINEAR</span>
            <span className="font-bold tracking-tight text-lg">GITHUB</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Everything You Need To Survive High-Pressure Sprints</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Traditional planners only track what you fail to do. We active-pilot your attention to rescue the timeline.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            whileHover={{ y: -6 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">AI Deadline Rescue Mode</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              When pressure peaks, activate Rescue Mode. Instantly lock distractions, slice multi-hour deliverables into actionable 15-minute milestones, and auto-notify stakeholders of dependencies.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Autonomous Smart Rescheduling</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Did a task spill over? Our predictive scheduler automatically rearranges low-importance items, blocks meeting invitations, and finds alternative work windows.
            </p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6 }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col gap-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Burnout Alert Analytics</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Keep eye on your health metric. Analyze energy patterns, receive proactive warnings when over-scheduling occurs, and practice recommended stress relief stretches.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it works Timeline */}
      <section id="timeline" className="py-20 bg-slate-100/50 dark:bg-slate-950/60 border-y border-slate-200 dark:border-slate-900">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display font-extrabold text-3xl">How We Secure Your Timelines</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Three seamless layers guarding your output</p>
          </div>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-8 items-start relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">1</div>
              <div>
                <h4 className="text-lg font-bold">Register Active Deadlines</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">Connect your workspace tools and write down urgent milestones. Our AI instantly indexes difficulty ratings, calculates dependency bottle-necks, and creates a live Delay Risk Indicator.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">2</div>
              <div>
                <h4 className="text-lg font-bold">Deploy Guardian AI Focus Blocks</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">Initiate customized Pomodoros loaded with high-fidelity ambient audios (Rain, Binaural Cyberwaves, Deep Forest). Distracting web targets are blocked, letting you flow with complete ease.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start relative">
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">3</div>
              <div>
                <h4 className="text-lg font-bold">Beat Delays and Earn Coins</h4>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed">As you secure your milestones, receive XP and coin boosts. Level up your productivity class, rank up on the global scoreboard, and customize your workspace aesthetics.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-extrabold text-3xl md:text-4xl">Pricing Built For High-Output Professionals</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">Secure your timelines today. Cancel anytime.</p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
          {/* Tier 1 */}
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Standard Plan</span>
              <h4 className="text-2xl font-bold mt-2">Casual Responder</h4>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Best for casual developers and single project managers.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-display">$0</span>
                <span className="text-slate-500 text-sm">/ forever</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Up to 10 Active Task Rescues</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>Standard Pomodoro Timer & Audio</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span>50 AI Interaction Queries/mo</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={onGetStarted}
              className="mt-8 w-full py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold rounded-xl transition-all cursor-pointer"
            >
              Start Free Trial
            </button>
          </div>

          {/* Tier 2 */}
          <div className="p-8 rounded-3xl bg-slate-900 text-white border-2 border-indigo-500 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">Most Popular</div>
            
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Premium Plan</span>
              <h4 className="text-2xl font-bold mt-2">Elite Firefighter</h4>
              <p className="text-slate-300 mt-2 text-sm">Best for startup founders, elite freelancers, and corporate leaders.</p>
              
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold font-display">$19</span>
                <span className="text-slate-400 text-sm">/ month</span>
              </div>

              <ul className="mt-8 space-y-4 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Unlimited Deadlines & Teams</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Full AI Rescue Mode & Automations</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Premium High-Fidelity Ambients</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>Unlimited Autonomous Reschedules</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={onGetStarted}
              className="mt-8 w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              Get Unlimited Rescue Power
            </button>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-20 px-6 md:px-12 bg-slate-100/40 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="w-10 h-10 text-indigo-500 mx-auto mb-4" />
            <h2 className="font-display font-extrabold text-3xl">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all shadow-sm"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-100">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800/80 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact & Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6 md:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">TaskPilot AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Rescuing ambitious professionals, software architects, and founders from high-stress work collapses since 2026.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">Features</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Rescue Mode</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Focus Ambient</a></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors">Task Checklists</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-4 text-sm tracking-wider uppercase">Company</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Global Hackathon</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h5 className="font-bold text-white text-sm tracking-wider uppercase">Subscribe to Survival Logs</h5>
            <p className="text-xs text-slate-500">Receive expert burnout avoidance tactics and platform updates weekly.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="survival@email.com" 
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-white w-full"
              />
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0">Join</button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-600 flex flex-col md:flex-row justify-between items-center gap-4">
          <span>&copy; 2026 Last Minute Life Saver Inc. All rights reserved. Built with pride for AI Studio.</span>
          <div className="flex gap-6 text-slate-500">
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
