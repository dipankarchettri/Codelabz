import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import ZoomInIcon from "@mui/icons-material/ZoomIn";

/**
 * Renders the media files (images, videos, audio) attached to a tutorial.
 * Displayed on the public tutorial view page below the step content.
 *
 * @param {{ mediaFiles: Array<{name: string, url: string, type: string, thumbnail: string}> }} props
 */
const MediaGallery = ({ mediaFiles }) => {
  const [lightbox, setLightbox] = useState({ open: false, url: "", name: "" });

  if (!mediaFiles || mediaFiles.length === 0) return null;

  const images = mediaFiles.filter(m => m.type === "image");
  const videos = mediaFiles.filter(m => m.type === "video");
  const audios = mediaFiles.filter(m => m.type === "audio");

  return (
    <Box sx={{ mt: 3 }} data-testid="mediaGallery">
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        Media
      </Typography>

      {/* Images */}
      {images.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <ImageIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">Images</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {images.map((media, i) => (
              <Box
                key={i}
                data-testid="mediaGalleryImage"
                onClick={() => setLightbox({ open: true, url: media.url, name: media.name })}
                sx={{
                  position: "relative",
                  cursor: "zoom-in",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid #e0e0e0",
                  "& .zoom-hint": { opacity: 0 },
                  "&:hover .zoom-hint": { opacity: 1 }
                }}
              >
                <img
                  src={media.url}
                  alt={media.name}
                  style={{
                    width: "100%",
                    maxWidth: 560,
                    maxHeight: 360,
                    objectFit: "contain",
                    display: "block",
                    background: "#f5f5f5"
                  }}
                />
                {/* Hover overlay hint */}
                <Box
                  className="zoom-hint"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    maxWidth: 560,
                    background: "rgba(0,0,0,0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "opacity 0.2s"
                  }}
                >
                  <ZoomInIcon sx={{ color: "#fff", fontSize: 40 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ px: 1, py: 0.5 }}>
                  {media.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <VideocamIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">Videos</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {videos.map((media, i) => (
              <Box key={i}>
                <video
                  src={media.url}
                  controls
                  data-testid="mediaGalleryVideo"
                  style={{
                    width: "100%",
                    maxWidth: 560,
                    borderRadius: 8,
                    border: "1px solid #e0e0e0",
                    display: "block"
                  }}
                />
                <Typography variant="caption" color="text.secondary">{media.name}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Audio */}
      {audios.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <AudiotrackIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">Audio</Typography>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {audios.map((media, i) => (
              <Box key={i}>
                <audio
                  src={media.url}
                  controls
                  data-testid="mediaGalleryAudio"
                  style={{ width: "100%", maxWidth: 400 }}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  {media.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Lightbox Dialog */}
      <Dialog
        open={lightbox.open}
        onClose={() => setLightbox(s => ({ ...s, open: false }))}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { background: "#000", position: "relative" } }}
      >
        <IconButton
          onClick={() => setLightbox(s => ({ ...s, open: false }))}
          sx={{ position: "absolute", top: 8, right: 8, color: "#fff", zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 0, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}>
          <img
            src={lightbox.url}
            alt={lightbox.name}
            style={{
              maxWidth: "100%",
              maxHeight: "90vh",
              objectFit: "contain",
              display: "block"
            }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MediaGallery;
