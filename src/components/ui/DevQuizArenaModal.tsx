'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, X, CheckCircle2, XCircle, RotateCcw, Award, Sparkles } from 'lucide-react'
import { useAudio } from '@/context/AudioContext'

interface Question {
  id: number
  question: string
  options: string[]
  answerIndex: number
}

const QUIZ_QUESTIONS: Question[] = [
  {
    id: 1,
    question: 'Which Next.js 15 feature enables streaming server components?',
    options: ['App Router SSR', 'Pages Router', 'Static HTML Export', 'Client Hydration Only'],
    answerIndex: 0,
  },
  {
    id: 2,
    question: 'How do you define Row-Level Security (RLS) policies in Supabase?',
    options: ['In client JavaScript', 'CREATE POLICY in Postgres SQL', 'In next.config.js', 'In CSS modules'],
    answerIndex: 1,
  },
  {
    id: 3,
    question: 'Which React 19 hook simplifies form action handling?',
    options: ['useFormStatus & useActionState', 'useMemo', 'useRef', 'useLayoutEffect'],
    answerIndex: 0,
  },
]

interface DevQuizArenaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DevQuizArenaModal({ isOpen, onClose }: DevQuizArenaModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)
  const { playClick, playHover, playSuccess } = useAudio()

  const handleAnswer = (optionIdx: number) => {
    playClick()
    const q = QUIZ_QUESTIONS[currentStep]

    if (optionIdx === q.answerIndex) {
      setScore((prev) => prev + 1)
    }

    if (currentStep + 1 < QUIZ_QUESTIONS.length) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setQuizFinished(true)
      playSuccess()
      import('@/components/AchievementSystem').then((m) => m.unlockAchievement('ninja'))
    }
  }

  const handleRestart = () => {
    playClick()
    setCurrentStep(0)
    setScore(0)
    setQuizFinished(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 25 }}
            className="relative flex flex-col w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-[#0d0d16]/95 p-6 shadow-2xl backdrop-blur-2xl text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Trophy size={18} /> Dev Quiz Arena (60s Challenge)
              </div>
              <button
                type="button"
                onClick={() => {
                  playClick()
                  onClose()
                }}
                className="rounded-full bg-white/5 p-2 text-white/60 hover:bg-white/15 hover:text-white transition"
              >
                <X size={16} />
              </button>
            </div>

            {quizFinished ? (
              <div className="my-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  <Award size={32} />
                </div>

                <div>
                  <h4 className="text-xl font-extrabold text-white">
                    {score === 3 ? '🎉 Perfect Score! (3/3)' : `You Scored ${score}/3!`}
                  </h4>
                  <p className="text-xs text-white/60 mt-1">
                    {score === 3
                      ? 'Unlocked "Frontend Master" Achievement Trophy!'
                      : 'Great effort! Practice again to get a perfect score.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} /> Try Quiz Again
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-white/50 mb-3">
                  <span>Question {currentStep + 1} of {QUIZ_QUESTIONS.length}</span>
                  <span className="text-amber-400 font-bold">Score: {score}</span>
                </div>

                <h4 className="text-sm font-bold text-white mb-4">
                  {QUIZ_QUESTIONS[currentStep].question}
                </h4>

                <div className="space-y-2.5">
                  {QUIZ_QUESTIONS[currentStep].options.map((option, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAnswer(idx)}
                      onMouseEnter={playHover}
                      className="w-full text-left rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/80 hover:bg-amber-500/20 hover:text-amber-200 hover:border-amber-500/40 transition font-mono"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
