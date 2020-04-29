import React from "react";
import { IonRow, IonGrid, IonContent, IonCol } from "@ionic/react";

export const ErrorContent: React.FC<{
  name: string;
}> = ({ name }) => {
  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            Error Loading {name}. Please reload the page or confirm with your system administrator the quiz
            server is running.
          </IonCol>
        </IonRow>
      </IonGrid>
    </IonContent>
  );
};

export default ErrorContent;
