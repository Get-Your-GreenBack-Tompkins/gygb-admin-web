import React, { createContext } from "react";

import * as firebase from "firebase/app";
import "firebase/auth";

import createApi, { ApiContext } from "../api";

import FirebaseAuth from "react-firebaseui/FirebaseAuth";
import { AxiosInstance } from "axios";

const cfg = process.env.REACT_APP_FIREBASE_CONFIG;

if (!cfg) {
  throw new Error("Cannot load Firebase configuration.");
}

const firebaseConfig = JSON.parse(cfg);

firebase.initializeApp(firebaseConfig);

export const AuthContext = createContext<firebase.User | null>(null);

export interface LoginProps {}

export default class Authenticated extends React.Component<LoginProps> {
  state: { user: firebase.User | null; api: AxiosInstance | null } = {
    user: null,
    api: null
  };

  uiConfig = {
    signInFlow: "popup",
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    callbacks: {
      signInSuccessWithAuthResult: () => {
        return false;
      }
    }
  };

  unregisterAuthObserver!: firebase.Unsubscribe;

  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(user => {
      if (user) {
        user.getIdToken().then(idToken => {
          this.setState({ api: createApi(idToken) });
        });
      }

      this.setState({ user });
    });
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    if (!this.state.user || !this.state.api) {
      return (
        <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
      );
    }

    return this.state.api ? (
      <ApiContext.Provider value={this.state.api}>
        {this.props.children}
      </ApiContext.Provider>
    ) : (
      <div>Logging In...</div>
    );
  }
}
