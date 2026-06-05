const fs = require('fs');
const path = require('path');
const vm = require('vm');

const repoRoot = process.cwd();
const metadataPath = path.join(repoRoot, 'src', 'data', 'scholia-map', 'regionMetadata.js');
const metadataCode = fs.readFileSync(metadataPath, 'utf8');
const MUSIC_FILE_OVERRIDES = {
  'where things holy dwelt': 'Where Things Holy Dwelt_converted.mp3',
  'barren rendered': 'Barren Rendered(1).mp3',
};
const WORLD_MAP_MUSIC_FOLDER = path.join('src', 'assets', 'audio', 'World Map Music');

const context = { window: {} };
vm.createContext(context);
vm.runInContext(metadataCode, context);

const regions = context.window.SCHOLIA_REGION_METADATA || {};
const basePlaceholderImage = 'src/assets/images/the-map.png';

const report = {
  generatedAt: new Date().toISOString(),
  source: 'src/data/scholia-map/regionMetadata.js',
  strictAudit: {
    imageFiles: true,
    musicFiles: true,
  },
  summary: {
    totalRegions: 0,
    regionsWithAnyGap: 0,
    regionsWithPlaceholderSlots: 0,
    regionsWithMissingGalleryFiles: 0,
    regionsWithMissingMusicFiles: 0,
    regionsWithPendingMusic: 0,
    totalMissingGalleryFiles: 0,
    totalMissingMusicFiles: 0,
  },
  regions: [],
};

const normalizeSrc = (value) => String(value || '').trim().replace(/\\/g, '/');
const toMusicLookupKey = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\.[a-z0-9]+$/i, '')
  .replace(/[’']/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();
const toMusicFileName = (trackName) => {
  const key = toMusicLookupKey(trackName);
  return MUSIC_FILE_OVERRIDES[key] || `${trackName}.mp3`;
};
const getRegionTracks = (musicLabel) => {
  const raw = String(musicLabel || '').trim();
  if (!raw || /pending/i.test(raw)) return [];
  return raw
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

for (const [regionName, data] of Object.entries(regions)) {
  const gallery = Array.isArray(data.galleryImages) ? data.galleryImages : [];
  const mediaNeeds = Array.isArray(data.mediaNeeds) ? data.mediaNeeds : [];
  const musicLabel = String(data.musicLabel || '').trim();
  const isMusicPending = !musicLabel || /pending/i.test(musicLabel);
  const trackNames = getRegionTracks(musicLabel);

  const galleryAudit = gallery.map((entry, index) => {
    const rawSrc = typeof entry === 'string' ? entry : entry?.src;
    const src = normalizeSrc(rawSrc);
    const isPlaceholder = src === basePlaceholderImage;

    let exists = true;
    let resolvedPath = null;

    if (/^(https?:)?\/\//i.test(src) || src.startsWith('data:')) {
      resolvedPath = src;
      exists = true;
    } else if (src) {
      resolvedPath = path.join(repoRoot, src.replace(/^\/+/, '').replace(/\//g, path.sep));
      exists = fs.existsSync(resolvedPath);
    } else {
      exists = false;
    }

    return {
      index: index + 1,
      label: typeof entry === 'string' ? '' : String(entry?.label || ''),
      src,
      isPlaceholder,
      exists,
      resolvedPath,
    };
  });

  const placeholderSlots = galleryAudit.filter((slot) => slot.isPlaceholder);
  const missingFiles = galleryAudit.filter((slot) => !slot.exists);
  const musicAudit = trackNames.map((trackName, index) => {
    const fileName = toMusicFileName(trackName);
    const relativePath = normalizeSrc(path.join(WORLD_MAP_MUSIC_FOLDER, fileName));
    const resolvedPath = path.join(repoRoot, relativePath.replace(/\//g, path.sep));
    const exists = fs.existsSync(resolvedPath);
    return {
      index: index + 1,
      trackName,
      fileName,
      src: relativePath,
      exists,
      resolvedPath,
    };
  });
  const missingMusicFiles = musicAudit.filter((track) => !track.exists);

  const explicitNeeds = [...mediaNeeds];
  const computedNeeds = [];

  if (!galleryAudit.length) {
    computedNeeds.push('Add at least one region gallery image (currently empty).');
  }
  if (placeholderSlots.length) {
    computedNeeds.push(`Replace ${placeholderSlots.length} placeholder gallery slot(s).`);
  }
  if (missingFiles.length) {
    computedNeeds.push(`Fix ${missingFiles.length} missing gallery file reference(s).`);
  }
  if (missingMusicFiles.length) {
    computedNeeds.push(`Fix ${missingMusicFiles.length} missing mapped music file reference(s).`);
  }
  if (isMusicPending) {
    computedNeeds.push('Assign at least one mapped music track label for this region.');
  }

  const allNeeds = Array.from(new Set([...explicitNeeds, ...computedNeeds]));

  const regionRecord = {
    regionName,
    slug: data.slug || '',
    galleryCount: galleryAudit.length,
    musicLabel,
    musicPending: isMusicPending,
    placeholderSlots: placeholderSlots.map((slot) => ({ index: slot.index, src: slot.src, label: slot.label })),
    missingGalleryFiles: missingFiles.map((slot) => ({ index: slot.index, src: slot.src, label: slot.label })),
    missingMusicFiles: missingMusicFiles.map((track) => ({
      index: track.index,
      trackName: track.trackName,
      fileName: track.fileName,
      src: track.src,
    })),
    mediaNeedsExplicit: explicitNeeds,
    mediaNeedsComputed: computedNeeds,
    mediaNeedsCombined: allNeeds,
    galleryAudit,
    musicAudit,
    hasAnyGap: allNeeds.length > 0,
  };

  report.regions.push(regionRecord);

  report.summary.totalRegions += 1;
  if (regionRecord.hasAnyGap) report.summary.regionsWithAnyGap += 1;
  if (placeholderSlots.length) report.summary.regionsWithPlaceholderSlots += 1;
  if (missingFiles.length) report.summary.regionsWithMissingGalleryFiles += 1;
  if (missingMusicFiles.length) report.summary.regionsWithMissingMusicFiles += 1;
  if (isMusicPending) report.summary.regionsWithPendingMusic += 1;
  report.summary.totalMissingGalleryFiles += missingFiles.length;
  report.summary.totalMissingMusicFiles += missingMusicFiles.length;
}

report.regions.sort((a, b) => a.regionName.localeCompare(b.regionName));

const outJson = path.join(repoRoot, 'tools', 'atlas_media_gap_manifest.json');
fs.writeFileSync(outJson, JSON.stringify(report, null, 2));

const lines = [];
lines.push('# Atlas Media Gap Manifest');
lines.push('');
lines.push(`Generated: ${report.generatedAt}`);
lines.push(`Source: ${report.source}`);
lines.push('');
lines.push('## Summary');
lines.push(`- Total regions: ${report.summary.totalRegions}`);
lines.push(`- Regions with any gap/need: ${report.summary.regionsWithAnyGap}`);
lines.push(`- Regions with placeholder gallery slots: ${report.summary.regionsWithPlaceholderSlots}`);
lines.push(`- Regions with missing gallery files: ${report.summary.regionsWithMissingGalleryFiles}`);
lines.push(`- Regions with missing mapped music files: ${report.summary.regionsWithMissingMusicFiles}`);
lines.push(`- Regions with pending music: ${report.summary.regionsWithPendingMusic}`);
lines.push(`- Total missing gallery file refs: ${report.summary.totalMissingGalleryFiles}`);
lines.push(`- Total missing mapped music file refs: ${report.summary.totalMissingMusicFiles}`);
lines.push('');
lines.push('## Region Breakdown');
lines.push('');

for (const region of report.regions) {
  lines.push(`### ${region.regionName}`);
  lines.push(`- Slug: ${region.slug || '(none)'}`);
  lines.push(`- Gallery slots: ${region.galleryCount}`);
  lines.push(`- Music: ${region.musicLabel || 'Playlist pending'}`);
  lines.push(`- Placeholder slots: ${region.placeholderSlots.length}`);
  lines.push(`- Missing gallery files: ${region.missingGalleryFiles.length}`);
  lines.push(`- Missing mapped music files: ${region.missingMusicFiles.length}`);
  if (region.missingMusicFiles.length) {
    lines.push('- Missing mapped music entries:');
    for (const track of region.missingMusicFiles) {
      lines.push(`  - ${track.trackName} -> ${track.src}`);
    }
  }
  if (region.mediaNeedsCombined.length) {
    lines.push('- Needs:');
    for (const need of region.mediaNeedsCombined) {
      lines.push(`  - ${need}`);
    }
  } else {
    lines.push('- Needs: none currently flagged');
  }
  lines.push('');
}

const outMd = path.join(repoRoot, 'tools', 'atlas_media_gap_manifest.md');
fs.writeFileSync(outMd, lines.join('\n'));

console.log(`Wrote: ${path.relative(repoRoot, outJson)}`);
console.log(`Wrote: ${path.relative(repoRoot, outMd)}`);
console.log(`Regions analyzed: ${report.summary.totalRegions}`);
