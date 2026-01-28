import React from 'react';
import { createStitches } from '@stitches/react';
import { indigo, slate, green, red, amber, blue, violet, gray } from '@radix-ui/colors';

export const { styled, css, globalCss, keyframes, getCssText, theme, createTheme, config } = createStitches({
  theme: {
    colors: {
      ...indigo,
      ...slate,
      ...green,
      ...red,
      ...amber,
      ...blue,
      ...violet,
      ...gray,
      // Alias para facilidad de uso
      primary: indigo.indigo9,
      primaryLight: indigo.indigo3,
      primaryDark: indigo.indigo11,
      success: green.green9,
      successLight: green.green3,
      danger: red.red9,
      dangerLight: red.red3,
      warning: amber.amber9,
      warningLight: amber.amber3,
      info: blue.blue9,
      infoLight: blue.blue3,
      bg: slate.slate1,
      bgSubtle: slate.slate2,
      border: slate.slate6,
      text: slate.slate12,
      textSubtle: slate.slate11,
    },
    space: {
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
    },
    fontSizes: {
      1: '12px',
      2: '14px',
      3: '16px',
      4: '18px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
    },
    fonts: {
      body: 'Inter, system-ui, -apple-system, Roboto, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    },
    fontWeights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      normal: 1.5,
      tight: 1.25,
      loose: 1.75,
    },
    radii: {
      1: '4px',
      2: '6px',
      3: '8px',
      4: '10px',
      5: '12px',
      round: '50%',
      pill: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    },
  },
  media: {
    mobile: '(max-width: 640px)',
    tablet: '(max-width: 768px)',
    laptop: '(max-width: 1024px)',
    desktop: '(min-width: 1025px)',
  },
  utils: {
    m: (value) => ({ margin: value }),
    mt: (value) => ({ marginTop: value }),
    mr: (value) => ({ marginRight: value }),
    mb: (value) => ({ marginBottom: value }),
    ml: (value) => ({ marginLeft: value }),
    mx: (value) => ({ marginLeft: value, marginRight: value }),
    my: (value) => ({ marginTop: value, marginBottom: value }),
    p: (value) => ({ padding: value }),
    pt: (value) => ({ paddingTop: value }),
    pr: (value) => ({ paddingRight: value }),
    pb: (value) => ({ paddingBottom: value }),
    pl: (value) => ({ paddingLeft: value }),
    px: (value) => ({ paddingLeft: value, paddingRight: value }),
    py: (value) => ({ paddingTop: value, paddingBottom: value }),
  },
});

// Componentes base reutilizables
export const Container = styled('div', {
  width: '100%',
  height: '100%',
  background: '$bg',
  minHeight: 'calc(100vh - 64px)',
  boxSizing: 'border-box',
  overflowY: 'auto',
  variants: {
    padded: {
      true: { padding: '$6' },
      false: { padding: 0 },
    },
  },
  defaultVariants: {
    padded: true,
  },
});

export const Box = styled('div', {
  boxSizing: 'border-box',
});

export const Flex = styled('div', {
  display: 'flex',
  boxSizing: 'border-box',
  variants: {
    direction: {
      row: { flexDirection: 'row' },
      column: { flexDirection: 'column' },
    },
    align: {
      start: { alignItems: 'flex-start' },
      center: { alignItems: 'center' },
      end: { alignItems: 'flex-end' },
      stretch: { alignItems: 'stretch' },
    },
    justify: {
      start: { justifyContent: 'flex-start' },
      center: { justifyContent: 'center' },
      end: { justifyContent: 'flex-end' },
      between: { justifyContent: 'space-between' },
    },
    wrap: {
      true: { flexWrap: 'wrap' },
      false: { flexWrap: 'nowrap' },
    },
    gap: {
      1: { gap: '$1' },
      2: { gap: '$2' },
      3: { gap: '$3' },
      4: { gap: '$4' },
      5: { gap: '$5' },
      6: { gap: '$6' },
    },
  },
  defaultVariants: {
    direction: 'row',
    align: 'stretch',
    justify: 'start',
    wrap: false,
  },
});

export const Grid = styled('div', {
  display: 'grid',
  boxSizing: 'border-box',
  variants: {
    columns: {
      1: { gridTemplateColumns: '1fr' },
      2: { gridTemplateColumns: 'repeat(2, 1fr)' },
      3: { gridTemplateColumns: 'repeat(3, 1fr)' },
      4: { gridTemplateColumns: 'repeat(4, 1fr)' },
      auto: { gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' },
    },
    gap: {
      1: { gap: '$1' },
      2: { gap: '$2' },
      3: { gap: '$3' },
      4: { gap: '$4' },
      5: { gap: '$5' },
      6: { gap: '$6' },
    },
  },
  defaultVariants: {
    columns: 'auto',
    gap: 4,
  },
});

export const Card = styled('div', {
  background: 'white',
  borderRadius: '$5',
  padding: '$5',
  boxShadow: '$base',
  transition: 'all 0.2s',
  border: '1px solid $border',
  boxSizing: 'border-box',
  '&:hover': {
    boxShadow: '$md',
    transform: 'translateY(-2px)',
  },
});

export const Button = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$3',
  padding: '$3 $4',
  fontSize: '$2',
  fontWeight: '$semibold',
  cursor: 'pointer',
  transition: 'all 0.2s',
  gap: '$2',
  boxSizing: 'border-box',
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  variants: {
    variant: {
      primary: {
        background: '$primary',
        color: 'white',
        '&:hover': { background: '$primaryDark' },
      },
      secondary: {
        background: '$slate3',
        color: '$text',
        '&:hover': { background: '$slate4' },
      },
      success: {
        background: '$success',
        color: 'white',
        '&:hover': { background: '$green10' },
      },
      danger: {
        background: '$danger',
        color: 'white',
        '&:hover': { background: '$red10' },
      },
      warning: {
        background: '$warning',
        color: 'white',
        '&:hover': { background: '$amber10' },
      },
      ghost: {
        background: 'transparent',
        color: '$text',
        '&:hover': { background: '$slate3' },
      },
      outline: {
        background: 'transparent',
        color: '$primary',
        border: '1px solid $primary',
        '&:hover': { background: '$primaryLight' },
      },
    },
    size: {
      sm: { padding: '$2 $3', fontSize: '$1' },
      md: { padding: '$3 $4', fontSize: '$2' },
      lg: { padding: '$4 $5', fontSize: '$3' },
    },
    fullWidth: {
      true: { width: '100%' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export const Input = styled('input', {
  all: 'unset',
  width: '100%',
  padding: '$3',
  borderRadius: '$3',
  border: '1px solid $border',
  fontSize: '$2',
  boxSizing: 'border-box',
  transition: 'all 0.2s',
  '&:focus': {
    borderColor: '$primary',
    boxShadow: '0 0 0 3px $primaryLight',
  },
  '&:disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export const Textarea = styled('textarea', {
  all: 'unset',
  width: '100%',
  padding: '$3',
  borderRadius: '$3',
  border: '1px solid $border',
  fontSize: '$2',
  boxSizing: 'border-box',
  minHeight: '100px',
  resize: 'vertical',
  fontFamily: '$body',
  transition: 'all 0.2s',
  '&:focus': {
    borderColor: '$primary',
    boxShadow: '0 0 0 3px $primaryLight',
  },
});

export const Label = styled('label', {
  fontSize: '$2',
  fontWeight: '$medium',
  color: '$text',
  marginBottom: '$2',
  display: 'block',
});

export const Text = styled('span', {
  fontFamily: '$body',
  color: '$text',
  variants: {
    size: {
      1: { fontSize: '$1' },
      2: { fontSize: '$2' },
      3: { fontSize: '$3' },
      4: { fontSize: '$4' },
      5: { fontSize: '$5' },
      6: { fontSize: '$6' },
    },
    weight: {
      normal: { fontWeight: '$normal' },
      medium: { fontWeight: '$medium' },
      semibold: { fontWeight: '$semibold' },
      bold: { fontWeight: '$bold' },
    },
    color: {
      default: { color: '$text' },
      subtle: { color: '$textSubtle' },
      primary: { color: '$primary' },
      success: { color: '$success' },
      danger: { color: '$danger' },
      warning: { color: '$warning' },
    },
  },
  defaultVariants: {
    size: 2,
    weight: 'normal',
    color: 'default',
  },
});

export const Heading = styled('h1', {
  fontFamily: '$body',
  color: '$text',
  fontWeight: '$bold',
  lineHeight: '$tight',
  margin: 0,
  variants: {
    size: {
      1: { fontSize: '$6' },
      2: { fontSize: '$7' },
      3: { fontSize: '$8' },
      4: { fontSize: '$9' },
    },
  },
  defaultVariants: {
    size: 2,
  },
});

export const IconWrapper = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '$4',
  variants: {
    size: {
      sm: { width: '32px', height: '32px', fontSize: '16px' },
      md: { width: '40px', height: '40px', fontSize: '20px' },
      lg: { width: '48px', height: '48px', fontSize: '24px' },
    },
    color: {
      primary: { background: '$primaryLight', color: '$primary' },
      success: { background: '$successLight', color: '$success' },
      warning: { background: '$warningLight', color: '$warning' },
      danger: { background: '$dangerLight', color: '$danger' },
      info: { background: '$infoLight', color: '$info' },
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'primary',
  },
});

export const Badge = styled('span', {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '$2',
  padding: '$1 $3',
  borderRadius: '$pill',
  fontSize: '$1',
  fontWeight: '$semibold',
  variants: {
    color: {
      primary: { background: '$primaryLight', color: '$primary' },
      blue: { background: '$blue3', color: '$blue11' },
      green: { background: '$green3', color: '$green11' },
      red: { background: '$red3', color: '$red11' },
      amber: { background: '$amber3', color: '$amber11' },
      slate: { background: '$slate3', color: '$slate11' },
      violet: { background: '$violet3', color: '$violet11' },
    },
    variant: {
      primary: { background: '$primaryLight', color: '$primary' },
      success: { background: '$successLight', color: '$success' },
      warning: { background: '$warningLight', color: '$warning' },
      danger: { background: '$dangerLight', color: '$danger' },
      neutral: { background: '$slate3', color: '$slate11' },
    },
  },
  defaultVariants: {
    color: 'slate',
  },
});

export const Separator = styled('div', {
  height: '1px',
  background: '$border',
  margin: '$4 0',
});

// Componentes de Dialog/Modal usando estilos consistentes
export const DialogOverlay = styled('div', {
  background: 'rgba(0, 0, 0, 0.5)',
  position: 'fixed',
  inset: 0,
  zIndex: 1000,
});

export const DialogContent = styled('div', {
  background: 'white',
  borderRadius: '$5',
  padding: '$6',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '500px',
  maxHeight: '85vh',
  overflowY: 'auto',
  zIndex: 1001,
  boxShadow: '$xl',
  boxSizing: 'border-box',
});

export const DialogTitle = styled('h2', {
  fontSize: '$5',
  fontWeight: '$bold',
  marginBottom: '$4',
  color: '$text',
  margin: 0,
});

export const DialogDescription = styled('p', {
  fontSize: '$2',
  color: '$textSubtle',
  marginBottom: '$4',
  lineHeight: '$normal',
});

// Componente Dialog wrapper
export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  
  return children;
}

// Global styles
export const globalStyles = globalCss({
  '*': {
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  'body': {
    fontFamily: '$body',
    backgroundColor: '$bg',
    color: '$text',
  },
});
