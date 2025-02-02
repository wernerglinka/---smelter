
import { commonSectionFields } from './common-fields.js';
import * as pages from './pages/index.js';
import * as sections from './sections/index.js';
import * as blocks from './blocks/index.js';

export const templates = {
  'pageSimple': pages.pageSimple,
  'pageSections': pages.pageSections,
  'pageTestColumns': pages.pageTestColumns,
  'flexSection': { ...commonSectionFields, ...sections.flexSection },
  'audioSection': { ...commonSectionFields, ...sections.audioSection },
  'ctasSection': { ...commonSectionFields, ...sections.ctasSection },
  'iconSection': { ...commonSectionFields, ...sections.iconSection },
  'imageSection': { ...commonSectionFields, ...sections.imageSection },
  'leafletSection': { ...commonSectionFields, ...sections.leafletSection },
  'listSection': { ...commonSectionFields, ...sections.listSection },
  'lottieSection': { ...commonSectionFields, ...sections.lottieSection },
  'textSection': { ...commonSectionFields, ...sections.textSection },
  'videoSection': { ...commonSectionFields, ...sections.videoSection },
  'audio': blocks.audio,
  'ctas': blocks.ctas,
  'icon': blocks.icon,
  'image': blocks.image,
  'text': blocks.text,
  'video': blocks.video

  // ... other templates
};