import { IonRowCol } from "./IonRowCol";
import React, { useState, useEffect } from "react";
import {
  IonReorderGroup,
  IonItem,
  IonButton,
  IonIcon,
  IonReorder,
  IonGrid,
  IonRow,
  IonCol
} from "@ionic/react";
import { trash } from "ionicons/icons";
import ReactQuill from "react-quill";
import { ItemReorderEventDetail } from "@ionic/core";
import Delta from "quill-delta";
import { Delta as QuillDelta } from "quill";

interface MultiEditProps {
  question: any;
  onEdit: (answers: any[]) => void;
  onDelete: (answerId: string) => void;
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

export const MultiEdit: React.FC<MultiEditProps> = ({
  question,
  onEdit,
  onDelete
}) => {
  const [editedAnswers, setEditedAnswers] = useState([] as any[]);

  useEffect(() => {
    setEditedAnswers([
      ...question.answers.map((a: any) => ({
        ...a,
        text: {
          delta: parseDelta(a.text.delta)
        }
      }))
    ]);
  }, [question]);

  useEffect(() => {
    onEdit([
      ...editedAnswers.map((a: any) => ({
        ...a,
        text: JSON.stringify(a.text.delta)
      }))
    ]);
  }, [editedAnswers]);

  function doReorder(event: CustomEvent<ItemReorderEventDetail>) {
    const index = event.detail.to;

    const [removed] = editedAnswers.splice(event.detail.from, 1);

    setEditedAnswers([
      ...editedAnswers.slice(0, index),
      removed,
      ...editedAnswers.slice(index)
    ]);

    event.detail.complete();
  }

  return (
    <IonRowCol>
      <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
        {editedAnswers.map((answer: any) => {
          console.log(editedAnswers);
          return (
            <IonItem key={answer.id}>
              <IonButton
                slot="end"
                onClick={() => onDelete(answer.id)}
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
              </IonGrid>
            </IonItem>
          );
        })}
      </IonReorderGroup>
    </IonRowCol>
  );
};
