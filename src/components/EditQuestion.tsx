import React, { useState, useEffect, createRef, RefObject } from "react";
import {
  IonModal,
  IonButton,
  IonContent,
  IonLabel,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonReorder,
  IonReorderGroup,
  IonCheckbox,
  IonIcon,
  IonList
} from "@ionic/react";
import Delta from "quill-delta";
import { Delta as QuillDelta } from "quill";
import ReactQuill from "react-quill";

import api from "../api";
import { ItemReorderEventDetail } from "@ionic/core";
import { trash } from "ionicons/icons";

interface EditQuestionProps {
  isOpen: boolean;
  questionId: string;
  close: (question: any) => void;
}

function parseDelta(deltaString: string) {
  let delta;

  try {
    delta = JSON.parse(deltaString);
  } catch (err) {
    delta = null;
  }

  return (new Delta(delta == null ? [] : delta) as unknown) as QuillDelta;
}

function constructEdit(
  question: any,
  edit: {
    header: null | string;
    body: null | string;
  }
) {
  const editedQuestion = JSON.parse(JSON.stringify(question));

  if (edit.header != null) {
    editedQuestion.header = edit.header;
  } else {
    editedQuestion.header = question.header.delta;
  }

  if (edit.body != null) {
    editedQuestion.header = edit.body;
  } else {
    editedQuestion.body = question.body.delta;
  }

  editedQuestion.body = question.body.delta;

  editedQuestion.answers = editedQuestion.answers.map((a: any) => ({
    id: a.id,
    correct: a.correct,
    text: a.text.delta
  }));

  return editedQuestion;
}

export const EditQuestion: React.FC<EditQuestionProps> = ({
  isOpen,
  questionId,
  close
}) => {
  const [question, setQuestion] = useState();

  const [editedHeader, setEditedHeader] = useState(null as null | string);
  const [editedBody, setEditedBody] = useState(null as null | string);
  const [editedAnswers, setEditedAnswers] = useState([] as any[]);

  function edit() {
    const edits = {
      header: editedHeader,
      body: editedBody,
      answers: editedAnswers
    };
    close(constructEdit(question, edits));
  }

  function addAnswer() {
    setEditedAnswers([
      ...editedAnswers,
      { id: ++question.answerId, text: { delta: "[]" } }
    ]);
  }

  function deleteAnswer(id: string) {
    const removedIndex = editedAnswers.findIndex(a => a.id === id);
    if (removedIndex !== -1) {
      editedAnswers.splice(removedIndex, 1);
      setEditedAnswers([...editedAnswers]);
    }
  }

  function doReorder(event: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log("Dragged from index", event.detail.from, "to", event.detail.to);

    const index = event.detail.to;
    const [removed] = editedAnswers.splice(event.detail.from, 1);
    setEditedAnswers([
      ...editedAnswers.slice(0, index),
      removed,
      ...editedAnswers.slice(index)
    ]);

    event.detail.complete();
  }

  useEffect(() => {
    if (questionId) {
      api.get(`/quiz/web-client/question/${questionId}/edit`).then(res => {
        setQuestion(res.data);
        setEditedAnswers([...res.data.answers]);
      });
    }
  }, [questionId]);

  let content;

  if (!question) {
    content = <div> Loading... </div>;
  } else {
    content = (
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonList>
                <IonItem>
                  <IonLabel>Header</IonLabel>
                  <ReactQuill
                    defaultValue={parseDelta(question.header.delta)}
                    onChange={(html, delta, source, editor) => {
                      const content = JSON.stringify(editor.getContents());

                      setEditedHeader(content);
                    }}
                  />
                </IonItem>
                <IonLabel>Body</IonLabel>
                <ReactQuill
                  defaultValue={parseDelta(question.body.delta)}
                  onChange={(html, delta, source, editor) => {
                    const content = JSON.stringify(editor.getContents());

                    setEditedBody(content);
                  }}
                />
              </IonList>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonLabel>Answers</IonLabel>
              <IonButton onClick={() => addAnswer()}>Add Answer</IonButton>
              <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
                {editedAnswers.map((answer: any) => {
                  return (
                    <IonItem key={answer.id}>
                      <IonButton
                        slot="end"
                        onClick={() => deleteAnswer(answer.id)}
                        color="danger"
                      >
                        <IonIcon icon={trash}></IonIcon>
                      </IonButton>
                      <IonReorder slot="end" />

                      <IonGrid className="admin-text-container">
                        <IonRow>
                          <IonCol justify-content-start={true}>
                            <ReactQuill
                              theme="" // Use '' (base) theme.
                              className="admin-text-input"
                              defaultValue={parseDelta(answer.text.delta)}
                              onChange={(html, delta, source, editor) => {
                                const value = editedAnswers.find(
                                  a => a.id === answer.id
                                );
                                value.text.delta = JSON.stringify(
                                  editor.getContents()
                                );

                                setEditedAnswers([...editedAnswers]);
                              }}
                            />
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol justify-content-start={true}>
                            <IonItem lines="none">
                              <IonCheckbox
                                onIonChange={event => {
                                  const value = editedAnswers.find(
                                    a => a.id === answer.id
                                  );
                                  value.correct = event.detail.checked;

                                  setEditedAnswers([...editedAnswers]);
                                }}
                                checked={answer.correct}
                                slot="start"
                              ></IonCheckbox>
                              <IonLabel>Correct</IonLabel>
                            </IonItem>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonItem>
                  );
                })}
              </IonReorderGroup>
            </IonCol>{" "}
          </IonRow>
        </IonGrid>
        <IonButton onClick={() => edit()}>Close Modal</IonButton>
      </IonContent>
    );
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={() => edit()}>
      {content}
    </IonModal>
  );
};

export default EditQuestion;
