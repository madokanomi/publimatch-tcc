import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Box } from '@mui/material';
import Toolbar from './Toolbar'; // Importa a barra de ferramentas

const TiptapEditor = ({ content, onContentChange, error, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure(),
      Underline,
      TextStyle,
      FontSize.configure({
        types: ['textStyle'],
      }),
    ],
    // Define o conteúdo inicial que vem da prop 'content'
    content: content || '', 
    editorProps: {
      attributes: {
        'data-placeholder': placeholder || 'Digite aqui...',
      },
    },
    // Função chamada toda vez que o conteúdo é alterado pelo usuário
    onUpdate: ({ editor }) => {
      onContentChange(editor.getJSON());
    },
  });

  // Este hook é a chave para a página de edição.
  // Ele "escuta" por mudanças na prop 'content' (que vem da API).
  useEffect(() => {
    if (editor && content) {
      // Compara o conteúdo atual do editor com o novo para evitar atualizações desnecessárias
      const isSame = JSON.stringify(editor.getJSON()) === JSON.stringify(content);
      
      // Se forem diferentes, atualiza o editor com o novo conteúdo
      if (!isSame) {
        // O 'false' no final evita que o 'onUpdate' seja disparado novamente, prevenindo um loop.
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  return (
    // A borda de erro e outros estilos são controlados pelo componente pai
    <Box>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </Box>
  );
};

export default TiptapEditor;