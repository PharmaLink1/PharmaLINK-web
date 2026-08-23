/**
 * Ambient page background: a faint technical grid plus a soft accent glow,
 * drawn entirely in CSS (no image — friendly on slow connections). Sits fixed
 * behind all content and is non-interactive.
 */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_50%_0%,black,transparent_75%)]" />
      <div className="absolute left-1/2 top-[-20%] h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-[130px]" />
    </div>
  );
}
