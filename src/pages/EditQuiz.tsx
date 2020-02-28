import { IonContent, IonIcon, IonButton, IonButtons, IonReorder, IonReorderGroup, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem, IonLabel } from '@ionic/react';
import { ItemReorderEventDetail } from '@ionic/core';
import React, { useState, useEffect } from 'react';
import { create, trash } from 'ionicons/icons';
import axios from 'axios';
import Question from '../components/Question';

const url = "http://localhost:5150";

function doReorder(event: CustomEvent<ItemReorderEventDetail>) {
  // The `from` and `to` properties contain the index of the item
  // when the drag started and ended, respectively
  console.log('Dragged from index', event.detail.from, 'to', event.detail.to);

  // Finish the reorder and position the item in the DOM based on
  // where the gesture ended. This method can also be called directly
  // by the reorder group
  event.detail.complete();
}



const EditQuiz: React.FC = () => {

  const [quiz, setQuiz] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [questionId, setQuestionId] = useState();

  function close(question: any) {
    setIsOpen(false);
    axios.post(`${url}/v1/quiz/web-client/question/${questionId}/edit`, question)
  }

  function editQuestion(question: any) {
    setQuestionId(question.id);
    setIsOpen(true);
  }

  useEffect(() => {
    if (!quiz) {
      axios.get(`${url}/v1/quiz/web-client`)
        .then(res => setQuiz(res.data))
        .catch(err => console.log(err));
    }
  });

  if (!quiz) {
    return <div> Loading.. </div>
  }

  return (
    <IonPage>
      <IonContent>
        {/*-- The reorder gesture is disabled by default, enable it to drag and drop items --*/}
        <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
          {
            quiz.questions.map((q: any) => (
              <IonItem key={q.id}>
                <IonReorder slot="start" />
                <IonLabel><div dangerouslySetInnerHTML={{ __html: q.header }}></div></IonLabel>

                <IonButtons slot="end">
                  <IonButton onClick={() => editQuestion(q)} fill="clear">
                    <IonIcon icon={create} ></IonIcon>
                  </IonButton>
                  <IonButton color="danger">
                    <IonIcon icon={trash}></IonIcon>
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))
          }
          <Question
            questionId={questionId}
            isOpen={isOpen}
            close={(question) => close(question)}
          />
        </IonReorderGroup>
      </IonContent>
    </IonPage>
  );
}

export default EditQuiz;