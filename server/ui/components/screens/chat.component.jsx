'use client';

import React, {
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { write } from '../../services/connection.service';
import { subscribe as subscribeEvent } from '../../services/listener.service';
import styles from './chat.component.module.scss';

const EMPTY_STATE = Object.freeze({
  status: 'connecting',
  channel: '#salvation',
  topic: '',
  members: [],
  nickname: '',
  rooms: []
});

function normalizeState(value) {
  return {
    status: String(value?.status || EMPTY_STATE.status),
    channel: String(value?.channel || EMPTY_STATE.channel),
    topic: String(value?.topic || EMPTY_STATE.topic),
    nickname: String(value?.nickname || ''),
    rooms: Array.isArray(value?.rooms)
      ? value.rooms
        .map((room) => ({
          name: String(room?.name || ''),
          members: Math.max(0, Number(room?.members) || 0),
          topic: String(room?.topic || '')
        }))
        .filter((room) => room.name)
        .sort((left, right) => left.name.localeCompare(right.name))
      : [],
    members: [...new Set(Array.isArray(value?.members) ? value.members : [])].sort(
      (left, right) => left.localeCompare(right)
    )
  };
}

function normalizeMessage(value) {
  const message = String(value?.message || '').trim();
  const from = String(value?.from || '').trim();

  if (!message || !from) {
    return null;
  }

  return {
    id: String(value?.id || `${from}-${value?.sentAt || Date.now()}-${message}`),
    channel: String(value?.channel || EMPTY_STATE.channel),
    from,
    message,
    sentAt: String(value?.sentAt || new Date().toISOString())
  };
}

function appendUniqueMessage(currentMessages, candidate) {
  if (!candidate) {
    return currentMessages;
  }

  if (
    currentMessages.some((message) => {
      return (
        message.id === candidate.id ||
        (
          message.from === candidate.from &&
          message.message === candidate.message &&
          message.sentAt === candidate.sentAt
        )
      );
    })
  ) {
    return currentMessages;
  }

  return [...currentMessages, candidate].slice(-180);
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export default function ChatScreen() {
  const [chatState, setChatState] = useState(EMPTY_STATE);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [roomDraft, setRoomDraft] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [error, setError] = useState('');
  const transcriptRef = useRef(null);
  const deferredMemberSearch = useDeferredValue(memberSearch);
  const username =
    typeof window !== 'undefined' ? window.localStorage?.username || '' : '';

  useEffect(() => {
    const unsubscribers = [
      subscribeEvent('IRC_STATE', (event) => {
        setChatState(normalizeState(event));
        if (event?.status !== 'error') {
          setError('');
        }
      }),
      subscribeEvent('IRC_HISTORY', (event) => {
        const nextMessages = Array.isArray(event?.messages)
          ? event.messages.map(normalizeMessage).filter(Boolean)
          : [];
        setMessages(nextMessages.slice(-180));
      }),
      subscribeEvent('IRC_MESSAGE', (event) => {
        setMessages((currentMessages) =>
          appendUniqueMessage(currentMessages, normalizeMessage(event?.message))
        );
      }),
      subscribeEvent('IRC_ERROR', (event) => {
        setError(String(event?.message || 'Unable to reach chat.'));
      }),
      subscribeEvent('IRC_RESET', () => {
        setChatState(EMPTY_STATE);
        setMessages([]);
        setError('');
      })
    ];

    write({
      action: 'irc_sync'
    });
    write({
      action: 'irc_list_rooms'
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  useEffect(() => {
    const transcript = transcriptRef.current;
    if (!transcript) {
      return;
    }

    transcript.scrollTop = transcript.scrollHeight;
  }, [messages]);

  const filteredMembers = useMemo(() => {
    const search = deferredMemberSearch.trim().toLowerCase();

    if (!search) {
      return chatState.members;
    }

    return chatState.members.filter((member) =>
      member.toLowerCase().includes(search)
    );
  }, [chatState.members, deferredMemberSearch]);

  const connectionLabel =
    chatState.status === 'ready'
      ? 'Connected'
      : chatState.status === 'error'
        ? 'Error'
        : chatState.status === 'disconnected'
          ? 'Disconnected'
          : 'Connecting';

  function submitMessage() {
    const message = draft.trim();

    if (!message) {
      return;
    }

    write({
      action: 'irc_message',
      channel: chatState.channel,
      message
    });
    setDraft('');
  }

  function joinRoom(channel) {
    const nextChannel = String(channel || '').trim();
    if (!nextChannel) {
      return;
    }

    write({
      action: 'irc_join_room',
      channel: nextChannel
    });
    setError('');
  }

  function createRoom() {
    const nextChannel = roomDraft.trim();
    if (!nextChannel) {
      return;
    }

    write({
      action: 'irc_create_room',
      channel: nextChannel
    });
    setRoomDraft('');
    setError('');
  }

  return (
    <section className={styles.chatPage}>
      <div className={styles.chatShell}>
        <aside className={styles.channelRail}>
          <div className={styles.railBrand}>
            <h2>Chat</h2>
          </div>

          <div className={styles.channelList} aria-label='Available channels'>
            {chatState.rooms.length === 0 ? (
              <p className={styles.roomEmpty}>No rooms yet.</p>
            ) : (
              chatState.rooms.map((room) => (
                <button
                  key={room.name}
                  type='button'
                  className={styles.channelButton}
                  data-active={String(room.name === chatState.channel)}
                  onClick={() => joinRoom(room.name)}
                  title={room.name}
                >
                  <span className={styles.channelHash}>#</span>
                  <span className={styles.channelName}>
                    {room.name.replace(/^#/, '')}
                  </span>
                  <span className={styles.channelCount}>{room.members}</span>
                </button>
              ))
            )}
          </div>

          <div className={styles.roomComposer}>
            <label className={styles.composerLabel} htmlFor='chat-room-name'>
              Create room
            </label>
            <input
              id='chat-room-name'
              className={styles.roomInput}
              value={roomDraft}
              onChange={(event) => setRoomDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  createRoom();
                }
              }}
              placeholder='room-name'
            />
            <div className={styles.roomActions}>
              <button
                type='button'
                className={styles.syncButton}
                onClick={() =>
                  write({
                    action: 'irc_list_rooms'
                  })
                }
              >
                Refresh rooms
              </button>
              <button
                type='button'
                className={styles.sendButton}
                onClick={createRoom}
                disabled={!roomDraft.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </aside>

        <section className={styles.chatMain}>
          <div className={styles.chatHeader}>
            <div>
              <p className={styles.chatHeaderLabel}>{chatState.channel}</p>
              <h3 title={chatState.channel}>{chatState.channel}</h3>
            </div>
            <div className={styles.chatMeta}>
              <span>{chatState.members.length} online</span>
              <span className={styles.connectionPill} data-state={chatState.status}>
                {connectionLabel}
              </span>
              <button
                type='button'
                className={styles.syncButton}
                onClick={() => {
                  write({
                    action: 'irc_sync'
                  });
                  write({
                    action: 'irc_list_rooms'
                  });
                }}
              >
                Refresh
              </button>
            </div>
          </div>

          <div className={styles.transcript} ref={transcriptRef}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <strong>Nothing yet.</strong>
                <p>Join the channel and start the first message.</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = Boolean(
                  username && message.from.toLowerCase() === username.toLowerCase()
                );

                return (
                  <article
                    key={message.id}
                    className={styles.messageRow}
                    data-own={isOwnMessage}
                  >
                    <div className={styles.messageAvatar}>
                      {message.from.slice(0, 2).toUpperCase()}
                    </div>
                    <div className={styles.messageBody}>
                      <div className={styles.messageMeta}>
                        <strong>{message.from}</strong>
                        <time dateTime={message.sentAt}>{formatTime(message.sentAt)}</time>
                      </div>
                      <p>{message.message}</p>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className={styles.composer}>
            <label className={styles.composerLabel} htmlFor='chat-composer'>
              Message {chatState.channel}
            </label>
            <textarea
              id='chat-composer'
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  submitMessage();
                }
              }}
              placeholder='Type a message. Press Enter to send, Shift+Enter for a new line.'
              disabled={chatState.status !== 'ready'}
              rows={3}
            />
            <div className={styles.composerActions}>
              <p className={styles.composerHint}>
                {error || ''}
              </p>
              <button
                type='button'
                className={styles.sendButton}
                onClick={submitMessage}
                disabled={chatState.status !== 'ready' || !draft.trim()}
              >
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className={styles.memberRail}>
          <div className={styles.memberHeader}>
            <p className={styles.memberLabel}>Members</p>
            <strong>{chatState.members.length}</strong>
          </div>

          <input
            className={styles.memberSearch}
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
            placeholder='Filter members'
          />

          <div className={styles.memberList}>
            {filteredMembers.length === 0 ? (
              <p className={styles.memberEmpty}>No members match that filter.</p>
            ) : (
              filteredMembers.map((member) => {
                const isCurrentUser = Boolean(
                  username && member.toLowerCase() === username.toLowerCase()
                );

                return (
                  <div key={member} className={styles.memberRow}>
                    <span className={styles.memberPresence} />
                    <strong title={member}>
                      {isCurrentUser ? `${member} (You)` : member}
                    </strong>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
