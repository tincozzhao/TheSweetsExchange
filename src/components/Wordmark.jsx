// Custom typographic wordmark. Size it by setting a text-* class on the parent.
export default function Wordmark({ className = '' }) {
  return (
    <span className={`inline-flex flex-col items-start leading-none ${className}`}>
      <span className="ml-[0.25em] font-hand text-[1.1em] leading-none opacity-80">the</span>
      <span className="-mt-[0.1em] font-serif text-[1.9em] font-semibold italic leading-[0.95] tracking-tight">
        Sweets
      </span>
      <span className="ml-[0.1em] font-sans text-[0.6em] font-bold uppercase tracking-[0.42em]">
        Exchange
      </span>
    </span>
  );
}
