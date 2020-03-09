import {
  IonContent,
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon
} from "@ionic/react";

import React, { createRef } from "react";

import EditQuiz from "../components/EditQuiz";
import { add } from "ionicons/icons";

const Quiz: React.FC = () => {
  const editQuiz = createRef<EditQuiz>();

  return (
    <IonPage>
      <IonContent>
        <EditQuiz ref={editQuiz}></EditQuiz>
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton
            onClick={() => editQuiz.current && editQuiz.current.addQuestion()}
          >
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Quiz;
