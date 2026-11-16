import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform
} from "motion/react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams
} from "react-router-dom";
import {
  siCss,
  siExpo,
  siFigma,
  siFlutter,
  siGmail,
  siHtml5,
  siInstagram,
  siJavascript,
  siReact
} from "simple-icons";
import portfolio from "../content.js";
import { imagePath, imageSize } from "./assets.js";
import { BackgroundMotion, CuriosityWords, Doodle, SectionSketch } from "./Decorations.jsx";
import ContactForm from "./ContactForm.jsx";
import VideoPlayer from "./VideoPlayer.jsx";
import { ProjectDevicePreview, ProjectLogoBanner } from "./ProjectVisuals.jsx";

const MotionLink = motion.create(Link);

function getGmailUrl({ to = portfolio.profile.email, subject = "", body = "" } = {}) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to: to
  });
  if (subject) params.set("su", subject);
  if (body) params.set("body", body);
  return `https://mail.google.com/mail/?${params.toString()}`;
}

const skillIcons = {
  HTML: siHtml5,
  CSS: siCss,
  JavaScript: siJavascript,
  Figma: siFigma,
  "React Native": siReact,
  React: siReact,
  "Expo Go": siExpo,
  Flutter: siFlutter
};

const navLinks = [
  ["Work", "/#projects"],
  ["Gallery", "/gallery"],
  ["About", "/#about"],
  ["Contact", "/#contact"]
];

function SkillLogo({ skill }) {
  const icon = skillIcons[skill];
  const image = skill === "CSS" ? "css.jpg" : skill === "JavaScript" ? "js.jpg" : null;
  const imageSrc = image ? imagePath(image) : null;

  return (
    <span className="skill-logo-item">
      {imageSrc ? (
        <img src={imageSrc} alt="" aria-hidden="true" />
      ) : icon ? (
        <svg aria-hidden="true" viewBox="0 0 24 24" style={{ color: `#${icon.hex}` }}>
          <path fill="currentColor" d={icon.path} />
        </svg>
      ) : skill === "Canva" ? (
        <span className="skill-brand-mark canva-mark" aria-hidden="true">C</span>
      ) : skill === "CapCut" ? (
        <svg className="skill-brand-mark capcut-mark" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M4 5h16l-6 7 6 7H4l6-7-6-7Z" />
        </svg>
      ) : null}
      <span>{skill}</span>
    </span>
  );
}

function Reveal({ as = "div", children, className = "", delay = 0, ...props }) {
  const reducedMotion = useReducedMotion();
  const Tag = motion[as] ?? motion.div;

  return (
    <Tag
      className={className}
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.45, delay, ease: [0.2, 0.7, 0.2, 1] }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function SiteNav({ mobileOpen, activeLink, onNavigate }) {
  return (
    <nav id="primary-navigation" className={`main-nav${mobileOpen ? " is-open" : ""}`} aria-label="Main navigation">
      {navLinks.map(([label, href]) => (
        <Link
          key={label}
          to={href}
          className={`${label === "Contact" ? "button button-small nav-contact " : ""}${activeLink === label ? "nav-current" : ""}`}
          aria-current={activeLink === label ? (label === "Gallery" ? "page" : "location") : undefined}
          onClick={() => onNavigate(href)}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function SiteHeader({ onHome }) {
  const profile = portfolio.profile;
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");
  const headerRef = useRef(null);

  useEffect(() => {
    const header = headerRef.current;
    const update = () => document.documentElement.style.setProperty("--header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveLink(location.pathname === "/gallery" ? "Gallery" : location.pathname.startsWith("/work") || location.pathname === "/uiux" ? "Work" : "");
      return;
    }
    let frame;
    const update = () => {
      const boundary = headerRef.current.getBoundingClientRect().bottom + 90;
      let active = "";
      for (const [label, id] of [["Work", "projects"], ["About", "about"], ["Contact", "contact"]]) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= boundary) active = label;
      }
      if (document.getElementById("contact") && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 3) active = "Contact";
      setActiveLink(active);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    const main = document.getElementById("app");
    if (main) observer.observe(main);
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [location.pathname]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    const closeMenu = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        document.querySelector(".menu-toggle")?.focus();
      }
    };
    if (mobileOpen) window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, [mobileOpen]);

  return (
    <header id="site-header" ref={headerRef}>
      <div className="nav-wrap">
        <Link className="brand" to="/" aria-label={`${profile.name}, home`} onClick={event => { setMobileOpen(false); onHome(event); }}>
          <span>{profile.brand}</span>
        </Link>
        <SiteNav mobileOpen={mobileOpen} activeLink={activeLink} onNavigate={(href) => {
          setMobileOpen(false);
          if (location.pathname === "/" && href === `/${location.hash}`) {
            document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
          }
        }} />
        <button
          className="menu-toggle"
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}

function SiteFooter({ onContact, onHome }) {
  const profile = portfolio.profile;

  return (
    <footer id="site-footer">
      <div className="footer-top">
        <Link className="brand" to="/" aria-label={`${profile.name}, home`} onClick={onHome}>
          <span>{profile.brand}</span>
        </Link>
        <p>{profile.role} · {profile.location}</p>
        <div className="footer-social-links">
          <a
            className="footer-social-pill"
            href={profile.instagramUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram profile @trsha.zip"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d={siInstagram.path} />
            </svg>
            <span>@{profile.instagram}</span>
          </a>
          <a
            className="footer-social-pill"
            href={getGmailUrl({ to: profile.email, subject: "Hello Trisha — Portfolio Inquiry" })}
            target="_blank"
            rel="noreferrer"
            aria-label="Send email to oronantrishamarie@gmail.com"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d={siGmail.path} />
            </svg>
            <span>{profile.email}</span>
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {profile.name}. All rights reserved.</span>
        <div className="footer-links">
          <Link to="/#work">Creative Work</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/#projects">Featured Projects</Link>
          <Link to="/#about">About</Link>
          <Link to="/blog">Journal</Link>
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

function ScrollControls() {
  const { scrollY, scrollYProgress } = useScroll();
  const [showTop, setShowTop] = useState(false);
  const reducedMotion = useReducedMotion();
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setShowTop(latest > 400);
  });

  return (
    <>
      <motion.div className="scroll-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <AnimatePresence>
        {showTop && (
          <motion.button
            className="back-to-top is-visible"
            type="button"
            aria-label="Back to top"
            title="Back to top"
            initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.92 }}
            whileHover={reducedMotion ? undefined : { y: -3 }}
            whileTap={reducedMotion ? undefined : { scale: 0.94 }}
            onClick={() => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })}
          >
            <span aria-hidden="true">↑</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

/* ============================================================
   01. HERO SECTION (EDITORIAL MOODBOARD & CLEAN TYPOGRAPHY)
   ============================================================ */
function HeroSection({ profile, onContact, replay = 0 }) {
  const reducedMotion = useReducedMotion();
  const headlineRef = useRef(null);
  const [entrance, setEntrance] = useState(0);
  const [headlineVisible, setHeadlineVisible] = useState(false);
  useEffect(() => {
    const headline = headlineRef.current;
    const hero = headline.closest(".hero");
    let armed = true;
    let visible = false;
    setHeadlineVisible(false);
    const reveal = () => {
      if (!armed || !visible) return;
      armed = false;
      setEntrance(value => value + 1);
      setHeadlineVisible(true);
    };
    // Rearm only after the whole hero has left the usable viewport. Small
    // movements at the headline boundary cannot restart a running entrance.
    const heroObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) armed = true;
    }, { rootMargin: `-${document.getElementById("site-header").offsetHeight}px 0px 0px`, threshold: 0 });
    const headlineObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .6;
      reveal();
    }, { threshold: [0, .6] });
    heroObserver.observe(hero);
    headlineObserver.observe(headline);
    return () => { heroObserver.disconnect(); headlineObserver.disconnect(); };
  }, [replay]);
  return (
    <section className="hero section-pad" aria-labelledby="hero-title">
      <BackgroundMotion />
      <Doodle kind="cherries" className="hero-cherries" />
      <Doodle kind="bubble" className="hero-bubble" />
      <Doodle kind="arrow" className="hero-arrow" />
      <Doodle kind="teddy" className="hero-teddy" />
      <Doodle kind="star" className="hero-star" />
      <Doodle kind="star" className="hero-star-small" />
      <Doodle kind="sparkle" className="hero-sparkle" />
      <Doodle kind="daisy" className="hero-flower-pink" />
      <Doodle kind="sage-flower" className="hero-flower-sage" />
      <Doodle kind="bread" className="hero-bread" />
      <div className="hero-copy hero-enter">
        <div className="availability-tag"><span className="availability-dot" /><span>{profile.availability}</span></div>
        <h1 id="hero-title" ref={headlineRef} data-entrance={entrance} style={{ "--hero-play-state": headlineVisible ? "running" : "paused" }} aria-label={`${profile.headlineMuted} ${profile.headlineStrong}`}>
          <span key={`${entrance}-sans`} className="hero-sans"><span className="hero-highlight">{profile.headlineMuted.split(" ")[0]}</span>{profile.headlineMuted.slice(profile.headlineMuted.indexOf(" "))}</span>{" "}
          <span key={`${entrance}-curiosity`} className="hero-serif hero-curiosity"><CuriosityWords>{profile.headlineStrong.split(" & ")[0]} &amp;</CuriosityWords></span>{" "}
          <span key={`${entrance}-purpose`} className="hero-serif hero-purpose">{profile.headlineStrong.split(" & ")[1]}</span>
        </h1>
        <p className="hero-role">{profile.role}</p>
        <p className="hero-description">{profile.introduction}</p>
        <div className="hero-actions">
          <motion.button className="button button-dark" type="button" onClick={onContact}
            whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={reducedMotion ? undefined : { scale: .98 }}>
            Let's connect <span aria-hidden="true">↗</span>
          </motion.button>
          <Link className="button button-outline" to="/#projects" onClick={() => {
            if (window.location.hash === "#projects") document.getElementById("projects")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
          }}>Explore My Work <span aria-hidden="true">↓</span></Link>
        </div>
      </div>
    </section>
  );
}
function FeaturedProjectsSection({ projects }) {
  const featured = projects.filter((p) => p.featured);
  const trackRef = useRef(null);
  const trackId = useId();
  const reducedMotion = useReducedMotion();
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const track = trackRef.current;
    const update = () => setEdges({ start: track.scrollLeft < 2, end: track.scrollLeft + track.clientWidth >= track.scrollWidth - 2 });
    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => { track.removeEventListener("scroll", update); observer.disconnect(); };
  }, []);

  function move(direction) {
    const track = trackRef.current;
    const card = track.querySelector("article");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <section className="section section-pad projects-section" id="projects">
      <Doodle kind="swirl" className="projects-flower" />
      <div className="featured-heading">
        <div>
          <p className="eyebrow">Major Academic &amp; Development Projects</p>
          <h2>Featured Projects<SectionSketch /></h2>
          <p className="projects-intro">Comprehensive mobile applications, responsive web development, and capstone software solutions.</p>
        </div>
        <div className="carousel-toolbar">
          <div className="carousel-controls" aria-label="Project carousel controls">
            <button className="circle-button" type="button" aria-label="Previous projects" aria-controls={trackId} disabled={edges.start} onClick={() => move(-1)}>←</button>
            <button className="circle-button" type="button" aria-label="Next projects" aria-controls={trackId} disabled={edges.end} onClick={() => move(1)}>→</button>
          </div>
        </div>
      </div>
      <div className="featured-projects-grid" ref={trackRef} id={trackId} role="region" aria-label="Featured projects carousel" tabIndex={0}>
        {featured.map((project, index) => (
          <FeaturedProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}

function FeaturedProjectCard({ project, index = 0 }) {
  const reducedMotion = useReducedMotion();
  const primaryUrl = project.figmaUrl || project.externalUrl;

  return (
    <motion.article
      className={`featured-project-card project-tone-${index % 4}`}
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
    >
      <div className="project-preview-frame actual-project-preview">
        <ProjectDevicePreview project={project} index={index} />
        <div className="project-preview-overlay">
          {primaryUrl && (
            <a
              href={primaryUrl}
              target="_blank"
              rel={project.figmaUrl ? "noopener noreferrer" : "noreferrer"}
              className="preview-hover-btn"
              aria-label={`Open ${project.name} ${project.figmaUrl ? "prototype" : "website"}`}
            >
              <span>{project.figmaUrl ? "Launch Prototype" : "Visit Website"}</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
      </div>

      <div className="project-content-block">
        <div className="project-info-meta"><span>{project.role}</span><span>{project.year}</span></div>
        <div className="project-title-row">
          <h3>{project.title || project.name}</h3>
          <span className="project-type-tag">{project.type}</span>
        </div>
        <p className="project-summary-text">{project.summary}</p>

        <div className="project-action-row">
          {primaryUrl && (
            <a
              href={primaryUrl}
              target="_blank"
              rel={project.figmaUrl ? "noopener noreferrer" : "noreferrer"}
              className="action-btn-primary"
            >
              <span>{project.figmaUrl ? "Prototype" : "Live website"}</span>
              <span aria-hidden="true">↗</span>
            </a>
          )}
          <Link to={`/work/${project.slug}`} className="action-btn-secondary">
            <span>Case details</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   03. CREATIVE GALLERY SECTION (MY EDITS WITH CATEGORY FILTER & LIGHTBOX)
   ============================================================ */
function CreativeGallerySection({ galleryItems, onOpenLightbox, headingAs = "h2" }) {
  const [activeFilter, setActiveFilter] = useState("All Works");
  const categories = ["All Works", "Event Posters", "Social Media Pubmats", "Speaker Designs"];

  const filteredItems = activeFilter === "All Works"
    ? galleryItems
    : galleryItems.filter((item) => item.filterCategory === activeFilter);

  return (
    <section className="section section-pad gallery-section" id="gallery">
      <SectionHeading
        eyebrow="Creative Design & Visual Outputs"
        title="Creative Gallery"
        headingAs={headingAs}
        description="A curated editorial collection of event posters, student council pubmats, brand logomarks, and speaker designs from the My Edits archive."
      />

      <div className="gallery-filter-bar" role="group" aria-label="Filter gallery designs by category">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`gallery-filter-pill ${activeFilter === cat ? "is-active" : ""}`}
            type="button"
            aria-pressed={activeFilter === cat}
            onClick={() => setActiveFilter(cat)}
          >
            <span>{cat}</span>
            <span className="filter-count">
              {cat === "All Works"
                ? galleryItems.length
                : galleryItems.filter((i) => i.filterCategory === cat).length}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="gallery-editorial-grid"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item, idx) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={idx}
              onOpen={() => onOpenLightbox(item, filteredItems)}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

function GalleryCard({ item, index = 0, onOpen }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.article
      layout
      className="gallery-image-card"
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reducedMotion ? undefined : { opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.04 }}
      whileHover={reducedMotion ? undefined : { y: -3 }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      aria-label={`View ${item.title}`}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
    >
      <div className="gallery-img-container">
        <img
          src={imagePath(item.image)}
          alt={item.title}
          loading="lazy"
          className="gallery-pure-img"
          {...imageSize(item.image)}
        />
        <div className="gallery-view-indicator">
          <span className="gallery-view-badge">
            <span aria-hidden="true">⤢</span> View
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/* ============================================================
   LIGHTBOX MODAL (FOR GALLERY & UI/UX SCREENS)
   ============================================================ */
function LightboxModal({ item, list = [], onClose, onSelect }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const currentIndex = list.findIndex((i) => (i.id || i.slug) === (item.id || item.slug));

  const handlePrev = useCallback(() => {
    if (list.length <= 1) return;
    const prevIdx = (currentIndex - 1 + list.length) % list.length;
    onSelect(list[prevIdx]);
  }, [currentIndex, list, onSelect]);

  const handleNext = useCallback(() => {
    if (list.length <= 1) return;
    const nextIdx = (currentIndex + 1) % list.length;
    onSelect(list[nextIdx]);
  }, [currentIndex, list, onSelect]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") { e.preventDefault(); handlePrev(); }
      if (e.key === "ArrowRight") { e.preventDefault(); handleNext(); }
      if (e.key === "Tab") {
        const controls = [...dialogRef.current.querySelectorAll("button, a[href]")];
        const first = controls[0];
        const last = controls.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handlePrev, handleNext]);

  return createPortal(
    <div
      ref={dialogRef}
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={item.title || item.name}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="lightbox-container">
        <div className="lightbox-header">
          <div className="lightbox-meta-header">
            <span className="lightbox-category">{item.category || item.tag}</span>
            <span className="lightbox-counter">{currentIndex + 1} of {list.length}</span>
          </div>
          <button
            type="button"
            ref={closeRef}
            className="lightbox-close-btn"
            onClick={onClose}
            aria-label="Close image preview"
          >
            ✕
          </button>
        </div>

        <div className="lightbox-stage">
          {list.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn lightbox-prev"
              onClick={handlePrev}
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          <div className="lightbox-image-box">
            {item.placeholder ? <div className="lightbox-placeholder">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="32" height="32"><path fill="currentColor" d={siFigma.path} /></svg>
              <span className="paper-label">{item.tag}</span>
              <h2>{item.title}</h2>
              <p>Prepared UI templates ready for Figma screen exports.</p>
              {item.previewUrl && <a className="button button-outline" href={item.previewUrl} target="_blank" rel="noopener noreferrer">Open project preview ↗</a>}
            </div> : <img
              src={imagePath(item.image)}
              alt={item.title || item.name}
              className="lightbox-img"
            />}
          </div>

          {list.length > 1 && (
            <button
              type="button"
              className="lightbox-nav-btn lightbox-next"
              onClick={handleNext}
              aria-label="Next image"
            >
              ›
            </button>
          )}
        </div>

        <div className="lightbox-footer">
          <div className="lightbox-footer-info">
            <span className="lightbox-footer-cat">{item.category || item.tag}</span>
            <h3>{item.title || item.name}</h3>
            {item.description && <p>{item.description}</p>}
          </div>
          {item.year && <span className="lightbox-year">{item.year}</span>}
        </div>
      </div>
    </div>, document.body
  );
}

function interfaceForProject(project) {
  return portfolio.uiuxShowcase.find(item => (item.figmaUrl && item.figmaUrl === project.figmaUrl) || (item.externalUrl && item.externalUrl === project.externalUrl));
}

/* ============================================================
   05. ABOUT ME SECTION (EDITORIAL STATEMENT & BIOGRAPHY)
   ============================================================ */
function AboutSection({ profile }) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="about-section section-pad" id="about">
      <motion.div
        className="about-portrait-card"
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <div className="about-img-frame">
          <motion.img
            src={imagePath(profile.portrait)}
            alt={`Portrait of ${profile.name}`}
            loading="lazy"
            whileHover={reducedMotion ? undefined : { scale: 1.03 }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="about-portrait-caption">
          <strong>Good work, made together.</strong>
          <span>{profile.education}</span>
        </div>
        <div className="hero-stats about-stats" aria-label="Portfolio highlights">
          {profile.stats.map((stat) => <div className="hero-stat" key={stat.label}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}
        </div>
      </motion.div>

      <Reveal className="about-copy">
        <p className="eyebrow">About Trisha Marie Oronan</p>
        <h2>Design with a point of view.<br />And both feet on the ground.<SectionSketch /></h2>
        <p className="about-lead">
          I’m {profile.name}, a {profile.role} based in the {profile.location}.
        </p>
        <p>
          I am passionate about turning ideas into clear, thoughtful digital experiences. I use Figma for interface design, Canva for visual editing, and CapCut for video editing. I'm also learning to build websites and mobile apps using React, HTML/CSS, and Flutter.
        </p>

        <div className="about-education-callout">
          <span className="education-label">Education</span>
          <div>
            <strong>{profile.education}</strong>
            <p>Undergraduate Studies · Information Technology · Philippines</p>
          </div>
        </div>

        <div className="about-skills-block" id="skills">
          <p className="skills-subhead">Core Software &amp; Frameworks</p>
          <div className="about-skill-chips">
            {profile.skillGroups.flatMap((g) => g.items).filter((skill) => !["Expo Go", "React", "React Native"].includes(skill)).map((skill) => (
              <span key={skill} className="about-skill-chip"><SkillLogo skill={skill} /></span>
            ))}
          </div>
        </div>

        <a
          className="text-link"
          href={getGmailUrl({ to: profile.email, subject: "Hello Trisha — Portfolio Connection" })}
          target="_blank"
          rel="noreferrer"
        >
          Connect with me via Email <span aria-hidden="true">↗</span>
        </a>
      </Reveal>
      <CurrentlyExploringSection exploringItems={portfolio.currentlyExploring} />
    </section>
  );
}

function CurrentlyExploringSection({ exploringItems }) {
  const [active, setActive] = useState(exploringItems[0].id);
  const tabsId = useId();
  const selected = exploringItems.find((item) => item.id === active);
  return (
    <div className="about-exploring" id="exploring">
      <div className="exploring-heading"><h3>Currently Exploring</h3><span className="paper-label">Learning as I go</span></div>
      <div className="exploring-tabs" role="tablist" aria-label="Currently Exploring topics">
        {exploringItems.map((item, index) => <button key={item.id} type="button" role="tab"
          id={`${tabsId}-${item.id}`} aria-controls={`${tabsId}-panel`} aria-selected={active === item.id}
          tabIndex={active === item.id ? 0 : -1} onClick={() => setActive(item.id)}
          onKeyDown={(event) => {
            const next = event.key === "ArrowRight" ? (index + 1) % exploringItems.length : event.key === "ArrowLeft" ? (index - 1 + exploringItems.length) % exploringItems.length : event.key === "Home" ? 0 : event.key === "End" ? exploringItems.length - 1 : null;
            if (next === null) return;
            event.preventDefault();
            setActive(exploringItems[next].id);
            event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
          }}><span className="exploring-number">{item.number}</span>{item.title}</button>)}
      </div>
      <label className="exploring-select-label" htmlFor={`${tabsId}-select`}>Choose an interest
        <select id={`${tabsId}-select`} value={active} onChange={(event) => setActive(event.target.value)}>
          {exploringItems.map((item) => <option key={item.id} value={item.id}>{item.number} · {item.title}</option>)}
        </select>
      </label>
      <div className="exploring-panel" role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${active}`}>
        <p>{selected.detail}</p><span>{selected.badge}</span>
      </div>
    </div>
  );
}
function IdeasWorthSharingSection({ articles }) {
  // Display only three featured articles initially
  const featuredArticles = articles.slice(0, 3);

  return (
    <section className="section section-pad blog-section" id="journal">
      <SectionHeading
        eyebrow="Notes from the process"
        title="Ideas worth sharing."
        description="Thoughts on accessibility, visual pacing in interfaces, and discovering creativity from personal passions."
        link="All notes"
        to="/blog"
      />
      <div className="article-grid">
        {featuredArticles.map((article, index) => (
          <ArticleCard key={article.slug} article={article} index={index} />
        ))}
      </div>
    </section>
  );
}

/* ============================================================
   08. CONTACT SECTION (CLEAR INVITATION, EMAIL, INSTAGRAM)
   08. CONTACT SECTION (UNIFIED, BALANCED & RESPONSIVE)
   ============================================================ */
function ContactSection({ profile, onContact }) {
  const reducedMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const copyTimer = useRef(null);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setCopyError("");
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyError("Please select and copy the email address above.");
    }
  }

  return (
    <section className="contact-band section-pad" id="contact">
      <Reveal className="contact-intro-block">
        <p className="eyebrow">Let's make it matter</p>
        <h2>Have something good in mind?<br />Let's connect.<SectionSketch /></h2>
        <p className="contact-lead-text">
          I’m currently available for UI/UX internships, graphic design collaborations, and creative student projects. Whether you have an idea to discuss or just want to say hi, my inbox is always open.
        </p>
      </Reveal>
      <motion.div
        className="unified-contact-card"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="contact-channels-grid">
          {/* Email channel */}
          <div className="contact-channel-item">
            <div className="channel-icon-wrap">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d={siGmail.path} />
              </svg>
            </div>
            <div className="channel-text">
              <span className="channel-label">Email</span>
              <a
                href={getGmailUrl({ to: profile.email, subject: "Hello Trisha — Portfolio Inquiry" })}
                target="_blank"
                rel="noreferrer"
                className="channel-link"
              >
                {profile.email}
              </a>
            </div>
            <button
              type="button"
              className="channel-copy-btn"
              onClick={copyEmail}
              aria-label="Copy email address"
              title="Copy email to clipboard"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
            <a
              href={getGmailUrl({ to: profile.email, subject: "Hello Trisha — Portfolio Inquiry" })}
              target="_blank"
              rel="noreferrer"
              className="button button-small button-dark"
            >
              Open Gmail ↗
            </a>
          </div>

          {/* Instagram channel */}
          <a
            href={profile.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="contact-channel-item contact-channel-link"
            aria-label="Visit Instagram profile"
          >
            <div className="channel-icon-wrap instagram-icon">
              <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d={siInstagram.path} />
              </svg>
            </div>
            <div className="channel-text">
              <span className="channel-label">Instagram</span>
              <span className="channel-link">@{profile.instagram}</span>
            </div>
            <span className="channel-arrow" aria-hidden="true">↗</span>
          </a>
        </div>

      <p className="copy-status" role="status">{copied ? "Email address copied." : copyError}</p>
      <div className="contact-cta-row">
        <button
          className="button button-dark contact-main-btn"
          type="button"
          onClick={onContact}
        >
          Send an Inquiry Message <span aria-hidden="true">↗</span>
        </button>
      </div>
      </motion.div>
    </section>
  );
}

/* ============================================================
   HOME PAGE (STRUCTURED ACCORDING TO USER'S 8 SECTIONS)
   ============================================================ */
function usePortfolioLightbox() {
  const [selection, setSelection] = useState(null);
  const close = useCallback(() => setSelection(null), []);
  const open = (item, list) => setSelection({ item, list });
  const openScreen = (project, screen) => {
    const item = {
      id: `${project.id}-${screen.id}`, title: `${project.name} · ${screen.name}`,
      category: `${project.category} · Screen Walkthrough`, tag: screen.placeholderTag,
      description: screen.desc, year: project.year, placeholder: true,
      previewUrl: project.figmaUrl || project.externalUrl
    };
    open(item, [item]);
  };
  const modal = selection && <LightboxModal item={selection.item} list={selection.list} onClose={close}
    onSelect={(item) => setSelection((current) => ({ ...current, item }))} />;
  return { open, openScreen, modal };
}

// Keep category order, with the two existing IT Talks group posters leading Speakers.
function orderedGallery() {
  const items = portfolio.creativeGallery;
  const groupIds = ["speaker-teaser-1", "speaker-teaser-2"];
  return [
    ...items.filter((item) => item.filterCategory !== "Speaker Designs"),
    ...groupIds.map((id) => items.find((item) => item.id === id)),
    ...items.filter((item) => item.filterCategory === "Speaker Designs" && !groupIds.includes(item.id))
  ];
}

function SelectedCreativeWorks({ onOpenLightbox }) {
  const [category, setCategory] = useState("Graphic Design");
  const tabs = ["Graphic Design", "Video Editing"];
  const tabsId = useId();
  const reducedMotion = useReducedMotion();
  const selectedIds = ["speaker-teaser-1", "speaker-teaser-2", "event-edsa-anniversary", "event-academic-achiever", "social-graphic-officer", "speaker-micaela"];
  const selectedArt = selectedIds.map((id) => portfolio.creativeGallery.find((item) => item.id === id));
  const videoProjects = portfolio.projects.filter((project) => project.category === "Video Edits");

  return (
    <section className="selected-works section section-pad" id="work" aria-labelledby="selected-work-title">
      <Doodle kind="scribble" className="selected-flower" />
      <div className="selected-heading">
        <div><p className="eyebrow">A little of what I make</p><h2 id="selected-work-title">Selected<br /><span>Creative Works.</span><SectionSketch /></h2></div>
        <p>Graphic design, digital experiences, and visual storytelling.</p>
      </div>
      <div className="creative-tabs" role="tablist" aria-label="Selected Creative Works categories">
        {tabs.map((tab, index) => <button key={tab} type="button" role="tab" id={`${tabsId}-tab-${index}`}
          aria-controls={`${tabsId}-panel`} aria-selected={category === tab} tabIndex={category === tab ? 0 : -1}
          onClick={() => setCategory(tab)} onKeyDown={(event) => {
            const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : null;
            if (next === null) return;
            event.preventDefault();
            setCategory(tabs[next]);
            event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next].focus();
          }}>{tab}</button>)}
      </div>
      <motion.div key={category} className="creative-tab-panel" role="tabpanel" id={`${tabsId}-panel`}
        aria-labelledby={`${tabsId}-tab-${tabs.indexOf(category)}`} initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .2 }}>
        {category === "Graphic Design" && <>
          <div className="selected-art-grid">
            {selectedArt.map((item, index) => <GalleryCard key={item.id} item={item} index={index} onOpen={() => onOpenLightbox(item, selectedArt)} />)}
          </div>
          <div className="selected-more"><span>{selectedArt.length} selected designs · {portfolio.creativeGallery.length} in the archive</span><Link className="button button-outline" to="/gallery">View All Designs <span aria-hidden="true">↗</span></Link></div>
        </>}
        {category === "Video Editing" && <>
          <div className="selected-video-grid">{videoProjects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
          <div className="selected-more"><span>{videoProjects.length} edits · watch here or on YouTube</span></div>
        </>}
      </motion.div>
    </section>
  );
}

function HomePage({ onContact, heroReplay }) {
  const lightbox = usePortfolioLightbox();
  return <>
    <HeroSection profile={portfolio.profile} onContact={onContact} replay={heroReplay} />
    <SelectedCreativeWorks onOpenLightbox={lightbox.open} />
    <FeaturedProjectsSection projects={portfolio.projects} />
    <AboutSection profile={portfolio.profile} />
    <ContactSection profile={portfolio.profile} onContact={onContact} />
    {lightbox.modal}
  </>;
}

function GalleryPage() {
  const lightbox = usePortfolioLightbox();
  return <div className="gallery-page">
    <CreativeGallerySection galleryItems={orderedGallery()} onOpenLightbox={lightbox.open} headingAs="h1" />
    {lightbox.modal}
  </div>;
}

function LegacyUIUXRedirect() {
  const [params] = useSearchParams();
  const requested = portfolio.uiuxShowcase.find(item => item.id === params.get("project"));
  const project = requested && portfolio.projects.find(item => interfaceForProject(item)?.id === requested.id);
  return <Navigate to={project ? "/work/" + project.slug : "/#projects"} replace />;
}
function BlogPage() {
  return (
    <>
      <section className="page-intro section-pad">
        <Reveal>
          <p className="eyebrow">Journal · Notes, ideas, and useful questions</p>
          <h1>Ideas worth<br /><span>sharing.</span></h1>
          <p className="journal-subtitle">Design is a team sport.</p>
          <p>Thoughts on making better work, working better together, and keeping the human in the experience.</p>
          <p>Thoughts on accessibility, visual pacing in interfaces, and discovering creativity from personal passions.</p>
        </Reveal>
      </section>
      <section className="section section-pad page-list">
        <div className="article-grid article-grid-wide">
          {portfolio.articles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}

function ProjectPage() {
  const { slug } = useParams();
  const project = portfolio.projects.find((item) => item.slug === slug);
  const related = portfolio.projects.filter((item) => item.slug !== project?.slug).slice(0, 3);

  useEffect(() => {
    document.title = project ? `${project.name} | ${portfolio.profile.name}` : `Project not found | ${portfolio.profile.name}`;
  }, [project]);

  if (!project) {
    return (
      <section className="page-intro section-pad">
        <Reveal>
          <p className="eyebrow">Project not found</p>
          <h1>This project<br /><span>isn’t available.</span></h1>
          <Link className="text-link" to="/#projects">Back to Projects <span aria-hidden="true">↗</span></Link>
        </Reveal>
      </section>
    );
  }

  return (
    <>
      <section className="case-intro section-pad">
        <Link className="back-link" to="/#projects">← Back to Projects</Link>
        {(project.role || project.timeline || project.year) && <p className="eyebrow">{[project.role, project.timeline || project.year].filter(Boolean).join(" · ")}</p>}
        <h1>{project.title || project.name}</h1>
        {(project.timeline || project.year || project.role) && <div className="case-facts">
          {(project.timeline || project.year) && <span><small>Timeline</small>{project.timeline || project.year}</span>}
          {project.role && <span><small>Role</small>{project.role}</span>}
        </div>}
      </section>

      {project.logo ? (
        <ProjectLogoBanner key={project.slug} project={project} />
      ) : project.youtubeUrl ? (
        <div className="case-cover video-case-cover youtube-case-cover">
          <VideoPlayer project={project} />
        </div>
      ) : project.video ? (
        <div className="case-cover video-case-cover">
          <video controls preload="metadata" playsInline aria-label={project.name}>
            <source src={project.video} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        </div>
      ) : project.cover ? (
        <div className="case-cover">
          <img src={imagePath(project.cover)} alt={project.name} />
        </div>
      ) : (
        <div className="case-cover">
          <div className={`project-placeholder ${project.previewClass ?? "dsync-preview"}`}>
            <span className="dsync-mark">{project.previewMark ?? project.name}</span>
            <span className="dsync-caption">{project.previewCaption ?? "INTERACTIVE PROTOTYPE"}</span>
          </div>
        </div>
      )}

      <section className="case-overview section-pad">
        {(project.overview || project.summary) && <div>
          <p className="eyebrow">Project overview</p>
          <p className="case-summary">{project.overview || project.summary}</p>
        </div>}
        {(project.youtubeUrl || project.externalUrl || project.figmaUrl) && (
          <a
            className="button button-dark case-preview-button"
            href={project.youtubeUrl ?? project.externalUrl ?? project.figmaUrl}
            target="_blank"
            rel={project.figmaUrl ? "noopener noreferrer" : "noreferrer"}
          >
            {project.youtubeUrl ? (
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true" style={{ marginRight: 6 }}>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            ) : (
              <span aria-hidden="true">➔</span>
            )}
            <span className="case-preview-label">{project.previewLabel || (project.youtubeUrl ? "Watch on YouTube" : "Open preview")}</span>
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </section>

      {(project.tools || project.figmaUrl || project.externalUrl) && (
        <section className="case-design-details section-pad" aria-label="Tools and technology">
          {project.tools && <div><h2>Tools &amp; technology</h2><div className="case-tools">{project.tools.map((tool) => <span className="tech-pill" key={tool}>{tool}</span>)}</div></div>}
        </section>
      )}

      <section className="section section-pad">
        <SectionHeading eyebrow="Keep looking" title="More selected work" />
        <div className="project-grid">
          {related.map((item, index) => (
            <ProjectCard key={item.slug} project={item} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}

function articleInlineText(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => part.startsWith("**") && part.endsWith("**") ? <strong key={index}>{part.slice(2, -2)}</strong> : part);
}

function ArticlePage() {
  const reducedMotion = useReducedMotion();
  const { slug } = useParams();
  const article = portfolio.articles.find((item) => item.slug === slug) ?? portfolio.articles[0];
  const related = portfolio.articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  useEffect(() => {
    document.title = `${article.title} | ${portfolio.profile.name}`;
  }, [article]);

  return (
    <>
      <article className="article-page">
        <header className="article-header section-pad">
          <Link className="back-link" to="/blog">← All notes</Link>
          <p className="eyebrow">{article.category} · {article.date}</p>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
        </header>
        <motion.figure
          className="article-cover"
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
        >
          <img src={imagePath(article.image)} alt="" fetchPriority="high" />
        </motion.figure>
        <div className="article-body">
          <p className="article-byline">Words by {portfolio.profile.name} <span>·</span> {article.date}</p>
          {article.paragraphs.map((paragraph, index) => (
            <Reveal as="p" key={`${article.slug}-${index}`} delay={index * 0.04}>
              {articleInlineText(paragraph)}
            </Reveal>
          ))}
          <p className="article-end">{articleInlineText(article.closing || "Thanks for reading.")}</p>
        </div>
      </article>
      <section className="section section-pad">
        <SectionHeading eyebrow="Continue reading" title="More notes" />
        <div className="article-grid">
          {related.map((item, index) => (
            <ArticleCard key={item.slug} article={item} index={index} />
          ))}
        </div>
      </section>
    </>
  );
}

function LegalPage() {
  const { document: documentType } = useParams();
  const isPrivacy = documentType !== "terms";
  const heading = isPrivacy ? "Privacy policy" : "Terms of use";
  const sections = isPrivacy
    ? [
      ["Information collected", "This portfolio does not run analytics. If you submit an inquiry, your name, email address, inquiry type, and message are sent through Formspree so I can respond. You can also contact me directly by email."],
      ["External links", "Links to other websites are provided for convenience. Their privacy practices are governed by their own policies."],
      ["Contact", `Questions about this policy? Email ${portfolio.profile.email}.`]
    ]
    : [
      ["Portfolio content", "The writing, project descriptions, and visuals on this site are provided to show selected work. Please contact me before reproducing any material."],
      ["External websites", "Links to third-party websites are provided for reference. I am not responsible for their content or availability."],
      ["Contact", `Questions about these terms? Email ${portfolio.profile.email}.`]
    ];

  useEffect(() => {
    document.title = `${heading} | ${portfolio.profile.name}`;
  }, [heading]);

  return (
    <section className="legal-page section-pad">
      <Link className="back-link" to="/">← Home</Link>
      <p className="eyebrow">Last updated October 2026</p>
      <h1>{heading}</h1>
      {sections.map(([title, text], index) => (
        <Reveal as="section" key={title} delay={index * 0.06}>
          <h2>{title}</h2>
          <p>{text}</p>
        </Reveal>
      ))}
    </section>
  );
}

function ProjectCard({ project, index = 0 }) {
  const reducedMotion = useReducedMotion();
  const externalUrl = project.externalUrl ?? project.figmaUrl ?? project.youtubeUrl ?? (project.cover ? imagePath(project.cover) : null);
  const opensDetails = Boolean(project.overview || project.youtubeUrl);
  const isVideo = Boolean(project.video || project.youtubeUrl);
  const Card = isVideo ? motion.article : externalUrl && !opensDetails ? motion.a : MotionLink;
  const destination = isVideo
    ? {}
    : externalUrl && !opensDetails
    ? { href: externalUrl, target: "_blank", rel: project.figmaUrl ? "noopener noreferrer" : "noreferrer" }
    : { to: `/work/${project.slug}` };

  return (
    <Card
      className={`project-card reveal-card${isVideo ? " video-project-card" : ""}`}
      {...destination}
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.58, delay: index % 2 ? 0.08 : 0, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={reducedMotion ? undefined : { y: -5 }}
      whileTap={reducedMotion ? undefined : { scale: 0.99 }}
    >
      <div className={`project-image${isVideo ? " video-project-image" : ""}`}>
        {project.youtubeUrl ? (
          <VideoPlayer project={project} />
        ) : project.video ? (
          <video controls preload="metadata" playsInline aria-label={project.name}>
            <source src={project.video} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        ) : project.cover ? (
          <img src={imagePath(project.cover)} alt={`${project.name} preview`} loading="lazy" />
        ) : (
          <div className={`project-placeholder${project.previewClass ? ` ${project.previewClass}` : " dsync-preview"}`}>
            <span className="dsync-mark">{project.previewMark ?? "D/S"}</span>
            <span className="dsync-caption">{project.previewCaption ?? "MOBILE PROTOTYPE · FIGMA"}</span>
          </div>
        )}
        {!isVideo && (
          <>
            <span className="image-arrow" aria-hidden="true">↗</span>
            <span className="image-cta" aria-hidden="true">{project.linkLabel ?? (project.figmaUrl ? "Open prototype" : "View project")} <span>↗</span></span>
          </>
        )}
      </div>
      <div className="project-meta">
        <div>
          <h3>{project.name}</h3>
          <p>{project.category}</p>
        </div>
        <div className="project-meta-side">
          {project.year && <span>{project.year}</span>}
          <div className="project-meta-actions">
            {project.youtubeUrl && (
              <a
                href={project.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="project-youtube-pill"
                title="Watch on YouTube"
                aria-label={`Watch ${project.name} on YouTube`}
              >
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span>YouTube ↗</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ArticleCard({ article, index = 0 }) {
  const reducedMotion = useReducedMotion();

  return (
    <MotionLink
      className="article-card reveal-card"
      to={`/blog/${article.slug}`}
      initial={reducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={reducedMotion ? undefined : { y: -5 }}
      whileTap={reducedMotion ? undefined : { scale: 0.99 }}
    >
      <div className="article-image">
        <motion.img
          src={imagePath(article.image)}
          alt={article.title}
          loading="lazy"
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          transition={{ duration: 0.65 }}
        />
        <span className="image-arrow" aria-hidden="true">↗</span>
        <span className="image-cta" aria-hidden="true">Read note <span>↗</span></span>
      </div>
      <div className="article-content-body">
        <div className="article-meta">
          <span className="article-category-badge">{article.category}</span>
          <span className="article-date">{article.date}</span>
        </div>
        <h3 className="article-title">{article.title}</h3>
        <p className="article-summary-text">{article.summary}</p>
      </div>
    </MotionLink>
  );
}

function SectionHeading({ eyebrow, title, link, to, description, headingAs = "h2" }) {
  const Heading = headingAs;
  return (
    <Reveal className="section-heading" as="div">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <Heading>{title}</Heading>
      </div>
      {description && <p className="section-intro">{description}</p>}
      {link && (to?.startsWith("http")
        ? <a className="text-link" href={to} target="_blank" rel="noreferrer">{link} <span aria-hidden="true">↗</span></a>
        : <Link className="text-link" to={to}>{link} <span aria-hidden="true">↗</span></Link>)}
    </Reveal>
  );
}

function AnimatedRoutes({ onContact, heroReplay }) {
  const location = useLocation();
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const pageTitle = {
      "/": "TRISHA ʕ-ʔ",
      "/blog": `Journal | ${portfolio.profile.name} | ${portfolio.profile.brand}`,
      "/journal": `Journal | ${portfolio.profile.name} | ${portfolio.profile.brand}`,
      "/gallery": `Creative Gallery | ${portfolio.profile.brand}`,
      "/uiux": `UI/UX Showcase | ${portfolio.profile.brand}`
    }[location.pathname];
    if (pageTitle) document.title = pageTitle;
  }, [location.pathname]);

  useEffect(() => {
    const legacyRoutes = { "#gallery": "/gallery", "#uiux": "/#projects", "#journal": "/blog" };
    if (location.pathname.startsWith("/work/") && location.hash === "#interface-design") {
      navigate(location.pathname + location.search, { replace: true });
      return;
    }
    if (location.pathname === "/" && legacyRoutes[location.hash]) {
      navigate(legacyRoutes[location.hash], { replace: true });
      return;
    }
    let frame;
    let attempts = 0;
    let cancelled = false;
    if (location.hash) {
      // Wait for an exiting route to finish before locating a home-page anchor.
      const scrollToAnchor = () => {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) {
          // Swapping the two headline fonts can change the height above an anchor.
          document.fonts.ready.then(() => {
            if (!cancelled) frame = requestAnimationFrame(() => {
              if (target.isConnected) target.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
            });
          });
        }
        else if (attempts++ < 60) frame = requestAnimationFrame(scrollToAnchor);
      };
      frame = requestAnimationFrame(scrollToAnchor);
    } else {
      window.scrollTo({ top: 0, behavior: location.pathname === "/" && !reducedMotion ? "smooth" : "instant" });
    }
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [location.pathname, location.hash, reducedMotion, navigate]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        className="route-transition"
        key={location.pathname}
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reducedMotion ? undefined : { opacity: 0, y: -5 }}
        transition={{ duration: 0.26, ease: "easeOut" }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage onContact={onContact} heroReplay={heroReplay} />} />
          <Route path="/work" element={<Navigate to="/#projects" replace />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/uiux" element={<LegacyUIUXRedirect />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/journal" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/legal/:document" element={<LegalPage />} />
          <Route path="*" element={<HomePage onContact={onContact} heroReplay={heroReplay} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [contactOpen, setContactOpen] = useState(false);
  const [heroReplay, setHeroReplay] = useState(0);
  const reducedMotion = useReducedMotion();
  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);
  const replayHome = useCallback((event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    setHeroReplay(value => value + 1);
    window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }, [reducedMotion]);

  return (
    <div className="site-frame">
      <a className="skip-link" href="#app">Skip to content</a>
      <div className="announcement-strip">{portfolio.profile.availability}</div>
      <SiteHeader onHome={replayHome} />
      <main id="app" tabIndex={-1}><AnimatedRoutes onContact={openContact} heroReplay={heroReplay} /></main>
      <SiteFooter onContact={openContact} onHome={replayHome} />
      <ScrollControls />
      {contactOpen && createPortal(<ContactDialog onClose={closeContact} />, document.body)}
    </div>
  );
}

function ContactDialog({ onClose }) {
  const profile = portfolio.profile;
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll("button, input, textarea, select, a[href]")].filter((element) => !element.matches(":disabled") && element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      previousFocus?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="contact-backdrop"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        className="contact-dialog"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
      >
        <div className="contact-dialog-heading">
          <div>
            <p className="eyebrow">Let's connect</p>
            <h2 id="contact-title">Send a message</h2>
            <p>Send an inquiry here, or <a href={"mailto:" + profile.email}>email me directly</a>.</p>
          </div>
          <button className="contact-close" type="button" aria-label="Close contact form" onClick={onClose}>×</button>
        </div>
        <div className="contact-person">
          <img src={imagePath(profile.portrait)} alt="" />
          <div>
            <strong>{profile.name}</strong>
            <a href={getGmailUrl({ to: profile.email })} target="_blank" rel="noreferrer">{profile.email}</a>
          </div>
        </div>
        <p className="contact-dialog-intro">I’m currently available for UI/UX internships, graphic design collaborations, and creative student projects. Whether you have an idea to discuss or just want to say hi, feel free to reach out.</p>
        <ContactForm email={profile.email} />

      </section>
    </div>
  );
}
