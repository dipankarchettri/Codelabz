import React, { useState } from "react";
import PropTypes from "prop-types";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UserList from "../../Editor/UserList";
import { publishUnpublishTutorial } from "../../../store/actions";
import { useFirebase, useFirestore } from "react-redux-firebase";
import { useDispatch } from "react-redux";
import RemoveStepModal from "./RemoveStepModal";
import ColorPickerModal from "./ColorPickerModal";
import { Box, Stack } from "@mui/system";

const EditControls = ({
  isPublished,
  stepPanelVisible,
  isDesktop,
  setMode,
  noteID,
  mode,
  toggleImageDrawer,
  tutorial_id,
  toggleAddNewStep,
  owner,
  currentStep,
  step_length
}) => {
  const firebase = useFirebase();
  const firestore = useFirestore();
  const dispatch = useDispatch();

  // Breakpoints: We switch directly from Full to Compact at 1050px to prevent wrapping.
  const isCompact = useMediaQuery("(max-width:1050px)");

  const [viewRemoveStepModal, setViewRemoveStepModal] = useState(false);
  const [viewColorPickerModal, setViewColorPickerModal] = useState(false);
  const [publishLoad, setPublishLoad] = useState(false);

  const handlePublishTutorial = async () => {
    setPublishLoad(true);
    try {
      await publishUnpublishTutorial(owner, tutorial_id, isPublished)(
        firebase,
        firestore,
        dispatch
      );
    } catch (error) {
      console.error("Failed to publish/unpublish tutorial:", error);
    } finally {
      setPublishLoad(false);
    }
  };

  // ── Unified More Options Menu (⋮) ──────────────────────────────────────────
  const MoreOptionsMenu = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const handleOpen = e => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
      <>
        <Tooltip title="More Options" disableTouchListener>
          <IconButton
            size={isCompact ? "small" : "medium"}
            onClick={handleOpen}
            aria-label="more editor options"
            data-testid="more-options-menu-button"
            data-testId="dropdown-menu-button"
            sx={{
              bgcolor: anchorEl ? "action.selected" : "transparent",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "text.primary" }
            }}
          >
            <MoreVertIcon fontSize={isCompact ? "small" : "medium"} />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          data-testid="editor-dropdown-menu"
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            elevation: 3,
            sx: { mt: 1, minWidth: 180, borderRadius: 2 }
          }}
        >
          <MenuItem sx={{ py: 1.5 }}>
            <FormatAlignLeftIcon
              sx={{ mr: 1.5, color: "text.secondary" }}
              fontSize="small"
            />
            Edit Description
          </MenuItem>
          <MenuItem
            sx={{ py: 1.5 }}
            onClick={() => {
              setViewColorPickerModal(true);
              handleClose();
            }}
          >
            <FormatPaintIcon
              sx={{ mr: 1.5, color: "text.secondary" }}
              fontSize="small"
            />
            Edit CodeLabz Theme
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={() => null} sx={{ py: 1.5, color: "error.main" }}>
            <DeleteIcon sx={{ mr: 1.5 }} fontSize="small" />
            Move to Trash
          </MenuItem>
        </Menu>
      </>
    );
  };

  // The premium UI logic:
  // - Compact (< 1050px): Show left tools as clean IconButtons. Editor toggle + Publish on right. All in one row (nowrap).
  // - Full (>= 1050px): Show full buttons with text and icons.

  return (
    <>
      <Box
        sx={{
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1, sm: 1.5 },
          borderTop: "1px solid",
          borderBottom: "1px solid",
          borderColor: "grey.300",
          backgroundColor: "#ffffff"
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="nowrap"
          gap={{ xs: 1, sm: 2 }}
          sx={{ minHeight: 40 }}
        >
          {/* ── LEFT GROUP: STEP MANAGEMENT ── */}
          <Stack direction="row" alignItems="center" gap={{ xs: 0.5, sm: 1.5 }}>
            {/* ADD STEP */}
            {isCompact ? (
              <Tooltip title="Add Step" disableTouchListener>
                <IconButton
                  color="primary"
                  onClick={() => toggleAddNewStep()}
                  data-testid="addNewStep"
                  data-testId="addNewStep"
                  aria-label="Add step"
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "primary.main",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "primary.dark" }
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Add a new step" disableTouchListener>
                <Button
                  color="primary"
                  data-testid="addNewStep"
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    borderRadius: 1,
                    py: 0.75,
                    px: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                      transform: "translateY(-2px)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease"
                    }
                  }}
                  onClick={() => toggleAddNewStep()}
                  startIcon={<AddIcon />}
                >
                  Add Step
                </Button>
              </Tooltip>
            )}

            {/* ADD MEDIA */}
            {isCompact ? (
              <Tooltip title="Add Media" disableTouchListener>
                <IconButton
                  color="warning"
                  onClick={() => toggleImageDrawer()}
                  id="tutorialAddImg"
                  aria-label="Upload media"
                  size="small"
                  sx={{
                    color: "white",
                    bgcolor: "warning.main",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "warning.dark" }
                  }}
                >
                  <CloudUploadIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Upload Media" disableTouchListener>
                <Button
                  color="warning"
                  onClick={() => toggleImageDrawer()}
                  id="tutorialAddImg"
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    borderRadius: 1,
                    py: 0.75,
                    px: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                      transform: "translateY(-2px)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease"
                    }
                  }}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Media
                </Button>
              </Tooltip>
            )}

            {/* DELETE STEP */}
            <Tooltip
              title={
                step_length === 1
                  ? "Cannot delete the only step"
                  : "Delete Step"
              }
              disableTouchListener
            >
              <span>
                {isCompact ? (
                  <IconButton
                    color="error"
                    onClick={() => setViewRemoveStepModal(!viewRemoveStepModal)}
                    disabled={step_length === 1}
                    aria-label="Delete step"
                    size="small"
                    sx={{
                      color: "white",
                      bgcolor: "error.main",
                      borderRadius: 1,
                      "&:disabled": {
                        bgcolor: "action.disabled",
                        color: "white"
                      },
                      "&:hover": { bgcolor: "error.dark" }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <Button
                    color="error"
                    onClick={() => setViewRemoveStepModal(!viewRemoveStepModal)}
                    disabled={step_length === 1}
                    variant="contained"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      boxShadow: "none",
                      borderRadius: 1,
                      py: 0.75,
                      px: 2,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                        transform: "translateY(-2px)",
                        transition:
                          "transform 0.15s ease, box-shadow 0.15s ease"
                      }
                    }}
                    startIcon={<DeleteIcon />}
                  >
                    Delete Step
                  </Button>
                )}
                <RemoveStepModal
                  owner={owner}
                  tutorial_id={tutorial_id}
                  step_id={noteID}
                  viewModal={viewRemoveStepModal}
                  currentStep={currentStep}
                  step_length={step_length}
                />
              </span>
            </Tooltip>
          </Stack>

          {/* ── RIGHT GROUP: MODES, PUBLISH, OPTIONS ── */}
          {!isDesktop && stepPanelVisible ? null : (
            <Stack
              direction="row"
              alignItems="center"
              gap={{ xs: 0.5, sm: 1.5 }}
            >
              {mode === "edit" && !isCompact && (
                <Box sx={{ mr: 1 }}>
                  <UserList tutorial_id={tutorial_id} noteID={noteID} />
                </Box>
              )}

              {/* EDITOR / PREVIEW TOGGLE */}
              {mode === "view" ? (
                <Tooltip title="Switch to Editor" disableTouchListener>
                  {isCompact ? (
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={() => setMode("edit")}
                      data-testId="editorMode"
                      aria-label="Switch to edit mode"
                      sx={{
                        color: "white",
                        bgcolor: "secondary.main",
                        borderRadius: 1,
                        "&:hover": { bgcolor: "secondary.dark" }
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => setMode("edit")}
                      id="editorMode"
                      data-testId="editorMode"
                      startIcon={<EditIcon />}
                      variant="contained"
                      color="secondary"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "none",
                        borderRadius: 1,
                        py: 0.75,
                        px: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                          transform: "translateY(-2px)",
                          transition:
                            "transform 0.15s ease, box-shadow 0.15s ease"
                        }
                      }}
                    >
                      Edit Mode
                    </Button>
                  )}
                </Tooltip>
              ) : (
                <Tooltip title="Switch to Preview" disableTouchListener>
                  {isCompact ? (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => setMode("view")}
                      data-testId="previewMode"
                      aria-label="Switch to preview"
                      sx={{
                        color: "white",
                        bgcolor: "primary.main",
                        borderRadius: 1,
                        "&:hover": { bgcolor: "primary.dark" }
                      }}
                    >
                      <FileCopyIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Button
                      size="small"
                      onClick={() => setMode("view")}
                      data-testId="previewMode"
                      startIcon={<FileCopyIcon />}
                      variant="contained"
                      color="primary"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "none",
                        borderRadius: 1,
                        py: 0.75,
                        px: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                          transform: "translateY(-2px)",
                          transition:
                            "transform 0.15s ease, box-shadow 0.15s ease"
                        }
                      }}
                    >
                      Preview
                    </Button>
                  )}
                </Tooltip>
              )}

              {/* PUBLISH BUTTON */}
              <Tooltip
                title={
                  isPublished
                    ? "Unpublish this tutorial"
                    : "Publish this tutorial"
                }
                disableTouchListener
              >
                <span>
                  <Button
                    size="small"
                    onClick={handlePublishTutorial}
                    data-testid="publishTutorial"
                    data-testId="publishTutorial"
                    disabled={publishLoad}
                    variant={isPublished ? "outlined" : "contained"}
                    color={isPublished ? "error" : "success"}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: 1,
                      boxShadow: "none",
                      py: 0.75,
                      px: 2,
                      minWidth: { xs: "auto", sm: 100 },
                      "&:hover": {
                        boxShadow: "0 4px 12px rgba(0,0,0,0.18)",
                        transform: "translateY(-2px)",
                        transition:
                          "transform 0.15s ease, box-shadow 0.15s ease"
                      }
                    }}
                  >
                    {isPublished ? "Unpublish" : "Publish"}
                  </Button>
                </span>
              </Tooltip>

              {/* OPTIONS MENU */}
              <MoreOptionsMenu />
            </Stack>
          )}
        </Stack>
      </Box>

      <ColorPickerModal
        visible={viewColorPickerModal}
        visibleCallback={e => setViewColorPickerModal(e)}
        tutorial_id={tutorial_id}
        owner={owner}
      />
    </>
  );
};

export default EditControls;

EditControls.propTypes = {
  isPublished: PropTypes.bool,
  stepPanelVisible: PropTypes.bool,
  isDesktop: PropTypes.bool,
  setMode: PropTypes.func,
  noteID: PropTypes.string,
  mode: PropTypes.string,
  toggleImageDrawer: PropTypes.func,
  tutorial_id: PropTypes.string,
  toggleAddNewStep: PropTypes.func,
  owner: PropTypes.string,
  currentStep: PropTypes.number,
  step_length: PropTypes.number
};
