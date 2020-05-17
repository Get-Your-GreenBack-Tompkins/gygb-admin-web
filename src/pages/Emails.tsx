import {
  IonContent,
  IonPage,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonCardHeader,
  IonCardTitle,
  IonProgressBar,
} from "@ionic/react";
import React, { useContext, useCallback, useEffect, useState } from "react";
import firebase from "firebase/app";

import { download } from "ionicons/icons";

import { ApiContext } from "../api";
import ErrorContent from "../components/ErrorContent";

const Emails: React.FC = () => {
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [emails, setEmails] = useState([] as string[]);
  const [loadingError, setLoadingError] = useState(false);

  const api = useContext(ApiContext);

  const getEmails = useCallback(() => {
    setLoadingError(false);

    api
      .get("/user/emails/marketing/")
      .then((res) => setEmails(res.data.emailList))
      .catch((err) => {
        setLoadingError(true);
        console.log(err);
      });
  }, [api]);

  const downloadSpreadsheet = () => {
    setLoadingInfo(true);
    const callable = firebase.functions().httpsCallable("marketing");
    callable({})
      .then((result) => {
        const url = result.data;

        window.open(url);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoadingInfo(false);
      });
  };

  useEffect(() => {
    getEmails();
  }, [getEmails]);

  if (loadingError) {
    return <ErrorContent name="Email List" reload={getEmails} />;
  }

  return (
    <IonPage>
      {loadingInfo ? <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar> : null}
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Email List Download</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Download the entire marketing email list here!{" "}
            {`You currently have ${emails.length} subscribers.`}
          </IonCardContent>
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
      </IonContent>
    </IonPage>
  );
};

export default Emails;
