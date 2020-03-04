import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import React from 'react';

const Home: React.FC = () => {

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Get Your Greenback Tompkins</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonButton routerLink="/emails/">Email List</IonButton>
        <IonButton routerLink="/quiz/">Edit Quiz</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
