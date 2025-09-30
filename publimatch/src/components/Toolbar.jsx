// src/components/Toolbar.jsx

import React from 'react';
import { IconButton, Box, FormControl, Select, MenuItem } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, StrikethroughS } from '@mui/icons-material';

const Toolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const getButtonSx = (format) => ({
    backgroundColor: editor.isActive(format) ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: 'white',
  });

  // --- VOLTANDO AOS COMANDOS SIMPLES E CORRETOS ---
  const handleFontSizeChange = (event) => {
    const value = event.target.value;
    if (value === 'normal') {
      editor.chain().focus().unsetFontSize().run();
    } else {
      editor.chain().focus().setFontSize(value).run();
    }
  };

  return (
    <Box sx={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        p: 1,
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)', 
    }}>
      <IconButton sx={getButtonSx('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <FormatBold />
      </IconButton>
      <IconButton sx={getButtonSx('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <FormatItalic />
      </IconButton>
      <IconButton sx={getButtonSx('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <FormatUnderlined />
      </IconButton>
      <IconButton sx={getButtonSx('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <StrikethroughS />
      </IconButton>

      <FormControl size="small" variant="standard" sx={{ minWidth: 120, ml: 1 }}>
        <Select
          value={editor.getAttributes('textStyle').fontSize || 'normal'}
          onChange={handleFontSizeChange}
          sx={{
            color: 'white',
            '& .MuiSelect-icon': { color: 'white' },
            '&:before, &:after': { borderBottom: 'none' },
            '&:hover:not(.Mui-disabled):before': { borderBottom: 'none !important' }
          }}
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="12px">Pequeno</MenuItem>
          <MenuItem value="18px">Médio</MenuItem>
          <MenuItem value="24px">Grande</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default Toolbar;