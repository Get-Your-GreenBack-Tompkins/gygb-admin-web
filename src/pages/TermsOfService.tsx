import { IonContent, IonPage } from "@ionic/react";

import React from "react";

import EditTerms from "../components/EditTerms";

const Quiz: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <EditTerms></EditTerms>
      </IonContent>
    </IonPage>
  );
};

export default Quiz;
