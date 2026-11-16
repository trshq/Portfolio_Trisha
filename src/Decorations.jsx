import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useReducedMotion } from "motion/react";

function ToastArt() {
  return <>
    <path d="M25 36C9 33 10 17 28 12Q49 4 71 12C90 15 93 33 77 38L78 82Q79 91 69 90L30 88Q21 89 23 79Z" fill="#f4e5cb" />
    <path d="M30 38Q21 34 21 27Q20 17 36 17Q54 12 68 18Q82 20 81 29Q81 36 71 40L72 81L29 80Z" fill="#fff9ed" strokeWidth="1.2" />
    <path d="M40 52L40 54M59 52L59 54M43 63Q50 69 57 62" />
    <circle cx="33" cy="59" r="3.5" fill="#edb6c3" stroke="none" /><circle cx="66" cy="59" r="3.5" fill="#edb6c3" stroke="none" />
    <path d="M35 29L38 28M59 33L61 34M39 74L42 73" stroke="#b69b74" strokeWidth="1.2" />
  </>;
}

// Original SVG sketches. Decorative only: never part of the artwork collection.
export function Doodle({ kind = "flower", className = "" }) {
  const [reacting, setReacting] = useState(false);
  const reduced = useReducedMotion();
  const interactive = className.startsWith("hero-");
  const parallax = ["hero-teddy", "hero-bubble", "hero-flower-sage"].includes(className);
  useEffect(() => { if (reduced) setReacting(false); }, [reduced]);
  return <svg
    className={`doodle ${className}${reacting ? " is-reacting" : ""}`}
    data-doodle={kind}
    data-parallax={parallax || undefined}
    onPointerEnter={interactive ? (event) => {
      if (!reduced && event.pointerType !== "touch" && matchMedia("(hover:hover) and (pointer:fine)").matches) setReacting(true);
    } : undefined}
    aria-hidden="true" focusable="false" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    {interactive && <rect className="doodle-hit-area" x="0" y="0" width="100" height="100" fill="transparent" stroke="none" />}
    <g className="doodle-ink">
    <g className="doodle-hover" onAnimationEnd={() => setReacting(false)}>
      {kind === "cherries" ? <>
        <path d="M30 62Q44 30 61 16Q61 42 69 63M61 17Q77 8 88 26Q72 29 61 17" />
        <path d="M19 64Q25 53 33 61Q48 54 47 71Q44 91 29 87Q12 84 19 64ZM56 65Q60 55 69 62Q84 56 84 73Q79 92 65 87Q51 84 56 65Z" fill="#f4b8ca" fillOpacity=".45" />
        <path d="M24 67L23 74M61 68L60 74M42 38Q49 25 58 20" strokeWidth="1" />
      </> : kind === "bubble" ? <>
        <path d="M17 28Q16 18 28 17L76 19Q88 19 88 31L86 58Q86 70 75 70L45 69L28 84L30 70Q15 72 16 58Z" fill="#faf8f0" />
        <path d="M24 23L70 24M24 43L27 44M48 44L51 45M71 45L74 46" strokeWidth="2.8" />
      </> : kind === "arrow" ? <>
        <path d="M16 12C84 13 83 67 39 55C10 46 30 24 55 45Q73 62 67 87M53 76L67 88L80 75" />
        <path d="M20 17Q40 17 48 25" strokeWidth=".9" />
      </> : kind === "teddy" ? <>
        <path d="M30 32C8 23 21 5 34 19M67 20C81 7 94 23 74 34M26 35C24 14 73 13 76 36C84 65 22 69 26 35ZM36 61Q30 76 36 87L64 87Q72 74 63 62M35 68Q14 61 20 76Q24 82 34 78M65 69Q86 61 81 77L67 81M36 85Q17 77 21 92Q27 100 41 93M62 85Q80 79 78 92Q71 99 59 93" fill="#faf8f0" />
        <path d="M31 29Q29 22 35 23M68 23Q74 23 72 30M39 38L40 39M61 39L62 38M46 46Q51 42 55 46L51 50ZM51 50L51 54M43 54Q50 60 58 54" />
        <path d="M41 68L58 70L51 76Z" fill="#bdd291" fillOpacity=".6" />
      </> : kind === "bread" ? <ToastArt /> : kind === "star" ? <>
        <path d="M49 13L58 39L87 39L65 57L72 84L49 69L25 85L32 57L11 40L40 38Z" fill="#f6e5a2" fillOpacity=".4" />
        <path d="M47 22L43 40M20 45L31 48M73 14L77 8M87 24L94 22" strokeWidth="1.1" />
      </> : kind === "sparkle" ? <>
        <path d="M49 14Q48 43 22 50Q45 52 51 81Q54 56 78 49Q54 45 49 14ZM81 12L82 28M74 20L90 20" fill="#f6e5a2" fillOpacity=".45" />
      </> : kind === "swirl" ? <>
        <path d="M10 72C-1 32 77 12 81 46C84 75 32 88 30 61C29 39 63 33 66 51C67 63 48 68 46 59M79 77L86 85M85 69L96 68" />
      </> : kind === "scribble" ? <>
        <path d="M12 63C21 9 28 90 40 28C45 3 43 90 58 38C70-3 60 97 86 41M14 80Q50 70 86 77" />
      </> : <>
        <path d="M49 34C27 4 10 27 34 47C1 48 9 78 36 65C26 95 57 104 63 71C89 90 105 63 72 51C104 32 83 7 60 32C67 3 40 0 49 34Z" fill={kind === "sage-flower" ? "#bdd291" : "#faf8f0"} fillOpacity={kind === "sage-flower" ? ".2" : "1"} />
        <path d="M43 47Q51 40 58 48Q64 60 51 63Q40 62 43 47ZM34 83L27 93M76 17L83 10" />
        {kind === "daisy" && <path d="M20 30L29 35M71 76L78 83" stroke="#d87b97" />}
      </>}
    </g>
    </g>
  </svg>;
}

export function SectionSketch() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { element.classList.add("is-drawn"); observer.disconnect(); }
    }, { threshold: .7 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <svg ref={ref} className="section-sketch" viewBox="0 0 180 14" aria-hidden="true" focusable="false" fill="none">
    <path pathLength="1" d="M3 10Q53 1 106 7T176 5M126 12L173 10" />
  </svg>;
}

export function CuriosityWords({ children }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  useEffect(() => { if (reduced) { setHovered(false); setBouncing(false); } }, [reduced]);
  return <span className={`hero-curiosity-words${hovered ? " is-hovered" : ""}${bouncing ? " is-bouncing" : ""}`}
    onPointerEnter={event => {
      if (!reduced && event.pointerType !== "touch" && matchMedia("(hover:hover) and (pointer:fine)").matches) {
        setHovered(true); setBouncing(true);
      }
    }}
    onPointerLeave={() => setHovered(false)}
    onAnimationEnd={() => setBouncing(false)}
  >{children}</span>;
}

export function BackgroundMotion() {
  const location = useLocation();
  const reduced = useReducedMotion();
  const glowRef = useRef(null);
  useEffect(() => {
    const capability = matchMedia("(hover: hover) and (pointer: fine)");
    const glow = glowRef.current;
    if (reduced || !capability.matches) return;
    let frame = 0, active = true, x = innerWidth / 2, y = innerHeight / 2, shown = false;
    let smoothX = x, smoothY = y;
    const paint = () => {
      frame = 0;
      smoothX += (x - smoothX) * .15;
      smoothY += (y - smoothY) * .15;
      const paper = glow.parentElement.getBoundingClientRect();
      glow.style.transform = `translate3d(${smoothX - paper.left}px,${smoothY - paper.top}px,0)`;
      glow.style.opacity = shown ? ".12" : "0";
      document.querySelectorAll('[data-parallax="true"]').forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) return;
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        const near = Math.max(0, 1 - Math.hypot(smoothX - cx, smoothY - cy) / 200);
        const dx = (smoothX / innerWidth - .5) * 4 + (cx - smoothX) / 200 * near * 3;
        const dy = Math.max(-3, Math.min(3, (innerHeight / 2 - cy) * .009)) + (smoothY / innerHeight - .5) * 3;
        element.style.setProperty('--sketch-x', `${dx.toFixed(2)}px`);
        element.style.setProperty('--sketch-y', `${dy.toFixed(2)}px`);
      });
      if (active && shown && (Math.abs(x - smoothX) > .1 || Math.abs(y - smoothY) > .1)) frame = requestAnimationFrame(paint);
    };
    const schedule = () => { if (!frame && active) frame = requestAnimationFrame(paint); };
    const move = event => { if (event.pointerType === 'touch') return; x = event.clientX; y = event.clientY; shown = true; schedule(); };
    const leave = () => { shown = false; schedule(); };
    const visibility = () => { active = !document.hidden && capability.matches; if (!active) { cancelAnimationFrame(frame); frame = 0; } else schedule(); };
    const capabilityChange = () => { active = capability.matches; if (!active) { shown = false; glow.style.opacity = '0'; } else schedule(); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('scroll', schedule, { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('visibilitychange', visibility);
    capability.addEventListener('change', capabilityChange);
    schedule();
    return () => {
      active = false; cancelAnimationFrame(frame); glow.style.opacity = '0';
      window.removeEventListener('pointermove', move);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('visibilitychange', visibility);
      capability.removeEventListener('change', capabilityChange);
      document.querySelectorAll('[data-parallax]').forEach(e => { e.style.removeProperty('--sketch-x'); e.style.removeProperty('--sketch-y'); });
    };
  }, [location.pathname, reduced]);
  return <div ref={glowRef} className="paper-cursor-highlight" aria-hidden="true" />;
}
