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

  console.log(edit);

  editedQuestion.answers = edit.answers.map((a: any) => ({
    id: a.id,
    correct: a.correct,
    message: a.message,
    text: a.text
  }));

  console.log(JSON.stringify(editedQuestion, null, 4));

  return editedQuestion;
}

interface EditQuestionProps {
  isOpen: boolean;
  questionId: string | null;
  close: (id?: string, question?: any) => void;
  save: (id: string, question: any) => Promise<void>;
}

export enum Page {
  EditQuestion = 0,
  EditScore = 1
}

export const EditQuestion: React.FC<EditQuestionProps> = ({ isOpen, questionId, close, save }) => {
  const [question, setQuestion] = useState();

  const [editedHeader, setEditedHeader] = useState(null as null | string);
  const [editedBody, setEditedBody] = useState(null as null | QuillDelta);

  const [saving, setSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null as null | Function);

  const [answers, setAnswers] = useState([] as any[]);

  const [page, setPage] = useState(0);

  const api = useContext(ApiContext);

  function edit(questionId?: string) {
    if (questionId != null) {
      const edits = {
        header: editedHeader,
        body: JSON.stringify(editedBody),
        answers
      };

      close(questionId, constructEdit(question, edits));
    } else {
      close();
    }
  }

  function saveQuestion(questionId: string) {
    const edits = {
      header: editedHeader,
      body: JSON.stringify(editedBody),
      answers
    };

    return save(questionId, constructEdit(question, edits));
  }

  const getQuestion = useCallback(() => {
    return api.get(`/quiz/web-client/question/${questionId}/edit`).then(res => {
      setQuestion(res.data);

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
    saveQuestion(id)
      .then(() => api.delete(`/quiz/web-client/question/${questionId}/answer/${id}`))
      .then(() => getQuestion())
      .catch(() => getQuestion())
      .finally(() => setSaving(false));
  }

  useEffect(() => {
    setPage(Page.EditQuestion);
  }, [question, isOpen]);

  useEffect(() => {
    if (questionId) {
      getQuestion();
    }
  }, [questionId, getQuestion]);

  let content;

  if (!question || !questionId || editedHeader == null || editedBody == null) {
    content = <IonSpinner></IonSpinner>;
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

                    saveQuestion(id);

                    setPage(page + 1);
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
        <IonGrid>
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
                        question={question}
                        onEdit={setAnswers}
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
                        <MultiScore
                          onEdit={setAnswers}
                          question={question}
                        ></MultiScore>
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
