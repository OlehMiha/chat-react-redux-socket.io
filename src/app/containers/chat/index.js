import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid/Grid';
import MessageArea from './components/messageArea';
import MembersMain from './components/membersMain';
import MessagesHistory from './components/messagesHistory';
import { changeChat, createChat, setDataAfterAuth, newMessage } from '../../../actions/socket';
import { preloaderStartAction, preloaderStopAction } from '../../../actions/common';

const io = require('socket.io-client');

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary
  },
  messagesHistory: {
    borderRight: '1px solid #ddd'
  },
  chat: {
    height: '100%'
  }
});

// TODO make config file and add domain
const SocketEndpoint = `http://${document.domain}:8080`;

const mapDispatchToProps = dispatch => ({
  setDataAfterAuth: data => dispatch(setDataAfterAuth(data)),
  preloaderStartAction: () => dispatch(preloaderStartAction()),
  preloaderStopAction: () => dispatch(preloaderStopAction()),
  changeChat: data => dispatch(changeChat(data)),
  createChat: data => dispatch(createChat(data)),
  newMessage: data => dispatch(newMessage(data))
});

function mapStateToProps(state) {
  return state.socket;
}

@connect(
  mapStateToProps,
  mapDispatchToProps
)
@withStyles(styles)
export default class Index extends Component {
  state = {
    isConnected: false,
    messages: [],
    activeChat: {},
    members: [],
    participatedChat: []
  };

  componentWillMount() {
    this.props.preloaderStartAction();
  }

  componentDidMount() {
    const token = localStorage.getItem('token');
    const socket = io(SocketEndpoint, {
      transportOptions: {
        polling: {
          extraHeaders: {
            Authorization: token
          }
        }
      }
    });

    // eslint-disable-next-line no-console
    socket.on('connect', () => {if (process.env.NODE_ENV === 'development') console.log('connect')});

    socket.on('auth', resData => {
      const data = resData;
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.log('auth', data.data);
      this.setState({ socket, isConnected: true });
      if (this.state.isConnected === true && this.state.socket) {
        data.data.socket = socket;
        this.props.setDataAfterAuth(data.data);
        this.props.preloaderStopAction();
      }
      // this.state.socket.emit('my event')
    });

    socket.on('chat:participated', data => {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.log('chat:participated', data.data);

      this.setState({
        participatedChat: data.data
      });
    });

    socket.on('user:all', data => {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.log('user:all', data.data);
      this.setState({ members: data.data });
    });

    socket.on('chat:message:history', data => {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.log('chat:message:history', data.data);

      this.setState({
        messages: data.data.messages,
        activeChat: data.data.chat
      });
    });

    socket.on('chat:message:new', data => {
      // eslint-disable-next-line no-console
      if (process.env.NODE_ENV === 'development') console.log('chat:message:new', data);
      if (data.chat.chat_id !== this.state.activeChat.chat_id) {
        // TODO добавить бадж о новом сообщении в неактивном чате
        return
      }

      const {messages} = this.state;

      messages.push(data.new_message);

      this.setState({
        messages,
      });
    });
  }

  componentWillUnmount() {
    this.setState({
      socket: null,
      isConnected: false
    });
  }

  createNewChat = users => {
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === 'development') console.log(users);
    this.props.createChat(users);
  };

  onChangeChat = chat => {
    if (chat.active === true) {
      return;
    }
    this.setState({
      messages: []
    });
    this.props.changeChat(chat.chat_id);
  };

  onNewMessage = message => {
    this.props.newMessage({message, activeChat: this.state.activeChat});
  };

  render() {
    const { classes } = this.props;

    return (
      <Grid
        className={`Chat  ${classes.chat}`}
        container
        spacing={24}
        direction="row"
        justify="flex-start"
        alignItems="stretch"
      >
        <Grid item xs={9} className={classes.messagesHistory}>
          <MessagesHistory
            messages={this.state.messages}
            activeChat={this.state.activeChat}
            user={this.props.user}
          />
        </Grid>
        <Grid item xs={3}>
          <MembersMain
            createNewChat={this.createNewChat}
            members={this.state.members}
            activeChat={this.state.activeChat}
            participatedChat={this.state.participatedChat}
            onChangeChat={this.onChangeChat}
          />
        </Grid>
          <MessageArea activeChat={this.state.chat} onNewMessage={this.onNewMessage}/>
      </Grid>
    );
  }
}
