import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel
} from "@ionic/react";
import React from "react";
import { useState } from "react";

import api from "../api";

const Home: React.FC = () => {
  const [emails, setEmails] = useState();

  const getEmails = () => {
    if (!emails) {
      api
        .get("/user/emails/marketing/")
        .then(res => setEmails(res.data.emailList));
    }
  };

  getEmails();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Get Your Greenback Tompkins</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {emails &&
            emails.map((x: string) => (
              <IonItem>
                {" "}
                <IonLabel> {x} </IonLabel>
              </IonItem>
            ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Home;
