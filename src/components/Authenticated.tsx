import React, { createContext } from "react";

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/functions";

import createApi, { ApiContext } from "../api";

import FirebaseAuth from "react-firebaseui/FirebaseAuth";
import { AxiosInstance } from "axios";
import { IonImg, IonContent, IonPage, IonGrid, IonCol, IonRow } from "@ionic/react";

import Logo from "../assets/logo.svg";

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
        <IonPage>
          <IonContent>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonImg style={{ margin: "0 auto", maxWidth: "600px", height: "50vh" }} src={Logo}></IonImg>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <FirebaseAuth uiConfig={this.uiConfig} firebaseAuth={firebase.auth()} />
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonContent>
        </IonPage>
      );
    }

    return this.state.api ? (
      <ApiContext.Provider value={this.state.api}>{this.props.children}</ApiContext.Provider>
    ) : (
      <div>Logging In...</div>
    );
  }
}
