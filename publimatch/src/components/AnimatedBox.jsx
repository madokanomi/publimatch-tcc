// src/components/AnimatedBox.jsx
import React from 'react';
import { Box } from '@mui/material';

// Este componente pega todas as props de um Box, mas também encaminha a ref
// para o elemento DOM subjacente, permitindo que componentes de transição funcionem.
const AnimatedBox = React.forwardRef((props, ref) => (
  <Box ref={ref} {...props}>
    {props.children}
  </Box>
));

export default AnimatedBox;