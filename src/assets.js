const imageModules = import.meta.glob("../images/**/*", {
  eager: true,
  import: "default",
  query: "?url"
});

export function imagePath(filename) {
  return imageModules[`../images/${filename}`] ?? "";
}