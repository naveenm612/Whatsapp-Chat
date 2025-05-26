import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";

interface LogoutDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const Dialogbox: React.FC<LogoutDialogProps> = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
        PaperProps={{
        style: {
          borderColor:'blue',
          boxShadow: "none",
          borderRadius: "6px",
          maxWidth: "0px",
          minWidth: "26%",
          margin:"0px",
          padding:"30px",
        }}}
    >
      <DialogTitle id="logout-dialog-title">Sign Out</DialogTitle>
      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          Are you sure you want to sign out?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#333333",
            color: "white",
            textTransform: "capitalize",
          }}
        >
          No
        </Button>
        <Button
          onClick={onConfirm}
          sx={{
            backgroundColor: "red",
            color: "white",
            textTransform: "capitalize",
          }}
          autoFocus
        >
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Dialogbox;
