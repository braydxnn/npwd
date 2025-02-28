import React, { useEffect, useState } from 'react';
import {
  Slide,
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import useStyles from './modal.styles';
import useMessages from '../../hooks/useMessages';
import Conversation, { CONVERSATION_ELEMENT_ID } from './Conversation';
import MessageSkeletonList from './MessageSkeletonList';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useContactActions } from '../../../contacts/hooks/useContactActions';
import { Message, MessageEvents } from '../../../../../../typings/messages';
import Modal from '../../../../ui/components/Modal';
import { fetchNui } from '../../../../utils/fetchNui';
import { ServerPromiseResp } from '../../../../../../typings/common';
import { useSnackbar } from '../../../../ui/hooks/useSnackbar';
import { useMessageActions } from '../../hooks/useMessageActions';
import { useMessagesState } from '../../hooks/state';

const LARGE_HEADER_CHARS = 30;
const MAX_HEADER_CHARS = 80;
const MINIMUM_LOAD_TIME = 600;

// abandon all hope ye who enter here
export const MessageModal = () => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { addAlert } = useSnackbar();
  const history = useHistory();
  const { pathname } = useLocation();
  const { groupId } = useParams<{ groupId: string }>();
  const { activeMessageConversation, setActiveMessageConversation } = useMessages();

  const { getContactByNumber, getDisplayByNumber } = useContactActions();
  const [messages, setMessages] = useMessagesState();
  const { removeConversation } = useMessageActions();

  const [isLoaded, setLoaded] = useState(false);
  const [groupActionsOpen, setGroupActionsOpen] = useState(false);

  useEffect(() => {
    fetchNui<ServerPromiseResp<Message[]>>(MessageEvents.FETCH_MESSAGES, {
      conversationId: groupId,
      page: 0,
    }).then((resp) => {
      if (resp.status !== 'ok') {
        addAlert({
          message: t('APPS_MESSAGES_FETCHED_MESSAGES_FAILED'),
          type: 'error',
        });

        return history.push('/messages');
      }

      setMessages(resp.data);
    });
  }, [groupId, history, addAlert, t, setMessages]);

  useEffect(() => {
    if (activeMessageConversation && messages) {
      setTimeout(() => {
        setLoaded(true);
      }, MINIMUM_LOAD_TIME);
      return;
    }
    setLoaded(false);
  }, [activeMessageConversation, messages]);

  const closeModal = () => {
    setMessages(null);
    history.push('/messages');
  };

  useEffect(() => {
    if (!groupId) return;
    setActiveMessageConversation(groupId);
  }, [groupId, setActiveMessageConversation]);

  useEffect(() => {
    if (isLoaded) {
      const element = document.getElementById(CONVERSATION_ELEMENT_ID);
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    }
  }, [isLoaded]);

  // sends all unread messages
  // FIXME: Just make sure this is done properly
  /*useEffect(() => {
		if (activeMessageConversation?.conversation_id) {
			Nui.send(MessageEvents.SET_MESSAGE_READ, {
				groupId: activeMessageConversation.conversation_id,
			});
		}
	}, [activeMessageConversation, Nui]);*/

  // We need to wait for the active conversation to be set.
  if (!activeMessageConversation)
    return (
      <div>
        <CircularProgress />
      </div>
    );

  // don't allow too many characters, it takes too much room
  let header = activeMessageConversation.display || activeMessageConversation.phoneNumber;
  const truncatedHeader = `${header.slice(0, MAX_HEADER_CHARS).trim()}...`;
  header = header.length > MAX_HEADER_CHARS ? truncatedHeader : header;

  const headerClass =
    header.length > LARGE_HEADER_CHARS ? classes.largeGroupDisplay : classes.groupdisplay;

  const handleAddContact = (number) => {
    const exists = getContactByNumber(number);
    const referal = encodeURIComponent(pathname);
    if (exists) {
      return history.push(`/contacts/${exists.id}/?referal=${referal}`);
    }
    return history.push(`/contacts/-1/?addNumber=${number}&referal=${referal}`);
  };

  const handleDeleteConversation = () => {
    console.log('convo id', groupId);
    fetchNui<ServerPromiseResp<void>>(MessageEvents.DELETE_CONVERSATION, {
      conversationId: groupId,
    }).then((resp) => {
      if (resp.status !== 'ok') {
        return addAlert({
          message: t('APPS_MESSAGES_DELETE_CONVERSATION_FAILED'),
          type: 'error',
        });
      }

      history.push('/messages');
      removeConversation(groupId);
    });
  };

  const targetNumber = activeMessageConversation.phoneNumber;

  return (
    <div>
      <Modal visible={groupActionsOpen} handleClose={() => setGroupActionsOpen(false)}>
        <Box>
          <Button variant="contained" color="primary" onClick={handleDeleteConversation}>
            {t('APPS_MESSAGES_DELETE_CONVERSATION')}
          </Button>
        </Box>
      </Modal>
      <Slide direction="left" in={!!activeMessageConversation}>
        <Paper className={classes.modalRoot}>
          <div className={groupActionsOpen ? classes.backgroundModal : undefined} />
          <Paper className={classes.conversationHeader}>
            <Box display="flex" justifyContent="space-between">
              <Button onClick={closeModal}>
                <ArrowBackIcon fontSize="large" />
              </Button>
              <Typography variant="h5" className={headerClass}>
                {header}
              </Typography>
              <Tooltip
                classes={{ tooltip: classes.tooltip }}
                title={t('APPS_MESSAGES_ACTIONS_TITLE')}
                placement="left"
              >
                <IconButton onClick={() => setGroupActionsOpen(true)}>
                  <MoreVertIcon fontSize="large" />
                </IconButton>
              </Tooltip>
              {getDisplayByNumber(targetNumber) === targetNumber ? (
                <Button>
                  <PersonAddIcon onClick={() => handleAddContact(targetNumber)} fontSize="large" />
                </Button>
              ) : null}
            </Box>
          </Paper>
          {isLoaded && activeMessageConversation ? (
            <Conversation
              onClickDisplay={handleAddContact}
              messages={messages}
              activeMessageGroup={activeMessageConversation}
            />
          ) : (
            <MessageSkeletonList />
          )}
        </Paper>
      </Slide>
    </div>
  );
};
