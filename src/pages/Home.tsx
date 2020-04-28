import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonRouterOutlet,
  IonLabel,
  IonSplitPane,
  IonMenu,
  IonIcon,
  IonItem,
  IonList,
  IonButton
} from "@ionic/react";
import React from "react";

import { mail, create } from "ionicons/icons";

import Emails from "./Emails";
import Questions from "./Quiz";
import Quiz from "./QuizInfo";
import ToS from "./TermsOfService";

import firebase from "firebase";

import { Route } from "react-router";

function signOut() {
  firebase.auth().signOut();
}

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start">Get Your GreenBack Tompkins</IonTitle>
          <IonButton onClick={signOut} slot="end" fill="clear">
            Log Out
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSplitPane contentId="main">
          {/*--  our side menu  --*/}
          <IonMenu contentId="main">
            <IonContent>
              <IonList>
                <IonItem routerLink="/quiz">
                  <IonIcon icon={create} slot="start"></IonIcon>
                  <IonLabel>Edit Quiz</IonLabel>
                </IonItem>
                <IonItem routerLink="/questions">
                  <IonIcon icon={create} slot="start"></IonIcon>
                  <IonLabel>Edit Questions</IonLabel>
                </IonItem>
                <IonItem routerLink="/tos">
                  <IonIcon icon={create} slot="start"></IonIcon>
                  <IonLabel>Edit Terms of Service</IonLabel>
                </IonItem>
                <IonItem routerLink="/emails">
                  <IonIcon icon={mail} slot="start"></IonIcon>
                  <IonLabel>Email List</IonLabel>
                </IonItem>
              </IonList>
            </IonContent>
          </IonMenu>
          <IonPage id="main">
            <IonRouterOutlet>
              <Route path="/emails" component={Emails} />
              <Route path="/questions" component={Questions} />
              <Route path="/quiz" component={Quiz} />
              <Route path="/tos" component={ToS} />
            </IonRouterOutlet>
          </IonPage>
        </IonSplitPane>
      </IonContent>
    </IonPage>
  );
};

export default Home;
