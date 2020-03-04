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
  questionId: string | null;
  close: (id?: string, question?: any) => void;
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
    answers: any[];
  }
) {
  const editedQuestion = JSON.parse(JSON.stringify(question));

  editedQuestion.header = edit.header;

  editedQuestion.body = edit.body;

  editedQuestion.answers = edit.answers.map((a: any) => ({
    id: a.id,
    correct: a.correct,
    text: a.text
  }));

  console.log("edited: ", editedQuestion);

  return editedQuestion;
}

export const EditQuestion: React.FC<EditQuestionProps> = ({
  isOpen,
  questionId,
  close
}) => {
  const [question, setQuestion] = useState();

  const [editedHeader, setEditedHeader] = useState(null as null | QuillDelta);
  const [editedBody, setEditedBody] = useState(null as null | QuillDelta);
  const [editedAnswers, setEditedAnswers] = useState([] as any[]);

  function edit(questionId?: string) {
    if (questionId != null) {
      const edits = {
        header: JSON.stringify(editedHeader),
        body: JSON.stringify(editedBody),
        answers: editedAnswers.map(a => ({
          ...a,
          text: JSON.stringify(a.text.delta)
        }))
      };

      close(questionId, constructEdit(question, edits));
    } else {
      close();
    }
  }

  function addAnswer() {
    const answerId = question.answerId + 1;
    setQuestion({ ...question, answerId });

    editedAnswers.push({
      id: answerId,
      correct: false,
      text: { delta: parseDelta("[]") }
    });
    setEditedAnswers([...editedAnswers]);
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
    console.log("Loading question: ", questionId);
    if (questionId) {
      api.get(`/quiz/web-client/question/${questionId}/edit`).then(res => {
        setQuestion(res.data);
        setEditedAnswers([
          ...res.data.answers.map((a: any) => ({
            ...a,
            text: { delta: parseDelta(a.text.delta) }
          }))
        ]);
        setEditedBody(parseDelta(res.data.body.delta));
        setEditedHeader(parseDelta(res.data.header.delta));
      });
    }
  }, [questionId]);

  let content;

  if (!question || !questionId || !editedHeader || !editedBody) {
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
                    value={editedHeader}
                    onChange={(html, delta, source, editor) => {
                      setEditedHeader(editor.getContents());
                    }}
                  />
                </IonItem>
                <IonLabel>Body</IonLabel>
                <ReactQuill
                  value={editedBody}
                  onChange={(html, delta, source, editor) => {
                    setEditedBody(editor.getContents());
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
                  console.log(editedAnswers);
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
                              value={answer.text.delta}
                              onChange={(html, delta, source, editor) => {
                                const value = editedAnswers.find(
                                  a => a.id === answer.id
                                );
                                value.text.delta = editor.getContents();

                                setEditedAnswers([...editedAnswers]);
                              }}
                            />
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol justify-content-start={true}>
                            <IonItem lines="none">
                              <IonCheckbox slot="start"></IonCheckbox>
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
        <IonButton onClick={() => edit(questionId)}>Save</IonButton>
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
