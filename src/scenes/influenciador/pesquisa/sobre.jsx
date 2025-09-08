import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Avatar,
  Rating,
  Tabs,
  Tab,
  Chip,
  Card,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import PercentIcon from "@mui/icons-material/Percent";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

import { influencers } from "../../../data/mockInfluencer";

export default function InfluencerProfile() {
  const { id } = useParams();
  const influencer = useMemo(() => {
    if (!id) return influencers[0];
    return (
      influencers.find((i) => String(i.id) === String(id)) || influencers[0]
    );
  }, [id]);

  const [tab, setTab] = useState(0);

  const formatMillions = (v) => {
    const n = parseFloat(v);
    if (isNaN(n)) return v;
    return `${n}M`;
  };

  return (
    <Box p={3} sx={{ minHeight: "100vh"}}>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <Link to="/influenciador/pesquisa" style={{ textDecoration: "none" }}>
          <IconButton sx={{ color: "white" }}>
            <ArrowBackIosNewIcon />
          </IconButton>
        </Link>
        <Typography variant="h6" color="white">
          Perfil do Influenciador
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: 3,
          background: "linear-gradient(90deg, rgba(18,18,42,0.9), rgba(10,10,25,0.75))",
          color: "white",
          p: 3,
          position: "relative",
        }}
      >
        <Box
          sx={{
            height: 160,
            borderRadius: 2,
            background: influencer.bannerImage
              ? `url(${influencer.bannerImage}) center/cover no-repeat`
              : "linear-gradient(90deg,#2b1740,#3b1e63)",
            position: "relative",
          }}
        >
          <Chip
            label={`Agenciado por ${influencer.agency || "MediaLok"}`}
            sx={{ position: "absolute", top: 12, right: 12, bgcolor: "rgba(255,255,255,0.08)", color: "white" }}
          />
        </Box>

        <Box display="flex" gap={3} alignItems="flex-end" mt={-8}>
          <Avatar
            src={influencer.avatarImage}
            alt={influencer.nome}
            sx={{ width: 120, height: 120, border: "4px solid rgba(255,255,255,0.1)" }}
          />

          <Box flex={1}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" fontWeight={800} color="white">
                  {influencer.nome}
                </Typography>
                <Typography variant="subtitle2" color="rgba(255,255,255,0.7)">
                  {influencer.nomeReal && `${influencer.nomeReal} • `}
                  {influencer.idade ? `${influencer.idade} anos` : ""}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Rating value={influencer.avaliacao || 0} precision={0.1} readOnly size="small" sx={{ color: "gold" }} />
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">{influencer.avaliacao || "—"}</Typography>
                </Box>

                <Box display="flex" gap={1} mt={1}>
                  {(influencer.categorias || []).slice(0, 3).map((c, i) => (
                    <Chip key={i} label={c} size="small" sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "white" }} />
                  ))}
                </Box>
              </Box>

              <Box display="flex" gap={1} alignItems="center">
                <Button
                  variant="contained"
                  sx={{
                    background: "linear-gradient(90deg,#ff00d4,#ff7aa6)",
                    textTransform: "none",
                    px: 3,
                  }}
                >
                  Contratar
                </Button>

                <IconButton sx={{ color: "white" }}>
                  <MoreHorizIcon />
                </IconButton>
              </Box>
            </Box>

            <Box display="flex" gap={3} mt={3} alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <FavoriteBorderIcon />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{formatMillions(influencer.curtidas || "—")}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">Curtidas</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <VisibilityOutlinedIcon />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{formatMillions(influencer.visualizacoes || "—")}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">Visualizações</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <PeopleOutlineIcon />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{formatMillions(influencer.seguidores || "—")}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">Seguidores</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <PercentIcon />
                <Box>
                  <Typography variant="h6" fontWeight={700}>{influencer.engajamento || "—"}%</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.6)">Média de Conversão</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>

      <Box mt={4}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ "& button": { color: "white" } }}
        >
          <Tab label="Sobre" />
          <Tab label="Avaliações" />
          <Tab label="Campanhas" />
          <Tab label="Estatísticas" />
        </Tabs>

        {tab === 0 && (
          <Box mt={3}>
            <Typography variant="h5" color="white" gutterBottom>Sobre Mim</Typography>
            <Typography variant="body1" color="rgba(255,255,255,0.8)">
              {influencer.descricao || "Sem descrição disponível."}
            </Typography>
          </Box>
        )}

        {tab === 1 && (
          <Box mt={3}>
            <Typography variant="h6" color="white">Avaliações em breve...</Typography>
          </Box>
        )}

        {tab === 2 && (
          <Box mt={3}>
            <Typography variant="h6" color="white">Campanhas em breve...</Typography>
          </Box>
        )}

        {tab === 3 && (
          <Box mt={3}>
            <Typography variant="h6" color="white">Estatísticas em breve...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
