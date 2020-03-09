import React, { useState, useEffect, createRef } from "react";
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
  IonSelect,
  IonSelectOption,
  IonSlide,
  IonSlides,
  IonText,
  IonRow,
  IonCol
} from "@ionic/react";
import Delta from "quill-delta";
import { Delta as QuillDelta } from "quill";
import ReactQuill from "react-quill";

import api from "../api";
import { IonRowCol } from "./IonRowCol";
import { MultiEdit } from "./MultiEdit";
import { MultiScore } from "./MultiScore";
import { save } from "ionicons/icons";

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

  console.log(JSON.stringify(editedQuestion, null, 4));

  return editedQuestion;
}

interface EditQuestionProps {
  isOpen: boolean;
  questionId: string | null;
  close: (id?: string, question?: any) => void;
  save: (id: string, question: any) => Promise<void>;
}

export const EditQuestion: React.FC<EditQuestionProps> = ({
  isOpen,
  questionId,
  close,
  save
}) => {
  const [question, setQuestion] = useState();

  const [editedHeader, setEditedHeader] = useState(null as null | string);
  const [editedBody, setEditedBody] = useState(null as null | QuillDelta);

  const [saving, setSaving] = useState(false);
  const [saveAlert, setSaveAlert] = useState(null as null | Function);

  const [answers, setAnswers] = useState([] as any[]);

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

  function getQuestion() {
    return api.get(`/quiz/web-client/question/${questionId}/edit`).then(res => {
      setQuestion(res.data);

      setEditedBody(parseDelta(res.data.body.delta));
      setEditedHeader(res.data.header);
    });
  }

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
      .then(() =>
        api.delete(`/quiz/web-client/question/${questionId}/answer/${id}`)
      )
      .then(() => getQuestion())
      .catch(() => getQuestion())
      .finally(() => setSaving(false));
  }

  useEffect(() => {
    if (questionId) {
      getQuestion();
    }
  }, [questionId]);

  let content;

  const slider = createRef<HTMLIonSlidesElement>();
  const scoringSlide = createRef<HTMLIonSlideElement>();

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
            <IonCol>
              <IonButton
                onClick={() => slider.current && slider.current.slideTo(0)}
              >
                Previous
              </IonButton>
            </IonCol>
            <IonCol size="3">
              <IonButton onClick={() => addAnswer()}>Add Answer</IonButton>
            </IonCol>
            <IonCol size="2">
              <IonButton
                onClick={() => {
                  const id = questionId;

                  saveQuestion(id);

                  slider.current && slider.current.slideTo(1);
                }}
              >
                Next
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonSlides ref={slider} pager={true}>
                <IonSlide>
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
                          <IonLabel>Type</IonLabel>
                          <IonSelect>
                            <IonSelectOption>Multiple Choice</IonSelectOption>
                          </IonSelect>
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
                        onEdit={(answers: any[]) => setAnswers(answers)}
                        onDelete={(answerId: string) => deleteAnswer(answerId)}
                      ></MultiEdit>
                    </IonRowCol>
                  </IonGrid>
                </IonSlide>

                <IonSlide ref={scoringSlide}>
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
                          onEdit={(answers: any[]) => setAnswers(answers)}
                          question={question}
                        ></MultiScore>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonSlide>
              </IonSlides>
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
