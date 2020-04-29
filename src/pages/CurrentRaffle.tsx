import { IonContent, IonPage } from "@ionic/react";

import React from "react";

import EditRaffle from "../components/EditRaffle";

const Raffle: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <EditRaffle></EditRaffle>
      </IonContent>
    </IonPage>
  );
};

export default Raffle;
