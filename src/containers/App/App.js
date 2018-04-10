import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { push } from 'react-router-redux';
import { renderRoutes } from 'react-router-config';
import { provideHooks } from 'redial';
import Helmet from 'react-helmet';
import { isLoaded as isInfoLoaded, load as loadInfo } from 'redux/modules/info';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from 'redux/modules/auth';
import { Notifs, InfoBar } from 'components';
import config from 'config';

@provideHooks({
  fetch: async ({ store: { dispatch, getState } }) => {
    if (!isAuthLoaded(getState())) {
      await dispatch(loadAuth()).catch(() => null);
    }
    if (!isInfoLoaded(getState())) {
      await dispatch(loadInfo()).catch(() => null);
    }
  }
})
@connect(
  state => ({
    notifs: state.notifs,
    user: state.auth.user
  }),
  { logout, pushState: push }
)
@withRouter
export default class App extends Component {
  static propTypes = {
    route: PropTypes.objectOf(PropTypes.any).isRequired,
    location: PropTypes.objectOf(PropTypes.any).isRequired,
    user: PropTypes.shape({
      email: PropTypes.string
    }),
    notifs: PropTypes.shape({
      global: PropTypes.array
    }).isRequired,
    logout: PropTypes.func.isRequired,
    pushState: PropTypes.func.isRequired
  };

  static defaultProps = {
    user: null
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (!this.props.user && nextProps.user) {
      // login
      const redirect = this.props.location.query && this.props.location.query.redirect;
      this.props.pushState(redirect || '/login-success');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/');
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0);
    }
  }

  handleLogout = event => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const { user, notifs, route } = this.props;
    const styles = require('./App.scss');

    return (
      <div className={styles.app}>
        <Helmet {...config.app.head} />
        <div>
          <div>
            <div>
              <div to="/" activeStyle={{ color: '#33e0ff' }} className={styles.title}>
                <div className={styles.brand}>
                  <span>{config.app.title}</span>
                </div>
              </div>
            </div>
            <div />
          </div>

          <div>
            <div>
              {user && (
                <div to="/chat-feathers">
                  <div>Chat with Feathers</div>
                </div>
              )}

              <div to="/chat">
                <div>Chat</div>
              </div>
              <div to="/widgets">
                <div>Widgets</div>
              </div>
              <div to="/survey">
                <div>Survey</div>
              </div>
              <div to="/about">
                <div>About Us</div>
              </div>

              {!user && (
                <div to="/login">
                  <div>Login</div>
                </div>
              )}
              {!user && (
                <div to="/register">
                  <div>Register</div>
                </div>
              )}
              {user && (
                <div to="/logout">
                  <div className="logout-link">Logout</div>
                </div>
              )}
            </div>
            {user && (
              <p className="navbar-text">
                Logged in as <strong>{user.email}</strong>.
              </p>
            )}
            <div>
              <div
                target="_blank"
                title="View on Github"
                href="https://github.com/bertho-zero/react-redux-universal-hot-example"
              >
                <i className="fa fa-github" />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.appContent}>
          {notifs.global && (
            <div className="container">
              <Notifs
                className={styles.notifs}
                namespace="global"
                NotifComponent={props => <div bsStyle={props.kind}>{props.message}</div>}
              />
            </div>
          )}

          {renderRoutes(route.routes)}
        </div>
        <InfoBar />

        <div className="well text-center">
          Have questions? Ask for help{' '}
          <a
            href="https://github.com/bertho-zero/react-redux-universal-hot-example/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            on Github
          </a>.
        </div>
      </div>
    );
  }
}
