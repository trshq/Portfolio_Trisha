const imageModules = import.meta.glob("../images/**/*", {
  eager: true,
  import: "default",
  query: "?url"
});

export function imagePath(filename) {
  if (!filename) return null;
  if (filename.startsWith("http://") || filename.startsWith("https://") || filename.startsWith("data:")) {
    return filename;
  }

  // Normalize slashes and strip leading paths if provided
  const clean = filename.replace(/\\/g, "/").replace(/^\.?\/?images\//, "").replace(/^\//, "");

  // Try direct relative key
  const directKey = `../images/${clean}`;
  if (imageModules[directKey]) {
    return imageModules[directKey];
  }

  // Try case-insensitive or basename match across all discovered modules
  const lowerClean = clean.toLowerCase();
  const basename = clean.split("/").pop()?.toLowerCase();

  for (const [key, val] of Object.entries(imageModules)) {
    const normKey = key.replace(/\\/g, "/").toLowerCase();
    if (normKey.endsWith(`/${lowerClean}`) || normKey === `../images/${lowerClean}`) {
      return val;
    }
    if (basename && normKey.endsWith(`/${basename}`)) {
      return val;
    }
  }

  return imageModules[directKey] ?? null;
}

// Intrinsic dimensions reserve space before the original artwork has downloaded.
// This is especially important for the natural-proportion gallery on mobile.
const artworkDimensions = {
  "gamay-preview.png": [824, 1834],
  "dsync-preview.png": [440, 956],
  "glamessence-preview.png": [1353, 911],
  "communitysync-preview.png": [860, 1864],
  "ACADEMIC ACHEIEVER.png": [2000, 2000],
  "CLASS OFFICERS.png": [2000, 2000],
  "EDSA.png": [1080, 1350],
  "TEACHERSDAY.png": [2000, 2000],
  "Graphic Officer.png": [2000, 2000],
  "PL.png": [2000, 2000],
  "2-CUdvKqvF.png": [2000, 2000],
  "3-Dan1Poki.png": [2000, 2000],
  "4-nq3UV07g.png": [2000, 2000],
  "5-aBoAyCGK.png": [2000, 2000],
  "LOGO-GC (1)-CgdLaKt5.jpg": [2000, 2000],
  "LOGO-GC (2)-DYjB7vwa.jpg": [2000, 2000],
  "LOGO-GC (2)-SVnKJ3uV.png": [2000, 2000],
  "Billie Delos Santos.png": [2970, 2970],
  "Francis Macalintal.png": [1080, 1350],
  "John Patrick Diaz.png": [1080, 1350],
  "Jonslogar Arenque.png": [2970, 2970],
  "Kevin Perez.png": [1080, 1350],
  "Leonardo Louie Ordoñez.png": [1080, 1350],
  "Micaela Santos.png": [1080, 1080],
  "TEASER .png": [1080, 1350],
  "TEASER 2.png": [1080, 1350]
};

export function imageSize(filename) {
  const basename = filename?.replace(/\\/g, "/").split("/").pop();
  const size = artworkDimensions[basename];
  return size ? { width: size[0], height: size[1] } : {};
}

export { imageModules };
