import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel } from '@ionic/react';
import React from 'react';
import { useState } from 'react';
import * as axios from 'axios';

const Home: React.FC = () => {

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Get Your Greenback Tompkins</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">

      </IonContent>
    </IonPage>
  );
};

export default Home;