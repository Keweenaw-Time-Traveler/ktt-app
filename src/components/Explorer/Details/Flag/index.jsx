import React, { useState, useEffect } from 'react';
import axios from 'axios';
import $ from 'jquery';
//Config
import { Api } from '../../../../config/data';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
//Redux
import { useSelector } from 'react-redux';
import { selectHistoryMostRecent } from '../../../../redux/reducers/historySlice';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/pro-solid-svg-icons';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

const BootstrapDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

BootstrapDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired,
};

export default function Flag(props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);
  // id, recnumber, loctype, title, mapyear, x, y, markerid, type
  const details = useSelector(selectHistoryMostRecent);
  const { FLAG } = Api;

  const handleClickOpen = (recordID) => {
    console.log("Flagging " + recordID + " for review");
    let data = {
      id: recordID,
      action: "flag"
    };
    axios
      .post(FLAG, data)
      .then((res) => {
        console.log('FLAG RESULT', res);
        setOpen(true);
      })
      .catch((error) => {
        $('.MuiDialogContent-root p').text("We're Sorry but we encountered a technical difficulty while attempting to flag this story. Please try again later!")
        setOpen(true);
        console.log(error);
      });

  };
  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <button
        className="action-icon flag"
        onClick={() => handleClickOpen(details.id)}
      >
        <FontAwesomeIcon icon={faFlag} className="fa-icon" />
      </button>
      <BootstrapDialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          Submission Received
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Thank you for flagging this story. Your submission has been received and we will manually review the content as soon as we are able.
          </Typography>
        </DialogContent>
      </BootstrapDialog>
    </div>
  );
}
