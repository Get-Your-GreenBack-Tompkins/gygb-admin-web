import {
  IonButton,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonLoading,
  IonList,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput
} from "@ionic/react";
import React, { useState, useContext, useEffect, useCallback } from "react";

import { Delta as QuillDelta } from "quill";
import ReactQuill from "react-quill";

import { ApiContext } from "../api";
import { parseDelta } from "../util";
import ErrorContent from "./ErrorContent";

export const EditQuizInfo: React.FC<{}> = () => {
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [tutorial, setTutorial] = useState(null as QuillDelta | null);
  const [tutorialHeader, setTutorialHeader] = useState(null as string | null);
  const [questionCount, setQuestionCount] = useState(null as string | null);
  const [name, setName] = useState(null as string | null);

  const api = useContext(ApiContext);

  function save() {
    setLoadingInfo(true);

    if (!questionCount || !tutorial || !tutorialHeader || !name) {
      alert("Not all values provided!");
      return;
    }

    const parsed = Number.parseInt(questionCount);
    if (parsed === Number.NaN) {
      alert("Question Count is not a number!");
      setLoadingInfo(false);
      return;
    }

    const edit = {
      questionCount: parsed,
      name: name,
      tutorial: {
        header: tutorialHeader,
        body: JSON.stringify(tutorial)
      }
    };

    api
      .post(`quiz/web-client/edit`, edit)
      .then(() => {
        setLoadingInfo(false);
      })
      .catch(err => {
        alert(
          "Unable to save, consider copying your content into a separate document and reloading the page."
        );
        setLoadingInfo(false);
        console.log(err);
      });
  }

  const getInfo = useCallback(() => {
    setLoadingError(false);

    api
      .get(`quiz/web-client/edit`)
      .then(res => {
        setQuestionCount(res.data.questionCount);
        setTutorial(parseDelta(res.data.tutorial.body));
        setTutorialHeader(res.data.tutorial.header);
        setName(res.data.name);
        setLoadingInfo(false);
      })
      .catch(err => {
        setLoadingInfo(false);
        setLoadingError(true);
        console.log(err);
      });
  }, [api]);

  useEffect(() => {
    setLoadingInfo(true);

    getInfo();
  }, [getInfo]);

  if (loadingError) {
    return <ErrorContent name="Quiz Info" reload={getInfo} />;
  }

  if (!tutorial || tutorialHeader == null || name == null || questionCount == null) {
    return <IonLoading isOpen={true} message={"Loading Quiz Info..."} duration={0} />;
  }

  return (
    <>
      {loadingInfo ? <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar> : null}
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonList>
                <IonItem>
                  <IonLabel>Name</IonLabel>
                  <IonInput
                    value={name}
                    onIonChange={a => {
                      const content = a.detail.value || null;

                      if (content) {
                        setName(content);
                      }
                    }}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Question Count</IonLabel>
                  <IonInput
                    type="number"
                    value={questionCount}
                    onIonChange={a => {
                      const content = a.detail.value || null;

                      if (content) {
                        setQuestionCount(content);
                      }
                    }}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Tutorial Header</IonLabel>
                  <IonInput
                    value={tutorialHeader}
                    onIonChange={a => {
                      const content = a.detail.value || null;

                      if (content) {
                        setTutorialHeader(content);
                      }
                    }}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Tutorial Body</IonLabel>
                  <ReactQuill
                    style={{ width: "100%" }}
                    value={tutorial}
                    onChange={(_html, _delta, _source, editor) => {
                      setTutorial(editor.getContents());
                    }}
                  />
                </IonItem>
              </IonList>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton onClick={() => save()}>Save</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </>
  );
};

export default EditQuizInfo;
