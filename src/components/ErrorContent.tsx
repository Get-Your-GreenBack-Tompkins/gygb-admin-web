import React from "react";
import { IonRow, IonGrid, IonContent, IonCol, IonButton } from "@ionic/react";

export const ErrorContent: React.FC<{
  name: string;
  reload?: () => void;
}> = ({ name, reload }) => {
  return (
    <IonContent>
      <IonGrid>
        <IonRow>
          <IonCol>
            Error Loading {name}. Please reload the page or confirm with your system administrator the quiz
            server is running.
          </IonCol>
        </IonRow>
        {reload ? (
          <IonRow>
            <IonCol>
              <IonButton onClick={reload}>Reload Page</IonButton>
            </IonCol>
          </IonRow>
        ) : (
          <></>
        )}
      </IonGrid>
    </IonContent>
  );
};

export default ErrorContent;
