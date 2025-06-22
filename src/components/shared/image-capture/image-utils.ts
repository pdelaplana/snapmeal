export type AspectRatio = 'video' | 'square' | 'wide' | 'tall';

export const getAspectRatioClass = (aspectRatio: AspectRatio) => {
  switch (aspectRatio) {
    case 'square':
      return 'aspect-square';
    case 'wide':
      return 'aspect-[16/9]';
    case 'tall':
      return 'aspect-[3/4]';
    case 'video':
      return 'aspect-video';
    default:
      return 'aspect-video';
  }
};
