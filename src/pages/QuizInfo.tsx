import { IonContent, IonPage } from "@ionic/react";

import React from "react";

import EditQuizInfo from "../components/EditQuizInfo";

const Quiz: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <EditQuizInfo />
      </IonContent>
    </IonPage>
  );
};

export default Quiz;
