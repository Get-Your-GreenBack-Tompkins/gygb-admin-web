import { IonContent, IonPage, IonList, IonItem, IonLabel } from "@ionic/react";
import React, { useContext, useCallback, useEffect } from "react";
import { useState } from "react";

import { ApiContext } from "../api";
import ErrorContent from "../components/ErrorContent";

const Home: React.FC = () => {
  const [emails, setEmails] = useState();
  const [loadingError, setLoadingError] = useState(false);

  const api = useContext(ApiContext);

  const getEmails = useCallback(() => {
    if (!emails) {
      api
        .get("/user/emails/marketing/")
        .then(res => setEmails(res.data.emailList))
        .catch(err => {
          setLoadingError(true);
          console.log(err);
        });
    }
  }, [api]);

  useEffect(() => {
    getEmails();
  }, [getEmails]);

  if (loadingError) {
    return <ErrorContent name="Email List" />;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
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

export default Home;
