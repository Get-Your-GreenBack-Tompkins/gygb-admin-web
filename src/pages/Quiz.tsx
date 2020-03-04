import { IonContent, IonPage } from "@ionic/react";

import React from "react";

import EditQuiz from "../components/EditQuiz";

const Quiz: React.FC = () => {
  return (
    <IonPage>
      <IonContent>
        <EditQuiz></EditQuiz>
      </IonContent>
    </IonPage>
  );
};

export default Quiz;
