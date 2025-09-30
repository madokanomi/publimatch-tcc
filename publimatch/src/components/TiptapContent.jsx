import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Box } from '@mui/material';

// Este componente recebe o conteúdo JSON como uma prop
const TiptapContent = ({ content }) => {
  const editor = useEditor({
    // 1. Torna o editor não editável
    editable: false, 
    // 2. Passa o conteúdo do seu banco de dados para o editor
    content: content,
    // 3. Inclui as mesmas extensões do editor para que ele saiba como renderizar a formatação
    extensions: [
      StarterKit.configure(),
      Underline,
      TextStyle,
      FontSize.configure({
        types: ['textStyle'],
      }),
    ],
  });

  return (
    <Box sx={{
        // Estilos para garantir que o texto tenha a aparência correta
        color: 'rgba(255, 255, 255, 0.9)',
        '& .ProseMirror': {
            padding: '0 !important', // Remove o padding padrão para se ajustar ao layout
            '& p': {
                margin: '0 0 1rem 0', // Adiciona um espaçamento entre parágrafos
            },
        },
    }}>
        <EditorContent editor={editor} />
    </Box>
  );
};

export default TiptapContent;