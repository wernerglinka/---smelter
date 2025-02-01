export const theme = {
  colors: {
    header: 'var(--header-color)',
    text: 'var(--text-color)',
    link: 'var(--link-color)',
    linkHover: 'var(--link-color-hover)',
    attention: 'var(--attention-color)',
    secondary: 'var(--secondary-color)',
    message: 'var(--message-color)',
    border: 'var(--border-color)',
    background: {
      page: 'var(--page-background)',
      info: 'var(--info-background)',
      error: 'var(--error-background-color)',
      whiteTransparent: 'var(--white-transparent)'
    }
  },
  typography: {
    fontFamily: 'var(--font-family)',
    sizes: {
      sm: 'var(--font-size-sm)',
      base: 'var(--font-size-base)',
      md: 'var(--font-size-md)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)',
      xxl: 'var(--font-size-xxl)',
      xxxl: 'var(--font-size-xxxl)'
    },
    lineHeight: {
      normal: 1.5,
      tight: 1.2
    }
  },
  layout: {
    titlebarHeight: 'var(--titlebar-height)',
    bodyPadding: 'var(--body-padding)',
    elementPadding: 'var(--element-padding)',
    borderRadius: 'var(--default-radius)'
  },
  effects: {
    dropShadow: 'var(--drop-shadow)',
    backdropBlur: 'blur(5px)'
  }
};
