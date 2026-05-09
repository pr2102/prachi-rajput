import { AnimatePresence, motion as Motion } from 'framer-motion'

export default function LoadingScreen({ loading }) {
  return (
    <AnimatePresence>
      {loading ? (
        <Motion.div
          className="fixed inset-0 z-[120] grid place-items-center bg-[#06020b]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(18px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="text-center">
            <Motion.div
              className="mx-auto h-20 w-20 rounded-full border border-fuchsia-200/30 bg-gradient-to-br from-white via-pink-200 to-fuchsia-500 shadow-[0_0_70px_rgba(236,72,153,0.65)]"
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 1.8, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.2, repeat: Infinity } }}
            />
            <Motion.p
              className="mt-6 text-xs font-bold uppercase tracking-[0.4em] text-white/75"
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              Prachi Rajput
            </Motion.p>
          </div>
        </Motion.div>
      ) : null}
    </AnimatePresence>
  )
}
