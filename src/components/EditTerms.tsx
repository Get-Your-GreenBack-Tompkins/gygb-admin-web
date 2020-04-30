import {
  IonProgressBar,
  IonLoading,
  IonContent,
  IonRow,
  IonCol,
  IonGrid,
  IonLabel,
  IonButton
} from "@ionic/react";
import React, { useState, useContext, useEffect, useCallback } from "react";

import { Delta as QuillDelta } from "quill";
import ReactQuill from "react-quill";

import { ApiContext } from "../api";
import { parseDelta } from "../util";

import { ToS } from "../types/tos";
import ErrorContent from "./ErrorContent";

export const EditTerms: React.FC<{}> = () => {
  const [loadingError, setLoadingError] = useState(false);
  const [loadingToS, setLoadingToS] = useState(false);
  const [tos, setToS] = useState(null as ToS | null);
  const [editedHotshot, setEditedHotshot] = useState(null as QuillDelta | null);
  const [editedQuiz, setEditedQuiz] = useState(null as QuillDelta | null);

  const api = useContext(ApiContext);

  function save() {
    setLoadingToS(true);

    const updates = [];

    if (editedQuiz) {
      updates.push(
        api.post(`tos/quiz/edit`, {
          platform: "quiz",
          version: "1.0",
          text: JSON.stringify(editedQuiz)
        })
      );
    }

    if (editedHotshot) {
      updates.push(
        api.post(`tos/hotshot/edit`, {
          platform: "hotshot",
          version: "1.0",
          text: JSON.stringify(editedHotshot)
        })
      );
    }

    Promise.all(updates)
      .then(() => {
        setLoadingToS(false);
      })
      .catch(err => {
        alert(
          "Unable to save, consider copying your content into a separate document and reloading the page."
        );
        setLoadingToS(false);
        console.log(err);
      });
  }

  const getToS = useCallback(() => {
    setLoadingError(false);

    api
      .get(`tos/edit`)
      .then(res => {
        setToS(res.data);
        setEditedHotshot(parseDelta(res.data.hotshot));
        setEditedQuiz(parseDelta(res.data.quiz));
        setLoadingToS(false);
      })
      .catch(err => {
        setLoadingError(true);
        console.log(err);
      });
  }, [api]);

  useEffect(() => {
    setLoadingToS(true);

    getToS();
  }, [getToS]);

  if (loadingError) {
    return <ErrorContent name="Terms & Conditions" reload={getToS} />;
  }

  if (!tos || !editedQuiz || !editedHotshot) {
    return <IonLoading isOpen={true} message={"Loading Terms of Service..."} duration={0} />;
  }

  return (
    <>
      {loadingToS ? <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar> : null}
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel>Web Quiz Terms of Service</IonLabel>
              <ReactQuill
                style={{ width: "100%" }}
                value={editedQuiz}
                onChange={(_html, _delta, _source, editor) => {
                  setEditedQuiz(editor.getContents());
                }}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonLabel>iOS (HotShot) Terms of Service</IonLabel>
              <ReactQuill
                style={{ width: "100%" }}
                value={editedHotshot}
                onChange={(_html, _delta, _source, editor) => {
                  setEditedHotshot(editor.getContents());
                }}
              />
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

export default EditTerms;
