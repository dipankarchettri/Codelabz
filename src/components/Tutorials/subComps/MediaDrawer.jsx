import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { LoadingOutlined } from "@ant-design/icons";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ImageIcon from "@mui/icons-material/Image";
import VideocamIcon from "@mui/icons-material/Videocam";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useFirebase, useFirestore } from "react-redux-firebase";
import { useDispatch, useSelector } from "react-redux";
import {
  clearTutorialMediaReducer,
  uploadTutorialMedia,
  removeTutorialMedia
} from "../../../store/actions";

const MediaTypeIcon = ({ type }) => {
  if (type === "image") return <ImageIcon fontSize="small" />;
  if (type === "video") return <VideocamIcon fontSize="small" />;
  if (type === "audio") return <AudiotrackIcon fontSize="small" />;
  return <InsertDriveFileIcon fontSize="small" />;
};

const MediaDrawer = ({ onClose, visible, owner, tutorial_id, mediaFiles }) => {
  const firebase = useFirebase();
  const firestore = useFirestore();
  const dispatch = useDispatch();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const uploading = useSelector(
    ({ tutorials: { images: { uploading } } }) => uploading
  );

  const uploading_error = useSelector(
    ({ tutorials: { images: { uploading_error } } }) => uploading_error
  );

  const deleting = useSelector(
    ({ tutorials: { images: { deleting } } }) => deleting
  );

  const deleting_error = useSelector(
    ({ tutorials: { images: { deleting_error } } }) => deleting_error
  );

  useEffect(() => {
    clearTutorialMediaReducer()(dispatch);
    return () => clearTutorialMediaReducer()(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (uploading === false && uploading_error === false) {
      setSnackbar({ open: true, message: "Media uploaded successfully!", severity: "success" });
    } else if (uploading === false && uploading_error) {
      setSnackbar({ open: true, message: String(uploading_error), severity: "error" });
    }
  }, [uploading, uploading_error]);

  useEffect(() => {
    if (deleting === false && deleting_error === false) {
      setSnackbar({ open: true, message: "Media deleted successfully!", severity: "success" });
    } else if (deleting === false && deleting_error) {
      setSnackbar({ open: true, message: String(deleting_error), severity: "error" });
    }
  }, [deleting, deleting_error]);

  const handleFileChange = e => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadTutorialMedia(owner, tutorial_id, files)(firebase, firestore, dispatch);
    }
  };

  const handleDelete = (name, url, type) => {
    removeTutorialMedia(owner, tutorial_id, name, url, type)(firebase, firestore, dispatch);
  };

  const handleCopyUrl = url => {
    navigator.clipboard.writeText(url);
    setSnackbar({ open: true, message: "URL copied to clipboard!", severity: "info" });
  };

  const renderPreview = media => {
    if (media.type === "image") {
      return (
        <img
          src={media.url}
          alt={media.name}
          style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 6 }}
        />
      );
    }
    if (media.type === "video") {
      return (
        <video
          src={media.url}
          controls
          style={{ width: "100%", maxHeight: 120, borderRadius: 6 }}
        />
      );
    }
    if (media.type === "audio") {
      return (
        <audio
          src={media.url}
          controls
          style={{ width: "100%" }}
        />
      );
    }
    return null;
  };

  return (
    <>
      <Drawer
        title="Media"
        data-testid="mediaDrawer"
        anchor="right"
        onClose={onClose}
        open={visible}
        style={{ position: "absolute" }}
        PaperProps={{ sx: { width: 400, p: 2 } }}
      >
        {/* Upload area */}
        <Grid sx={{ mb: 2 }}>
          <label htmlFor="media-upload" style={{ cursor: "pointer", display: "block" }}>
            <Grid
              sx={{
                border: "2px dashed #aaa",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                backgroundColor: "#fafafa",
                "&:hover": { borderColor: "#1976d2", backgroundColor: "#f0f7ff" }
              }}
            >
              {uploading ? (
                <>
                  <LoadingOutlined style={{ fontSize: 28 }} />
                  <p style={{ margin: "8px 0 0" }}>Uploading...</p>
                </>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 36, color: "text.secondary" }} />
                  <p style={{ margin: "8px 0 0", color: "#555" }}>
                    Click to upload image, video, or audio
                  </p>
                  <p style={{ fontSize: 12, color: "#888", margin: "4px 0 0" }}>
                    Supports: JPG, PNG, GIF, MP4, MOV, MP3, WAV, and more
                  </p>
                </>
              )}
            </Grid>
          </label>
          <input
            id="media-upload"
            type="file"
            accept="image/*,video/*,audio/*"
            multiple
            onChange={handleFileChange}
            style={{ display: "none" }}
            data-testid="mediaUploadInput"
          />
        </Grid>

        {/* Media list */}
        {mediaFiles && mediaFiles.length > 0 ? (
          mediaFiles.map((media, i) => (
            <Grid
              key={i}
              sx={{
                mb: 2,
                p: 1.5,
                border: "1px solid #e0e0e0",
                borderRadius: 2,
                backgroundColor: "#fff"
              }}
            >
              {renderPreview(media)}
              <Grid sx={{ display: "flex", alignItems: "center", mt: 1, gap: 0.5 }}>
                <MediaTypeIcon type={media.type} />
                <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {media.name}
                </span>
              </Grid>
              <Grid sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => handleCopyUrl(media.url)}
                >
                  Copy URL
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  disabled={deleting}
                  onClick={() => handleDelete(media.name, media.url, media.type)}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          ))
        ) : (
          !uploading && (
            <p style={{ color: "#aaa", textAlign: "center", marginTop: 24 }}>
              No media uploaded yet.
            </p>
          )
        )}
      </Drawer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MediaDrawer;
