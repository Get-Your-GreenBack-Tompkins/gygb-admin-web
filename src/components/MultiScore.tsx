import { IonRowCol } from "./IonRowCol";
import React, { useEffect, useState } from "react";
import { IonItem, IonGrid, IonCheckbox, IonText } from "@ionic/react";

interface MultiScoreProps {
  question: any;
  onEdit: (answers: any[]) => void;
}

export const MultiScore: React.FC<MultiScoreProps> = ({ question }) => {
  const [answers, setAnswers] = useState([] as any[]);

  useEffect(() => {
    setAnswers([...question.answers]);
  }, [question]);

  return (
    <IonGrid>
      <IonRowCol>
        {answers.map((answer: any) => {
          console.log(answer);
          return (
            <IonItem key={answer.id}>
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
          );
        })}
      </IonRowCol>
    </IonGrid>
  );
};
