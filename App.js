import React from 'react';
import { connect, Provider } from 'react-redux';
import { BackHandler, Platform } from 'react-native';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import { AndroidBackHandler } from 'react-navigation-backhandler';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import SplashScreen from 'react-native-splash-screen';
import { Root, StyleProvider } from 'native-base';
import getTheme from './native-base-theme/components';
import commonTheme from './native-base-theme/variables/platform';
import AppNavigator from './components/AppNavigator';
import reducer from './components/reducers';
import { MenuProvider } from 'react-native-popup-menu';
import { localdata, clouddata } from './components/data';
import {
  initializeSetup,
  initializeLocale,
  refreshContactsThumbs
} from './components/actions';

if (Platform.OS == 'android') {
  // Reemplazar startsWith en Android
  // por bug detallado aqui
  // https://github.com/facebook/react-native/issues/11370
  String.prototype.startsWith = function(search) {
    'use strict';
    if (this == null) {
      throw TypeError();
    }
    var string = String(this);
    var pos = arguments.length > 1 ? Number(arguments[1]) || 0 : 0;
    var start = Math.min(Math.max(pos, 0), string.length);
    return string.indexOf(String(search), pos) === start;
  };
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { initialized: false };
  }

  componentDidMount() {
    this.props.init().then(() => {
      setTimeout(() => {
        this.setState({ initialized: true });
        SplashScreen.hide();
      }, 2500);
    });
  }

  onBackButtonPressAndroid() {
    return true;
  }

  render() {
    if (!this.state.initialized) {
      return null;
    }
    return (
      <AndroidBackHandler onBackPress={this.onBackButtonPressAndroid}>
        <StyleProvider style={getTheme(commonTheme)}>
          <Root>
            <MenuProvider backHandler={true}>
              <AppNavigator />
            </MenuProvider>
          </Root>
        </StyleProvider>
      </AndroidBackHandler>
    );
  }
}

const mapDispatchToProps = dispatch => {
  return {
    dispatch,
    init: () => {
      /* eslint-disable no-console */
      var promises = [];
      // Cargar configuracion
      var locale = 'default';
      promises.push(
        localdata
          .getBatchData([
            { key: 'settings' },
            { key: 'lists' },
            { key: 'contacts' },
            { key: 'lastCachesDirectoryPath' }
          ])
          .then(result => {
            var [settings, lists, contacts, lastCachesDirectoryPath] = result;
            locale = (settings && settings.locale) || 'default';
            dispatch(initializeSetup(settings, lists, contacts));
            // Forzar la actualizacion si estamos emulando
            if (DeviceInfo.isEmulator()) {
              lastCachesDirectoryPath = null;
            }
            dispatch(
              refreshContactsThumbs(
                lastCachesDirectoryPath,
                RNFS.CachesDirectoryPath
              )
            );
          })
          .catch(err => {
            console.log('error loading from localdata', err);
          })
          .finally(() => {
            dispatch(initializeLocale(locale));
          })
      );
      // Cargar listas desde iCloud
      promises.push(
        clouddata.load({ key: 'lists' }).then(res => {
          console.log('loaded from iCloud', res);
        })
      );
      return Promise.all(promises);
    }
  };
};

const ConnectedApp = connect(null, mapDispatchToProps)(App);

let store = createStore(reducer, applyMiddleware(thunk));

const AppWithReduxStore = () => {
  return (
    <Provider store={store}>
      <ConnectedApp />
    </Provider>
  );
};

export default AppWithReduxStore;
