export default function LetterNotice() {
  return (
    <div className="relative font-mono">
      {/* Aged paper card */}
      <div className="bg-amber-50 border border-amber-200 rounded-sm shadow-md px-7 py-6 space-y-4 text-sm text-gray-800 leading-relaxed">

        {/* Archive stamp top-right */}
        <div className="absolute top-4 right-5 flex flex-col items-center opacity-40 rotate-6 pointer-events-none select-none">
          <div className="border-2 border-red-700 text-red-700 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded">
            Notice
          </div>
        </div>

        {/* Header meta */}
        <div className="text-xs text-gray-500 space-y-0.5 border-b border-amber-200 pb-3">
          <p><span className="uppercase tracking-wider">Date&nbsp;&nbsp;&nbsp;:</span> 24 May 2026</p>
          <p><span className="uppercase tracking-wider">From&nbsp;&nbsp;&nbsp;:</span> Lucas</p>
          <p><span className="uppercase tracking-wider">To&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:</span> Amber</p>
          <p><span className="uppercase tracking-wider">Subject:</span> Dutch flashcard challenge</p>
        </div>

        {/* Body */}
        <div className="space-y-3 text-[13px]">
          <p>Dear Amber,</p>

          <p>
            You now have until{" "}
            <span className="font-bold underline underline-offset-2">30&ndash;05&ndash;2026</span>{" "}
            to practice all of the currently available flashcards.
          </p>

          <p>
            If you manage to do so, and you are able to prove it to me,
            a <span className="font-bold">nice dinner</span> will be awaiting you.
          </p>

          <div className="pt-2">
            <p>Kind regards,</p>
            <p className="mt-1 text-base italic tracking-wide">Lucas</p>
          </div>
        </div>

        {/* Decorative horizontal rule */}
        <div className="border-t border-amber-200 pt-2 text-[10px] text-amber-400 tracking-widest uppercase text-center">
          — Dutch Learning Archive · 2026 —
        </div>
      </div>
    </div>
  );
}
