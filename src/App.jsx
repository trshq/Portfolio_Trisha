import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "motion/react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useParams
} from "react-router-dom";
import { siCss, siExpo, siFigma, siHtml5, siJavascript, siReact } from "simple-icons";
import portfolio from "../content.js";
import { imagePath } from "./assets.js";

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
  "Expo Go": siExpo
};
const navLinks = [
  ["Work", "/work"],
  ["Skills", "/#skills"],
  ["About", "/#about"],
  ["Blog", "/blog"]
];

function SkillLogo({ skill }) {
  const icon = skillIcons[skill];
  const image = skill === "CSS" ? "css.jpg" : skill === "JavaScript" ? "js.jpg" : null;

  return (
    <span className="skill-logo-item">
      {image ? (
        <img src={imagePath(image)} alt="" aria-hidden="true" />
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
      initial={reducedMotion ? false : { opacity: 0, y: 22, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function PointerSurface({ as = "div", className = "", children, strength = 5, ...props }) {
  const reducedMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 150, damping: 20, mass: 0.7 });
  const smoothY = useSpring(pointerY, { stiffness: 150, damping: 20, mass: 0.7 });
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-strength, strength]);
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [strength, -strength]);
  const Tag = motion[as] ?? motion.div;

  function trackPointer(event) {
    if (reducedMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function resetPointer() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <Tag
      className={className}
      onPointerMove={trackPointer}
      onPointerLeave={resetPointer}
      style={reducedMotion ? undefined : { rotateX, rotateY, transformPerspective: 1000 }}
      {...props}
    >
      {children}
    </Tag>
  );
}

function SiteNav({ floating = false, mobileOpen = false, onNavigate = () => {}, onContact = () => {} }) {
  const location = useLocation();
  const navClass = `${floating ? "main-nav floating-nav" : "main-nav"}${mobileOpen ? " is-open" : ""}`;

  return (
    <nav className={navClass} aria-label={floating ? "Quick navigation" : "Main navigation"}>
      {navLinks.map(([label, href]) => (
        <Link
          key={label}
          to={href}
          className={location.pathname === href ? "nav-current" : undefined}
          onClick={onNavigate}
        >
          {label}
        </Link>
      ))}
      <button className="button button-small" type="button" onClick={() => { onNavigate(); onContact(); }}>
        Contact <span aria-hidden="true">↗</span>
      </button>
    </nav>
  );
}

function SiteHeader({ showFloatingNav, onContact }) {
  const profile = portfolio.profile;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header id="site-header">
      <div className="nav-wrap">
        <Link className="brand" to="/" aria-label={`${profile.name}, home`}>
          <img src={imagePath(profile.portrait)} alt="" />
          <span>{profile.name}</span>
        </Link>
        <SiteNav mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} onContact={onContact} />
        <button className="menu-toggle" type="button" aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
          <span />
          <span />
        </button>
      </div>
      <AnimatePresence>
        {showFloatingNav && (
          <motion.div
            className="floating-nav-wrap"
            initial={{ opacity: 0, y: -18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <Link className="floating-brand" to="/" aria-label="Back to home">
              {profile.name}
            </Link>
            <SiteNav floating onContact={onContact} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function SiteFooter() {
  const profile = portfolio.profile;

  return (
    <footer id="site-footer">
      <div className="footer-top">
        <Link className="brand" to="/">
          <img src={imagePath(profile.portrait)} alt="" />
          <span>{profile.name}</span>
        </Link>
        <p>{profile.role} · {profile.location}</p>
        <a className="text-link" href={getGmailUrl({ to: profile.email })} target="_blank" rel="noreferrer">
          {profile.email} <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <div>
          <Link to="/legal/privacy">Privacy</Link>
          <Link to="/legal/terms">Terms</Link>
          <a href={getGmailUrl({ to: profile.email })} target="_blank" rel="noreferrer">Email ↗</a>
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

  useMotionValueEvent(scrollY, "change", (latest) => setShowTop(latest > 520));

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
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
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

function getYouTubeId(url) {
  if (!url) return "";
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:shorts\/|watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : "";
}

function ProjectCard({ project, index = 0 }) {
  const reducedMotion = useReducedMotion();
  const externalUrl = project.externalUrl ?? project.figmaUrl ?? project.youtubeUrl ?? (project.cover ? imagePath(project.cover) : null);
  const opensDetails = Boolean(project.overview);
  const isVideo = Boolean(project.video || project.youtubeUrl);
  const Card = isVideo ? motion.article : externalUrl && !opensDetails ? motion.a : MotionLink;
  const destination = isVideo
    ? {}
    : externalUrl && !opensDetails
    ? { href: externalUrl, target: "_blank", rel: "noreferrer" }
    : { to: `/work/${project.slug}` };
  const youtubeId = project.youtubeId || getYouTubeId(project.youtubeUrl);

  return (
    <Card
      className="project-card reveal-card"
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
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
            title={project.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="lazy"
          />
        ) : project.video ? (
          <video controls preload="metadata" playsInline aria-label={project.name}>
            <source src={project.video} type="video/mp4" />
            Your browser does not support HTML video.
          </video>
        ) : project.cover ? (
          <img src={imagePath(project.cover)} alt={`${project.name} project preview`} loading="lazy" />
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
          {opensDetails && isVideo ? (
            <Link to={`/work/${project.slug}`} className="project-title-link">
              <h3>{project.name} <span className="title-arrow" aria-hidden="true">↗</span></h3>
            </Link>
          ) : (
            <h3>{project.name}</h3>
          )}
          <p>{project.category}</p>
        </div>
        <div className="project-meta-side">
          <span>{project.year}</span>
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
            {opensDetails && isVideo && (
              <Link to={`/work/${project.slug}`} className="project-details-pill">
                View details <span>↗</span>
              </Link>
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
        <motion.img src={imagePath(article.image)} alt="" loading="lazy" whileHover={reducedMotion ? undefined : { scale: 1.05 }} transition={{ duration: 0.65 }} />
        <span className="image-arrow" aria-hidden="true">↗</span>
        <span className="image-cta" aria-hidden="true">Read note <span>↗</span></span>
      </div>
      <div className="article-meta"><span>{article.category}</span><span>{article.date}</span></div>
      <h3>{article.title}</h3>
      <p>{article.summary}</p>
    </MotionLink>
  );
}

function SectionHeading({ eyebrow, title, link, to, description }) {
  return (
    <Reveal className="section-heading" as="div">
      <div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>
      {description && <p className="section-intro">{description}</p>}
      {link && (to.startsWith("http")
        ? <a className="text-link" href={to} target="_blank" rel="noreferrer">{link} <span aria-hidden="true">↗</span></a>
        : <Link className="text-link" to={to}>{link} <span aria-hidden="true">↗</span></Link>)}
    </Reveal>
  );
}

function HomePage() {
  const profile = portfolio.profile;
  const featuredArticles = portfolio.articles.slice(0, 3);
  const featuredWork = portfolio.projects.filter((project) => project.featured);
  const reducedMotion = useReducedMotion();

  return (
    <>
      <section className="hero section-pad">
        <Reveal className="hero-copy" as="div">
          <p className="availability"><span />{profile.availability}</p>
          <h1><span>{profile.headlineMuted}</span><br />{profile.headlineStrong}</h1>
          <p className="hero-description"><strong>{profile.role}.</strong> {profile.introduction}</p>
          <div className="hero-stats" aria-label="Quick highlights">
            <div className="hero-stat"><strong>4+</strong><span>Projects</span></div>
            <div className="hero-stat"><strong>9+</strong><span>Tools</span></div>
            <div className="hero-stat"><strong>4+</strong><span>Years learning</span></div>
          </div>
          <motion.a className="button button-dark" href={profile.calendarUrl} target="_blank" rel="noreferrer" whileHover={reducedMotion ? undefined : { y: -3 }} whileTap={reducedMotion ? undefined : { scale: 0.97 }}>
            <img src={imagePath(profile.portrait)} alt="" />Email me <span aria-hidden="true">↗</span>
          </motion.a>
        </Reveal>
        <PointerSurface className="hero-art" strength={4} aria-label="Selected design work">
          <motion.div className="hero-project hero-project-back" whileHover={reducedMotion ? undefined : { x: 7, y: -9, rotate: 11 }}>
            <img className="hero-graphic" src={imagePath("Graphics/15.png")} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </motion.div>
          <motion.div className="hero-project hero-project-front" whileHover={reducedMotion ? undefined : { y: -8, rotate: 2 }}>
            <img className="hero-graphic" src={imagePath("Graphics/1.png")} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </motion.div>
          <span className="art-note">Selected work · UI/UX &amp; front-end</span>
        </PointerSurface>
      </section>

      <section className="trust-row skills-row section-pad" id="skills" aria-label="Tools and Technologies">
        <div className="trust-rating"><span>Tools and Technologies</span></div>
        <div className="skills-marquee" aria-label={profile.skillGroups.flatMap((group) => group.items).join(", ")}>
          <div className="skills-track">
            {[0, 1].map((copy) => (
              <div className="skills-track-set" key={copy} aria-hidden={copy === 1}>
                {profile.skillGroups.flatMap((group) => group.items).map((skill) => <SkillLogo key={`${copy}-${skill}`} skill={skill} />)}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-pad" id="work">
        <SectionHeading eyebrow="A selection of my work" title="Featured work" link="View all work" to="/work" />
        <div className="project-grid">{portfolio.projects.filter((project) => project.featured).map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
      </section>


      <section className="about-section section-pad" id="about">
        <motion.div className="about-portrait" initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <motion.img src={imagePath(profile.portrait)} alt={`Portrait of ${profile.name}`} loading="lazy" whileHover={reducedMotion ? undefined : { scale: 1.04 }} transition={{ duration: 0.7 }} />
          <span>Good work, made together.</span>
        </motion.div>
        <Reveal className="about-copy">
          <p className="eyebrow">A little about me</p><h2>Design with a point of view.<br />And both feet on the ground.</h2>
          <p>I’m {profile.name}, an aspiring UI/UX designer based in the {profile.location}. I’m studying for a {profile.education}. {profile.about}</p>
          <a className="text-link" href={getGmailUrl({ to: profile.email, subject: "Hello Trisha" })} target="_blank" rel="noreferrer">A bit more about me <span aria-hidden="true">↗</span></a>
        </Reveal>
      </section>

      <section className="section section-pad pricing-section">
        <SectionHeading eyebrow="Currently studying" title="Information technology." description="I'm pursuing a Bachelor of Science in Information Technology in the Philippines." />
        <div className="price-grid education-grid">
          <motion.article className="price-panel" whileHover={reducedMotion ? undefined : { y: -5 }} transition={{ duration: 0.3 }}>
            <span className="price-label">My focus</span><h3>Designing useful interfaces.</h3><p>I'm growing my UI/UX design skills and learning how thoughtful visual choices can make digital products easier to use.</p>
            <a className="button button-outline" href={getGmailUrl({ to: profile.email, subject: "Saying hello" })} target="_blank" rel="noreferrer">Say hello <span aria-hidden="true">↗</span></a>
          </motion.article>
          <motion.article className="price-panel price-panel-dark" whileHover={reducedMotion ? undefined : { y: -5 }} transition={{ duration: 0.3 }}>
            <span className="price-label">My toolkit</span><h3>Design, code, and video.</h3><p>Figma · Canva · CapCut · HTML · CSS · JavaScript · Expo Go · React · React Native</p>
            <a className="button button-light" href={getGmailUrl({ to: profile.email, subject: "Get in touch" })} target="_blank" rel="noreferrer">Get in touch <span aria-hidden="true">↗</span></a>
          </motion.article>
        </div>
      </section>

      <Reveal className="quote-section section-pad" as="section">
        <p className="eyebrow">My approach</p><blockquote>“I’m learning to bring design and technology together, one thoughtful interface at a time.”</blockquote>
        <p className="quote-credit">{profile.name} <span>·</span> {profile.role}</p>
      </Reveal>

      <section className="section section-pad blog-section">
        <SectionHeading eyebrow="Notes from the process" title="Ideas worth sharing." link="All notes" to="/blog" />
        <div className="article-grid">{featuredArticles.map((article, index) => <ArticleCard key={article.slug} article={article} index={index} />)}</div>
      </section>

      <section className="contact-band section-pad">
        <Reveal><p className="eyebrow">Have something good in mind?</p><h2>Let's make it<br />matter.</h2></Reveal>
        <motion.a className="button button-dark" href={getGmailUrl({ to: profile.email, subject: "Let's connect" })} target="_blank" rel="noreferrer" whileHover={reducedMotion ? undefined : { y: -3 }} whileTap={reducedMotion ? undefined : { scale: 0.97 }}>Start a conversation <span aria-hidden="true">↗</span></motion.a>
      </section>
    </>
  );
}

function PricePanel({ dark = false, label, title, description, email, subject, action }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.article className={`price-panel${dark ? " price-panel-dark" : ""}`} whileHover={reducedMotion ? undefined : { y: -5 }} transition={{ duration: 0.3 }}>
      <span className="price-label">{label}</span><h3>{title}</h3><p>{description}</p>
      <motion.a className={`button ${dark ? "button-light" : "button-outline"}`} href={getGmailUrl({ to: email, subject })} target="_blank" rel="noreferrer" whileHover={reducedMotion ? undefined : { x: 3 }}>
        {action} <span aria-hidden="true">↗</span>
      </motion.a>
    </motion.article>
  );
}

function WorkPage() {
  const [activeCategory, setActiveCategory] = useState("All work");
  const categories = ["All work", ...new Set(portfolio.projects.map((project) => project.category))];
  const visibleProjects = activeCategory === "All work"
    ? portfolio.projects
    : portfolio.projects.filter((project) => project.category === activeCategory);

  return (
    <>
      <section className="page-intro section-pad">
        <Reveal><p className="eyebrow">Design · development · visual storytelling</p><h1>My work,<br /><span>in its own categories.</span></h1><p>Browse my UI/UX projects, social media posts, group chat icons, front-end development, and video edits.</p></Reveal>
      </section>
      <section className="section section-pad page-list">
        <div className="work-filters" role="group" aria-label="Filter work by category">
          {categories.map((category) => (
            <button
              className={`work-filter${activeCategory === category ? " is-active" : ""}`}
              type="button"
              key={category}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="project-grid">{visibleProjects.map((project, index) => <ProjectCard key={project.slug} project={project} index={index} />)}</div>
      </section>
      <section className="contact-band section-pad"><div><p className="eyebrow">Next up could be yours</p><h2>Have a challenge<br />worth solving?</h2></div><a className="button button-dark" href={getGmailUrl({ to: portfolio.profile.email, subject: "Let's collaborate" })} target="_blank" rel="noreferrer">Let's talk <span aria-hidden="true">↗</span></a></section>
    </>
  );
}

function BlogPage() {
  return (
    <>
      <section className="page-intro section-pad"><Reveal><p className="eyebrow">Notes, ideas, and useful questions</p><h1>Design is a<br /><span>team sport.</span></h1><p>Thoughts on making better work, working better together, and keeping the human in the experience.</p></Reveal></section>
      <section className="section section-pad page-list"><div className="article-grid article-grid-wide">{portfolio.articles.map((article, index) => <ArticleCard key={article.slug} article={article} index={index} />)}</div></section>
    </>
  );
}

function ProjectPage() {
  const { slug } = useParams();
  const project = portfolio.projects.find((item) => item.slug === slug && item.overview);
  const related = portfolio.projects.filter((item) => item.overview && item.slug !== project?.slug).slice(0, 3);

  useEffect(() => {
    document.title = project ? `${project.name} | ${portfolio.profile.name}` : `Project not found | ${portfolio.profile.name}`;
  }, [project]);

  if (!project) {
    return (
      <section className="page-intro section-pad">
        <Reveal>
          <p className="eyebrow">Project not found</p>
          <h1>This project<br /><span>isn’t available.</span></h1>
          <Link className="text-link" to="/work">Back to all projects <span aria-hidden="true">↗</span></Link>
        </Reveal>
      </section>
    );
  }

  return (
    <>
      <section className="case-intro section-pad">
        <Link className="back-link" to="/work">← All projects</Link>
        <p className="eyebrow">{project.category} · {project.timeline}</p>
        <h1>{project.title}</h1>
        <div className="case-facts">
          <span><small>Timeline</small>{project.timeline}</span>
          <span><small>Role</small>{project.role}</span>
        </div>
      </section>
      {project.youtubeUrl ? (
        <div className="case-cover video-case-cover youtube-case-cover">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${project.youtubeId || getYouTubeId(project.youtubeUrl)}`}
            title={project.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
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
      ) : null}
      <section className="case-overview section-pad">
        <div>
          <p className="eyebrow">Project overview</p>
          <p className="case-summary">{project.overview}</p>
        </div>
        {(project.youtubeUrl || project.externalUrl || project.figmaUrl) && (
          <a
            className="button button-dark case-preview-button"
            href={project.youtubeUrl ?? project.externalUrl ?? project.figmaUrl}
            target="_blank"
            rel="noreferrer"
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
      <section className="section section-pad">
        <SectionHeading eyebrow="Keep looking" title="More selected work" />
        <div className="project-grid">{related.map((item, index) => <ProjectCard key={item.slug} project={item} index={index} />)}</div>
      </section>
    </>
  );
}

function ArticlePage() {
  const { slug } = useParams();
  const article = portfolio.articles.find((item) => item.slug === slug) ?? portfolio.articles[0];
  const related = portfolio.articles.filter((item) => item.slug !== article.slug).slice(0, 3);

  useEffect(() => { document.title = `${article.title} | ${portfolio.profile.name}`; }, [article]);

  return (
    <>
      <article className="article-page">
        <header className="article-header section-pad"><Link className="back-link" to="/blog">← All notes</Link><p className="eyebrow">{article.category} · {article.date}</p><h1>{article.title}</h1><p>{article.summary}</p></header>
        <motion.figure className="article-cover" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}><img src={imagePath(article.image)} alt="" fetchPriority="high" /></motion.figure>
        <div className="article-body"><p className="article-byline">Words by {portfolio.profile.name} <span>·</span> {article.date}</p>{article.paragraphs.map((paragraph, index) => <Reveal as="p" key={`${article.slug}-${index}`} delay={index * 0.04}>{paragraph}</Reveal>)}<p className="article-end">Thanks for reading.</p></div>
      </article>
      <section className="section section-pad"><SectionHeading eyebrow="Continue reading" title="More notes" /><div className="article-grid">{related.map((item, index) => <ArticleCard key={item.slug} article={item} index={index} />)}</div></section>
    </>
  );
}

function LegalPage() {
  const { document: documentType } = useParams();
  const isPrivacy = documentType !== "terms";
  const heading = isPrivacy ? "Privacy policy" : "Terms of use";
  const sections = isPrivacy
    ? [
      ["Information collected", "This portfolio is a static website. It does not run analytics or collect personal information through forms. If you contact me by email, your email application handles the information you choose to send."],
      ["External links", "Links to other websites are provided for convenience. Their privacy practices are governed by their own policies."],
      ["Contact", `Questions about this policy? Email ${portfolio.profile.email}.`]
    ]
    : [
      ["Portfolio content", "The writing, project descriptions, and visuals on this site are provided to show selected work. Please contact me before reproducing any material."],
      ["External websites", "Links to third-party websites are provided for reference. I am not responsible for their content or availability."],
      ["Contact", `Questions about these terms? Email ${portfolio.profile.email}.`]
    ];

  useEffect(() => { document.title = `${heading} | ${portfolio.profile.name}`; }, [heading]);

  return <section className="legal-page section-pad"><Link className="back-link" to="/">← Home</Link><p className="eyebrow">Last updated October 2026</p><h1>{heading}</h1>{sections.map(([title, text], index) => <Reveal as="section" key={title} delay={index * 0.06}><h2>{title}</h2><p>{text}</p></Reveal>)}</section>;
}

function AnimatedRoutes() {
  const location = useLocation();
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const pageTitle = {
      "/": `${portfolio.profile.name} | ${portfolio.profile.role}`,
      "/work": `Selected Work | ${portfolio.profile.name}`,
      "/blog": `Notes | ${portfolio.profile.name}`
    }[location.pathname];
    if (pageTitle) document.title = pageTitle;
  }, [location.pathname]);

  useEffect(() => {
    if (location.hash) {
      requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" }));
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [location.pathname, location.hash, reducedMotion]);

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
          <Route path="/" element={<HomePage />} />
          <Route path="/work" element={<WorkPage />} />
          <Route path="/work/:slug" element={<ProjectPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          <Route path="/legal/:document" element={<LegalPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function CustomCursor() {
  const reducedMotion = useReducedMotion();
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (reducedMotion || window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = -200;
    let mouseY = -200;
    let ringX = -200;
    let ringY = -200;
    let glowX = -200;
    let glowY = -200;
    let animId;

    const onPointerMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      setVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      const target = e.target;
      const isInteractive = target && (
        target.closest("a, button, input, textarea, select, details, [role='button'], .project-card, .article-card, .service-row, .work-filter")
      );
      setHovering(Boolean(isInteractive));
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    const animate = () => {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className={`cursor-container ${visible ? "is-visible" : ""} ${hovering ? "is-hovering" : ""}`} aria-hidden="true">
      <div className="cursor-glow" ref={glowRef} />
      <div className="cursor-ring" ref={ringRef} />
      <div className="cursor-dot" ref={dotRef} />
    </div>
  );
}

export default function App() {
  const { scrollY } = useScroll();
  const [showFloatingNav, setShowFloatingNav] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const location = useLocation();
  const openContact = useCallback(() => setContactOpen(true), []);
  const closeContact = useCallback(() => setContactOpen(false), []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const heroHeight = document.querySelector(".hero")?.getBoundingClientRect().height ?? 280;
    setShowFloatingNav(latest > heroHeight * 0.62);
  });

  useEffect(() => {
    const heroHeight = document.querySelector(".hero")?.getBoundingClientRect().height ?? 280;
    setShowFloatingNav(window.scrollY > heroHeight * 0.62);
  }, [location.pathname]);

  return (
    <div className="site-frame">
      <CustomCursor />
      <SiteHeader showFloatingNav={showFloatingNav} onContact={openContact} />
      <main id="app"><AnimatedRoutes /></main>
      <SiteFooter />
      <ScrollControls />
      {contactOpen && createPortal(<ContactDialog onClose={closeContact} />, document.body)}
    </div>
  );
}

function ContactDialog({ onClose }) {
  const profile = portfolio.profile;
  const [requestError, setRequestError] = useState("");
  const dialogRef = useRef(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    document.body.style.overflow = "hidden";
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const controls = [...dialogRef.current.querySelectorAll("button, input, textarea, select, a[href]")].filter((element) => !element.disabled);
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

  function sendRequest(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    if (!name || !email || !message) {
      setRequestError("Please fill in your name, email, and message.");
      return;
    }
    const gmailUrl = getGmailUrl({
      to: profile.email,
      subject: `Portfolio inquiry from ${name}`,
      body: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    });
    window.open(gmailUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

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
            <p>Fill out the form below or <a href={getGmailUrl({ to: profile.email })} target="_blank" rel="noreferrer">email me directly on Gmail</a>.</p>
          </div>
          <button className="contact-close" type="button" aria-label="Close contact form" onClick={onClose}>×</button>
        </div>
        <div className="contact-person">
          <img src={imagePath(profile.portrait)} alt="" />
          <div><strong>{profile.name}</strong><a href={getGmailUrl({ to: profile.email })} target="_blank" rel="noreferrer">{profile.email}</a></div>
        </div>
        <form className="contact-form" onSubmit={sendRequest}>
          <div className="contact-fields">
            <label>Name<input autoFocus autoComplete="name" name="name" placeholder="Your name" required /></label>
            <label>Email<input autoComplete="email" name="email" type="email" placeholder="you@example.com" required /></label>
          </div>
          <label>Send a message or describe your project<textarea name="message" rows="5" placeholder="What would you like to work on?" required /></label>
          {requestError && <p className="form-error" role="alert">{requestError}</p>}
          <button className="button button-dark contact-submit" type="submit">Send message <span aria-hidden="true">↗</span></button>
          <p className="contact-note">Submitting opens Gmail in a new tab with your message pre-filled to {profile.email}.</p>
        </form>
      </section>
    </div>
  );
}