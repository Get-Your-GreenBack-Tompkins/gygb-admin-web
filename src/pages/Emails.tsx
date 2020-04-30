import {
  IonContent,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonCardHeader,
  IonCardTitle
} from "@ionic/react";
import React, { useContext, useCallback, useEffect, useState } from "react";
import firebase from "firebase/app";

import { download } from "ionicons/icons";

import { ApiContext } from "../api";
import ErrorContent from "../components/ErrorContent";

const Emails: React.FC = () => {
  const [emails, setEmails] = useState();
  const [loadingError, setLoadingError] = useState(false);

  const api = useContext(ApiContext);

  const getEmails = useCallback(() => {
    setLoadingError(false);

    api
      .get("/user/emails/marketing/")
      .then(res => setEmails(res.data.emailList))
      .catch(err => {
        setLoadingError(true);
        console.log(err);
      });
  }, [api]);

  const downloadSpreadsheet = () => {
    const callable = firebase.functions().httpsCallable("marketingSpreadsheet", {});

    callable({})
      .then(result => {
        const url = result.data;

        window.open(url);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    getEmails();
  }, [getEmails]);

  if (loadingError) {
    return <ErrorContent name="Email List" reload={getEmails} />;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Email List Download</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>Download the entire marketing email list here!</IonCardContent>
          <IonItem>
            <IonButton
              onClick={() => {
                downloadSpreadsheet();
              }}
              fill="outline"
            >
              <IonLabel>Download</IonLabel>
              <IonIcon slot="start" icon={download}></IonIcon>
            </IonButton>
          </IonItem>
        </IonCard>
        <IonList>
          {emails &&
            Array.isArray(emails) &&
            emails.map((x: string, i) => (
              <IonItem key={i}>
                <IonLabel> {x} </IonLabel>
              </IonItem>
            ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Emails;
