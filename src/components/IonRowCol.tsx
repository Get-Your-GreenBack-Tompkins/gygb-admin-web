import React from "react";
import { IonCol, IonRow } from "@ionic/react";

export const IonRowCol: React.FC = props => (
  <IonRow>
    <IonCol>{props.children}</IonCol>
  </IonRow>
);
