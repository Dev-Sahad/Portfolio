'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Variants } from 'framer-motion'
import { Upload, Heart, Pin, Send, CheckCircle, Mail } from 'lucide-react'
import useComments from '@/hooks/useComments'

const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1]

const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: smoothEase } },
}

export default function CommentsSection() {
  const { comments, loading, addComment, likeComment } = useComments()

  const [name,    setName]    = useState('')
  const [comment, setComment] = useState('')
  const [image,   setImage]   = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [posted,  setPosted]  = useState(false)

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!name.trim() || !comment.trim()) return

    await addComment({ name, comment, image })

    setName('')
    setComment('')
    setImage(null)
    setPreview(null)
    setPosted(true)
    setTimeout(() => setPosted(false), 4000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: smoothEase }}
      viewport={{ once: false, amount: 0.2 }}
      className="rounded-[28px] md:rounded-[34px] border border-white/10 bg-white/5 backdrop-blur-xl p-5 md:p-8 h-full"
    >
      {/* HEADER */}
      <div className="mb-5 md:mb-6">
        <h3 className="text-xl md:text-2xl font-semibold mb-1">Comments</h3>
        <p className="text-xs md:text-sm text-white/40 flex items-center gap-1.5">
          Leave your thoughts — 
          <span className="flex items-center gap-1 text-white/30">
            <Mail size={11} />
            dev.sxhd@gmail.com
          </span>
        </p>
      </div>

      {/* SUCCESS TOAST */}
      <AnimatePresence>
        {posted && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.35, ease: smoothEase }}
            className="mb-4 flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10"
          >
            <CheckCircle size={15} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-[13px] text-emerald-300 font-medium">Comment posted!</p>
              <p className="text-[11px] text-emerald-400/60">Muhammad Sahad has been notified at dev.sxhd@gmail.com</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FORM */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="space-y-3 md:space-y-4 mb-5 md:mb-6"
      >
        <motion.input
          variants={itemVariants}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none focus:border-white transition text-sm"
        />

        <motion.textarea
          variants={itemVariants}
          rows={4}
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Your Comment"
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 md:py-4 outline-none resize-none focus:border-white transition text-sm"
        />

        <motion.label
          variants={itemVariants}
          className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-3 md:p-4 flex items-center gap-3 cursor-pointer hover:border-white/30 transition"
        >
          <Upload size={16} className="text-white/40" />
          <span className="text-xs md:text-sm text-white/40">
            {image ? image.name : 'Upload Image (optional)'}
          </span>
          <input hidden type="file" accept="image/*" onChange={handleImage} />
        </motion.label>

        <AnimatePresence>
          {preview && (
            <motion.img
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              src={preview}
              alt="Preview"
              className="rounded-2xl h-36 md:h-44 w-full object-cover border border-white/10"
            />
          )}
        </AnimatePresence>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading || !name.trim() || !comment.trim()}
          className="w-full rounded-2xl py-3 md:py-4 bg-white/10 border border-white/10 hover:bg-white/15 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Posting...</>
            : <><Send size={14} /> Post Comment</>
          }
        </motion.button>

        {/* Email notice */}
        <motion.p
          variants={itemVariants}
          className="text-center text-[11px] text-white/20 flex items-center justify-center gap-1"
        >
          <Mail size={10} />
          Your comment will be sent to dev.sxhd@gmail.com
        </motion.p>
      </motion.div>

      {/* COMMENTS LIST */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false }}
        className="rounded-[24px] md:rounded-[28px] border border-white/10 bg-black/20 p-3 h-[320px] md:h-[420px] overflow-y-auto custom-scroll"
      >
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {comments.length === 0 && !loading && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-32 gap-2 text-white/20"
              >
                <Mail size={22} />
                <p className="text-xs">Be the first to leave a comment</p>
              </motion.div>
            )}

            {comments.map((item, i) => (
              <motion.div
                key={item.id || i}
                layout
                initial={{ opacity: 0, y: 18, scale: 0.96, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0,  scale: 1,    filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.55, ease: smoothEase, layout: { duration: 0.45, ease: smoothEase } }}
                className={`rounded-[20px] md:rounded-[24px] border p-3 md:p-4 ${
                  item.is_pinned
                    ? 'border-purple-500/30 bg-purple-500/5'
                    : 'border-white/10 bg-white/[0.03]'
                }`}
              >
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold shrink-0 uppercase">
                    {item.name?.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium truncate">{item.name}</p>

                      {item.is_pinned && (
                        <div className="flex items-center gap-1 px-2 py-[3px] rounded-full bg-purple-500/15 border border-purple-500/20 text-[10px] text-purple-300 shrink-0">
                          <Pin size={10} /> PINNED
                        </div>
                      )}

                      <span className="text-[10px] text-white/20 ml-auto shrink-0">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString()
                          : ''}
                      </span>
                    </div>

                    <p className="text-[12px] md:text-[13px] text-white/55 leading-relaxed break-words">
                      {item.comment}
                    </p>

                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt="Comment"
                        className="mt-3 rounded-xl w-full max-h-48 md:max-h-56 object-cover border border-white/10"
                      />
                    )}
                  </div>

                  {/* Like button */}
                  <button
                    onClick={() => likeComment(item.id, item.likes)}
                    className="flex flex-col items-center gap-0.5 text-white/30 hover:text-white transition shrink-0 ml-1"
                  >
                    <Heart size={13} />
                    <span className="text-[10px]">{item.likes || 0}</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
