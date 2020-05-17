import { IonRowCol } from "./IonRowCol";
import React, { useCallback } from "react";
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

interface MultiEditProps {
  value: any[];
  onChange: (answers: any[]) => void;
  onDelete: (answerId: string) => void;
}

export const MultiEdit: React.FC<MultiEditProps> = ({ value, onChange: $onChange, onDelete }) => {
  const onChange = useCallback(
    (answers: any[]) => {
      $onChange([
        ...answers.map((a: any) => ({
          ...a
        }))
      ]);
    },
    [$onChange]
  );

  function doReorder(event: CustomEvent<ItemReorderEventDetail>) {
    const index = event.detail.to;

    const copy = value.slice();
    const [removed] = copy.splice(event.detail.from, 1);

    onChange([...copy.slice(0, index), removed, ...copy.slice(index)]);

    event.detail.complete();
  }

  return (
    <IonRowCol>
      <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
        {value.map((answer: any) => {
          return (
            <IonItem key={answer.id}>
              <IonButton slot="end" onClick={() => onDelete(answer.id)} color="danger">
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
                      onChange={(_html, _delta, _source, editor) => {
                        const v = value.find(a => a.id === answer.id);
                        v.text.delta = editor.getContents();

                        onChange([...value]);
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
