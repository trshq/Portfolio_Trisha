import { imagePath, imageSize } from "./assets.js";

export function ProjectDevicePreview({ project, index = 0 }) {
  const browser = project.previewDevice === "browser";
  const size = imageSize(project.previewImage);

  return <div
    className={`project-device project-device-${browser ? "browser" : "phone"}`}
    style={{
      ...(size.width ? { "--device-aspect": `${size.width} / ${size.height}` } : {}),
      "--device-tilt": browser ? "-3deg" : index % 2 ? "6deg" : "-6deg",
      "--device-hover-tilt": browser ? "-1deg" : index % 2 ? "2deg" : "-2deg"
    }}
    data-project={project.slug}
  >
    {browser ? <div className="device-browser-bar" aria-hidden="true">
      <span className="device-browser-dots"><i /><i /><i /></span>
      <span className="device-browser-address" />
    </div> : <span className="device-phone-speaker" aria-hidden="true" />}
    <div className="device-screen">
      <img
        src={imagePath(project.previewImage)}
        alt={`${project.name} ${browser ? "website screenshot in a desktop browser" : "app screenshot in a smartphone"}`}
        {...size}
        loading="lazy"
        decoding="async"
      />
    </div>
    {!browser && <span className="device-phone-home" aria-hidden="true" />}
  </div>;
}

export function ProjectLogoBanner({ project }) {
  return <figure className="case-cover case-logo-cover" data-project={project.slug} aria-label={`${project.name} project logo`}>
    <img src={imagePath(project.logo)} alt={`${project.name} project logo`} fetchPriority="high" decoding="async" />
    {project.logoNotice && <figcaption className="case-logo-notice">{project.logoNotice}</figcaption>}
  </figure>;
}
