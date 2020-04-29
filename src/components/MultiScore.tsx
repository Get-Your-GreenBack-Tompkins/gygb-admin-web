import { IonRowCol } from "./IonRowCol";
import React, { useCallback } from "react";
import { IonItem, IonGrid, IonCheckbox, IonText, IonLabel, IonInput } from "@ionic/react";

interface MultiScoreProps {
  value: any[];
  onChange: (value: any[]) => void;
}

export const MultiScore: React.FC<MultiScoreProps> = ({ value, onChange: $onChange }) => {
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

  return (
    <IonGrid>
      <IonRowCol>
        {value.map((answer: any) => {
          return (
            <div key={answer.id}>
              <IonItem>
                <IonText>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: answer.text.sanitized
                    }}
                  ></div>
                </IonText>

                <IonCheckbox
                  onIonChange={event => {
                    const v = value.find(a => a.id === answer.id);
                    v.correct = event.detail.checked;

                    onChange([...value]);
                  }}
                  checked={answer.correct}
                  slot="start"
                ></IonCheckbox>
              </IonItem>
              <IonItem>
                <IonLabel>Reasoning</IonLabel>
                <IonInput
                  value={answer.message}
                  onIonChange={event => {
                    const v = value.find(a => a.id === answer.id);
                    v.message = event.detail.value;

                    onChange([...value]);
                  }}
                ></IonInput>
              </IonItem>
            </div>
          );
        })}
      </IonRowCol>
    </IonGrid>
  );
};
