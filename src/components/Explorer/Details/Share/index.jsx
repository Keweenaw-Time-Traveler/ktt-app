import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
//Copy to clipboard: https://github.com/nkbt/react-copy-to-clipboard
import { CopyToClipboard } from 'react-copy-to-clipboard';
//Redux
import { useSelector } from 'react-redux';
import { selectHistoryMostRecent } from '../../../../redux/reducers/historySlice';
//Styles
import './styles.scss';
//Font Awesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShareAlt } from '@fortawesome/pro-solid-svg-icons';
import {
  faFacebookSquare,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
//React Share: https://www.npmjs.com/package/react-share
import { FacebookShareButton, TwitterShareButton } from 'react-share';

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

export default function Share(props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = useState('');
  const [copied, setCopied] = useState(false);
  // id, recnumber, loctype, title, mapyear, x, y, markerid, type
  const details = useSelector(selectHistoryMostRecent);
  const encodedTitle = !details ? '' : encodeURIComponent(details.historyname);
  const shareQuote = !details ? '' : `Share ${details.historyname}`;
  const shareUrl = !details
    ? ''
    : `http://localhost:3000/?id=${details.id}&recnumber=${details.recnumber}&loctype=${details.loctype}&title=${encodedTitle}&mapyear=${details.mapyear}&x=${details.x}&y=${details.y}&markerid=${details.markerid}&type=${details.type}`;

  useEffect(() => {
    setValue(shareUrl);
  }, [details]);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setCopied(false);
  };

  return (
    <div>
      <button
        className="action-icon share"
        variant="outlined"
        onClick={handleClickOpen}
      >
        <FontAwesomeIcon icon={faShareAlt} className="fa-icon" />
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
          Share this piece of history!
        </BootstrapDialogTitle>
        <DialogContent dividers>
          <Typography gutterBottom>
            Copy this URL and send it to your friends
          </Typography>
          <Typography gutterBottom>
            <textarea
              value={value}
              disabled={true}
              className="share-link-textarea"
              onChange={(e) => {
                setValue(e.target.value);
                setCopied(false);
              }}
            />
            {copied && (
              <div className="share-link-message">The link has been copied</div>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <CopyToClipboard
            options={{ debug: props.debug, message: '' }}
            text={value}
            onCopy={() => setCopied(true)}
          >
            <button className="share-link-button">Copy Link</button>
          </CopyToClipboard>
          <FacebookShareButton url={shareUrl} quote={shareQuote}>
            <button className="share-link-button">
              <FontAwesomeIcon icon={faFacebookSquare} className="fa-icon" />
            </button>
          </FacebookShareButton>
          <TwitterShareButton url={shareUrl} quote={shareQuote}>
            <button className="share-link-button">
              <FontAwesomeIcon icon={faTwitterSquare} className="fa-icon" />
            </button>
          </TwitterShareButton>
        </DialogActions>
      </BootstrapDialog>
    </div>
  );
}
