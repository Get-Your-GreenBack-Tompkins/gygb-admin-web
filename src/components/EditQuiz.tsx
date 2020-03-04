import {
  IonIcon,
  IonButton,
  IonButtons,
  IonReorder,
  IonReorderGroup,
  IonItem,
  IonLabel,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonItemDivider,
  IonItemGroup,
  IonFab,
  IonFabButton,
  IonProgressBar
} from "@ionic/react";
import { ItemReorderEventDetail } from "@ionic/core";
import React, { useState, useEffect } from "react";
import { add, create, trash } from "ionicons/icons";

import api from "../api";
import EditQuestion from "./EditQuestion";

const EditQuiz: React.FC = () => {
  const [quiz, setQuiz] = useState();
  const [isOpen, setIsOpen] = useState(false);
  const [questionId, setQuestionId] = useState();
  const [editedQuestions, setEditedQuestions] = useState([] as any[]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  function doReorder(event: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log("Dragged from index", event.detail.from, "to", event.detail.to);

    const index = event.detail.to;
    const [removed] = editedQuestions.splice(event.detail.from, 1);
    setEditedQuestions([
      ...editedQuestions.slice(0, index),
      removed,
      ...editedQuestions.slice(index)
    ]);

    event.detail.complete();
  }

  function close(question: any) {
    setIsOpen(false);
    api.post(`quiz/web-client/question/${questionId}/edit`, question);
  }

  function editQuestion(question: any) {
    setQuestionId(question.id);
    setIsOpen(true);
  }

  function addQuestion() {
    api.put(`quiz/web-client/question/`).then(() => getQuestions());
  }

  function deleteQuestion(question: any) {
    api
      .delete(`quiz/web-client/question/${question.id}`)
      .then(() => getQuestions());
  }

  function getQuestions() {
    setLoadingQuestions(true);
    return api
      .get(`quiz/web-client`)
      .then(res => {
        setQuiz(res.data);
        setEditedQuestions([...res.data.questions]);
        setLoadingQuestions(false);
      })
      .catch(err => console.log(err));
  }

  useEffect(() => {
    if (!quiz) {
      getQuestions();
    }
  });

  if (!quiz) {
    return <div> Loading.. </div>;
  }

  return (
    <div>
      {loadingQuestions ? (
        <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar>
      ) : null}
      <IonFab vertical="bottom" horizontal="end" slot="fixed">
        <IonFabButton onClick={addQuestion}>
          <IonIcon icon={add}></IonIcon>
        </IonFabButton>
      </IonFab>
      <IonCard>
        <IonCardHeader>
          <IonLabel>{quiz.name}</IonLabel>
        </IonCardHeader>
        <IonCardContent>
          <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
            {editedQuestions.map((q: any, i: number) => (
              <IonItemGroup key={q.id}>
                <IonItemDivider>
                  <IonLabel>{`Question ${i + 1}`}</IonLabel>
                </IonItemDivider>
                <IonItem lines="none">
                  <IonReorder slot="start" />
                  <IonLabel>
                    <div dangerouslySetInnerHTML={{ __html: q.header }}></div>
                  </IonLabel>

                  <IonButtons slot="end">
                    <IonButton onClick={() => editQuestion(q)} fill="clear">
                      <IonIcon icon={create}></IonIcon>
                    </IonButton>
                    <IonButton onClick={() => deleteQuestion(q)} color="danger">
                      <IonIcon icon={trash}></IonIcon>
                    </IonButton>
                  </IonButtons>
                </IonItem>
              </IonItemGroup>
            ))}
            <EditQuestion
              questionId={questionId}
              isOpen={isOpen}
              close={question => close(question)}
            />
          </IonReorderGroup>
        </IonCardContent>
      </IonCard>
    </div>
  );
};

export default EditQuiz;
