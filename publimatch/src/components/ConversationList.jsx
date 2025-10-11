import React from "react";
import { Typography } from "@mui/material"; // ✅ Importar Typography do MUI
import { motion, AnimatePresence } from "framer-motion"; // ✅ Importar do Framer Motion
import ConversationCard from "./ConversationCard.jsx"; // O card que você já tem

// As variantes de animação, se definidas aqui ou no componente pai.
const listVariants = {
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
  hidden: { opacity: 0 },
};

const ConversationList = ({ conversas, onPin, onConversationClick }) => {
  // A lógica para separar conversas fixadas e não fixadas permanece a mesma
  const pinnedConversas = conversas.filter((c) => c.pinned);
  const unpinnedConversas = conversas.filter((c) => !c.pinned);

  return (
    <motion.div variants={listVariants} initial="hidden" animate="visible">
      {/* Seção de Conversas Fixadas */}
      <AnimatePresence>
        {pinnedConversas.length > 0 && (
          <motion.div layout key="pinned-section" style={{ marginBottom: "16px" }}>
            {/* ✅ AJUSTE: Trocamos <h4> por <Typography> do MUI */}
            <Typography
              component="h4" // Mantém a semântica de um título de nível 4
              variant="overline" // Usa um estilo de variante de tema MUI
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
                mb: 1.5, // Equivalente a marginBottom: '12px'
                px: 1, // Um leve espaçamento lateral para alinhar melhor
                letterSpacing: "1px",
              }}
            >
              Fixadas ({pinnedConversas.length})
            </Typography>
            {pinnedConversas.map((c) => (
              <ConversationCard
                key={c.id}
                {...c}
                onPin={onPin}
                onClick={onConversationClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seção de Todas as Conversas */}
      <AnimatePresence>
        {unpinnedConversas.length > 0 && (
          <motion.div layout key="unpinned-section">
            {/* ✅ AJUSTE: Trocamos <h4> por <Typography> do MUI */}
            <Typography
              component="h4"
              variant="overline"
              sx={{
                color: "rgba(255,255,255,0.6)",
                fontWeight: 600,
                mb: 1.5,
                px: 1,
                letterSpacing: "1px",
              }}
            >
              Todas as conversas
            </Typography>
            {unpinnedConversas.map((c) => (
              <ConversationCard
                key={c.id}
                {...c}
                onPin={onPin}
                onClick={onConversationClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConversationList;