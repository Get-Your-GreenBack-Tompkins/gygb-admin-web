import { IonRowCol } from "./IonRowCol";
import React, { useEffect, useState } from "react";
import { IonItem, IonGrid, IonCheckbox, IonText, IonLabel, IonInput } from "@ionic/react";
import { parseDelta } from "../util";

interface MultiScoreProps {
  question: any;
  onEdit: (answers: any[]) => void;
}

export const MultiScore: React.FC<MultiScoreProps> = ({ question, onEdit }) => {
  const [answers, setAnswers] = useState([] as any[]);

  useEffect(() => {
    setAnswers([
      ...question.answers.map((a: any) => ({
        ...a,
        text: {
          delta: parseDelta(a.text.delta),
          sanitized: a.text.sanitized
        }
      }))
    ]);
  }, [question]);

  useEffect(() => {
    onEdit([
      ...answers.map((a: any) => ({
        ...a,
        text: JSON.stringify(a.text.delta)
      }))
    ]);
  }, [onEdit, answers]);

  return (
    <IonGrid>
      <IonRowCol>
        {answers.map((answer: any) => {
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
                    const value = answers.find(a => a.id === answer.id);
                    value.correct = event.detail.checked;

                    setAnswers([...answers]);
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
                    const value = answers.find(a => a.id === answer.id);
                    value.message = event.detail.value;

                    setAnswers([...answers]);
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
