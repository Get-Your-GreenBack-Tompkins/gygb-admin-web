import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  IonModal,
  IonButton,
  IonContent,
  IonLabel,
  IonItem,
  IonGrid,
  IonList,
  IonInput,
  IonSpinner,
  IonAlert,
  IonText,
  IonRow,
  IonCol
} from "@ionic/react";
import { Delta as QuillDelta } from "quill";
import ReactQuill from "react-quill";

import { ApiContext } from "../api";
import { parseDelta } from "../util";

import { IonRowCol } from "./IonRowCol";
import { MultiEdit } from "./MultiEdit";
import { MultiScore } from "./MultiScore";

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
    message: a.message,
    text: a.text
  }));

  return editedQuestion;
}

interface EditQuestionProps {
  isOpen: boolean;
  questionId: string | null;
  close: () => void;
}

export enum Page {
  EditQuestion = 0,
  EditScore = 1
}

export const EditQuestion: React.FC<EditQuestionProps> = ({ isOpen, questionId, close }) => {
  const [question, setQuestion] = useState(null as null | any);

  const [editedHeader, setEditedHeader] = useState(null as null | string);
  const [editedBody, setEditedBody] = useState(null as null | QuillDelta);

  const [saving, setSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null as null | Function);

  const [answers, setAnswers] = useState([] as any[]);

  const [page, setPage] = useState(0);

  const api = useContext(ApiContext);

  function saveQuestion(questionId: string) {
    setSaving(true);
    const edits = {
      header: editedHeader,
      body: JSON.stringify(editedBody),
      answers: answers.map((a: any) => ({
        ...a,
        text: JSON.stringify(a.text.delta)
      }))
    };

    const editedQuestion = constructEdit(question, edits);

    const data = JSON.parse(JSON.stringify(editedQuestion));

    return api
      .post(`quiz/web-client/question/${questionId}/edit`, data)
      .then(() => {
        return getQuestion();
      })
      .then(() => {
        setSaving(false);
      });
  }

  function edit(questionId?: string) {
    if (questionId != null) {
      saveQuestion(questionId).then(() => {
        setAnswers([]);
        close();
      });
    } else {
      setAnswers([]);
      close();
    }
  }

  const getQuestion = useCallback(() => {
    return api.get(`/quiz/web-client/question/${questionId}/edit`).then(res => {
      setQuestion(res.data);
      setAnswers(
        [...res.data.answers].map((a: any) => ({
          ...a,
          text: {
            ...a.text,
            delta: parseDelta(a.text.delta)
          }
        }))
      );
      setEditedBody(parseDelta(res.data.body.delta));
      setEditedHeader(res.data.header);
    });
  }, [api, questionId]);

  function saveFailed() {
    return new Promise((reject, resolve) => {
      setSaveAlert(resolve);
    });
  }

  function loadFailed() {
    console.log("Fail!");
  }

  function addAnswer() {
    if (questionId) {
      setSaving(true);

      saveQuestion(questionId)
        .then(() => api.put(`/quiz/web-client/question/${questionId}/answer/`))
        .catch(() => saveFailed())
        .then(() => getQuestion())
        .catch(() => loadFailed())
        .finally(() => setSaving(false));
    }
  }

  function deleteAnswer(id: string) {
    const removedIndex = answers.findIndex((a: any) => a.id === id);

    setSaving(true);

    if (removedIndex !== -1) {
      answers.splice(removedIndex, 1);

      setAnswers([...answers]);
    }

    if (questionId) {
      saveQuestion(questionId)
        .then(() => api.delete(`/quiz/web-client/question/${questionId}/answer/${id}`))
        .then(() => getQuestion())
        .catch(() => getQuestion())
        .finally(() => setSaving(false));
    } else {
      setSaving(false);
    }
  }

  useEffect(() => {
    setPage(Page.EditQuestion);
  }, [question, isOpen]);

  useEffect(() => {
    if (questionId) {
      getQuestion();
    } else {
      setAnswers([]);
    }
  }, [questionId, getQuestion]);

  let content;

  if (saving || !question || !questionId || editedHeader == null || editedBody == null) {
    content = (
      <IonContent>
        <IonGrid
          style={{
            height: "100%",
            width: "100%"
          }}
        >
          <IonRow
            style={{
              height: "100%"
            }}
            className="ion-justify-content-center"
          >
            <IonCol size="auto" className="ion-align-self-center ion-text-center">
              <IonText>
                <h3>{saving ? "Saving Question Content..." : "Loading Question Content..."}</h3>
              </IonText>
              <IonSpinner style={{ margin: "auto" }}></IonSpinner>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    );
  } else {
    content = (
      <IonContent>
        <IonGrid
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            position: "fixed",
            zIndex: 999,
            backgroundColor: "white",
            boxShadow: "rgba(0,0,0,0.2) 0px -2px 2px",
            padding: 0
          }}
          slot="fixed"
        >
          <IonRow>
            {page > 0 ? (
              <IonCol>
                <IonButton onClick={() => setPage(page - 1)}>Previous</IonButton>
              </IonCol>
            ) : (
              <></>
            )}
            {page === Page.EditQuestion ? (
              <IonCol size="auto">
                <IonButton onClick={() => addAnswer()}>Add Answer</IonButton>
              </IonCol>
            ) : (
              <></>
            )}
            {page < Page.EditScore ? (
              <IonCol size="auto">
                <IonButton
                  onClick={() => {
                    const id = questionId;

                    saveQuestion(id).then(() => {
                      setPage(page + 1);
                    });
                  }}
                >
                  Next
                </IonButton>
              </IonCol>
            ) : (
              <IonCol size="auto">
                <IonButton
                  onClick={() => {
                    const id = questionId;

                    edit(id);
                  }}
                >
                  Save Question
                </IonButton>
              </IonCol>
            )}
          </IonRow>
        </IonGrid>
        <IonGrid class="edit-question-grid">
          <IonRow>
            <IonCol>
              {page === Page.EditQuestion ? (
                <>
                  <IonAlert
                    isOpen={saveAlert !== null}
                    onDidDismiss={() => {
                      if (saveAlert) {
                        saveAlert();
                      }

                      setSaveAlert(null);
                    }}
                    header={"Error"}
                    message={"Failed to save, some progress lost."}
                    buttons={["Okay"]}
                  />
                  <IonGrid class="slide-spacer">
                    <IonRowCol>
                      {saving ? (
                        <IonItem>
                          <IonSpinner></IonSpinner>
                          <IonLabel>Saving...</IonLabel>
                        </IonItem>
                      ) : null}

                      <IonList>
                        <IonItem>
                          <IonInput
                            value={editedHeader}
                            onIonChange={e => {
                              const { value } = e.detail;

                              setEditedHeader(value || "");
                            }}
                          />
                        </IonItem>

                        <IonItem lines="none">
                          <IonLabel>Content</IonLabel>
                        </IonItem>

                        <IonItem lines="none">
                          <ReactQuill
                            style={{ width: "100%" }}
                            value={editedBody}
                            onChange={(_html, _delta, _source, editor) => {
                              setEditedBody(editor.getContents());
                            }}
                          />
                        </IonItem>
                      </IonList>
                    </IonRowCol>

                    <IonRowCol>
                      <IonItem lines="none">
                        <IonLabel>Answers</IonLabel>
                      </IonItem>
                      <MultiEdit
                        onChange={setAnswers}
                        value={answers}
                        onDelete={(answerId: string) => deleteAnswer(answerId)}
                      ></MultiEdit>
                    </IonRowCol>
                  </IonGrid>
                </>
              ) : page === Page.EditScore ? (
                <>
                  <IonGrid>
                    <IonRowCol>
                      <IonList>
                        <IonItem>
                          <IonLabel>
                            <h1>{question.header}</h1>
                          </IonLabel>
                        </IonItem>
                        <IonItem lines="none">
                          <IonText>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: question.body.sanitized
                              }}
                            ></div>
                          </IonText>
                        </IonItem>
                      </IonList>
                    </IonRowCol>
                    <IonRow>
                      <IonCol>
                        <MultiScore onChange={setAnswers} value={answers}></MultiScore>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </>
              ) : (
                <>
                  <IonGrid>
                    <IonRow>
                      <IonCol>
                        <p>An unknown error occured.</p>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
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
