// src/components/TiptapEditor.jsx

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
// --- 1. IMPORTE TextStyle E FontSize DO MESMO PACOTE ---
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Box } from '@mui/material';
import Toolbar from './Toolbar';

const TiptapEditor = ({ onContentChange, error }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline,
      // --- 2. CONFIGURE AS EXTENSÕES PARA TRABALHAREM JUNTAS ---
      TextStyle,
      FontSize.configure({
        types: ['textStyle'],
      }),
    ],
    editorProps: {
      attributes: {
        'data-placeholder': 'Digite aqui a descrição detalhada da sua campanha...',
      },
    },
    onUpdate: ({ editor }) => {
      onContentChange(editor.getJSON());
    },
  });

  return (
    <Box sx={{ 
        border: error ? '1px solid #d32f2f' : '1px solid rgba(255,255,255,0.1)', 
        borderRadius: '9px',
        overflow: 'hidden'
    }}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default TiptapEditor;