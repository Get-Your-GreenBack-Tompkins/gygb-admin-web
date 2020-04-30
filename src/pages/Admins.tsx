import {
  IonContent,
  IonCard,
  IonPage,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonInput,
  IonCardHeader,
  IonCardContent,
  IonCardTitle
} from "@ionic/react";
import React, { useContext, useCallback, useEffect } from "react";
import { useState } from "react";

import { trash } from "ionicons/icons";

import { ApiContext } from "../api";
import ErrorContent from "../components/ErrorContent";

const Admins: React.FC = () => {
  const [admins, setAdmins] = useState();
  const [email, setEmail] = useState("");
  const [loadingError, setLoadingError] = useState(false);

  const api = useContext(ApiContext);

  const getAdmins = useCallback(() => {
    setLoadingError(false);

    api
      .get("/admin/list/")
      .then(res => setAdmins(res.data.admins))
      .catch(err => {
        setLoadingError(true);
        console.log(err);
      });
  }, [api]);

  const deleteAdmin = useCallback(
    (email: string) => {
      api
        .delete(`/admin?email=${email}`)
        .then(_ => {
          return getAdmins();
        })
        .catch(err => {
          console.log(err);
          getAdmins();
        });
    },
    [api, getAdmins]
  );

  const addAdmin = useCallback(
    (email: string) => {
      api
        .put(`/admin?email=${email}`)
        .then(_ => {
          setEmail("");
          return getAdmins();
        })
        .catch(err => {
          alert(
            `Failed to add administrator: ${email}, make sure they've previously logged into the admin panel with this email.`
          );
          console.log(err);
          getAdmins();
        });
    },
    [api, getAdmins]
  );

  useEffect(() => {
    getAdmins();
  }, [getAdmins]);

  if (loadingError) {
    return <ErrorContent name="Admin List" reload={getAdmins} />;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonList>
          {admins &&
            Array.isArray(admins) &&
            admins.map((x: string, i) => (
              <IonItem key={i}>
                <IonLabel> {x} </IonLabel>
                <IonButton slot="end" onClick={() => deleteAdmin(x)} color="danger">
                  <IonIcon icon={trash}></IonIcon>
                </IonButton>
              </IonItem>
            ))}
        </IonList>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Add Admin</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Use this form to add additional administrators to the system. Administrators can log in to the
            HotShot iOS application and edit quiz content.
          </IonCardContent>
          <IonItem>
            <IonLabel position="floating">Enter Email</IonLabel>
            <IonInput
              value={email}
              onIonChange={event => {
                setEmail(event.detail.value || "");
              }}
            ></IonInput>
          </IonItem>
          <IonItem>
            <IonButton
              onClick={() => {
                addAdmin(email);
              }}
              fill="outline"
              slot="start"
            >
              Add Admin
            </IonButton>
          </IonItem>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Admins;
