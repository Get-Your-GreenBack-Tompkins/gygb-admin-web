import {
  IonButton,
  IonItem,
  IonProgressBar,
  IonLoading,
  IonList,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonModal,
  IonLabel,
  IonText
} from "@ionic/react";
import React, { useState, useContext, useEffect, useCallback } from "react";

import { ApiContext } from "../api";

export const EditRaffle: React.FC<{}> = () => {
  const [loadingInfo, setLoadingInfo] = useState(false);

  const [isRaffle, setIsRaffle] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [prize, setPrize] = useState(null as string | null);
  const [questionRequirement, setQuestionRequirement] = useState(null as string | null);

  const api = useContext(ApiContext);

  function newRaffle() {
    setLoadingInfo(true);

    if (!questionRequirement || !prize) {
      alert("Not all values provided!");
      return;
    }

    const parsed = Number.parseFloat(questionRequirement);
    if (parsed === Number.NaN) {
      alert("Question Count is not a percentage!");
      setLoadingInfo(false);
      return;
    }

    const edit = {
      questionRequirement: parsed,
      prize
    };

    api
      .put(`quiz/web-client/raffle`, edit)
      .then(() => {
        setLoadingInfo(false);
        setIsRaffle(true);
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
    api
      .get(`quiz/web-client/raffle`)
      .then(res => {
        setQuestionRequirement(res.data.questionRequirement);
        setPrize(res.data.prize);
        setIsRaffle(true);
        setLoadingInfo(false);
      })
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setIsRaffle(false);
        }
        setLoadingInfo(false);
        console.log(err);
      });
  }, [api]);

  useEffect(() => {
    setLoadingInfo(true);

    getInfo();
  }, [getInfo, isRaffle]);

  if (isRaffle && (prize == null || questionRequirement == null)) {
    return <IonLoading isOpen={true} message={"Loading Raffle Info..."} duration={0} />;
  }

  return (
    <>
      {loadingInfo ? <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar> : null}
      <IonContent>
        <IonModal isOpen={openModal}>
          <IonGrid style={{ margin: 0 }}>
            <IonRow>
              <IonCol>
                <IonList>
                  <IonItem>
                    <IonLabel position="floating">Question Requirement (Percentage)</IonLabel>
                    <IonInput
                      type="number"
                      value={questionRequirement}
                      onIonChange={a => {
                        const content = a.detail.value || null;

                        if (content) {
                          setQuestionRequirement(content);
                        }
                      }}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="floating">Prize</IonLabel>
                    <IonInput
                      value={prize}
                      onIonChange={a => {
                        const content = a.detail.value || null;

                        if (content) {
                          setPrize(content);
                        }
                      }}
                    />
                  </IonItem>
                </IonList>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol>
                <IonButton onClick={() => newRaffle()}>Create New Raffle</IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonModal>
        {isRaffle ? (
          <>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h2>Current Raffle</h2>
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <b>Prize</b>
                </IonLabel>

                {prize}
              </IonItem>
              <IonItem>
                <IonLabel>
                  <b>Question Requirement</b>
                </IonLabel>

                {questionRequirement}
              </IonItem>
            </IonList>
          </>
        ) : (
          <>
            <IonGrid>
              <IonRow>
                <IonCol>
                  <IonText>
                    No Raffle Is Currently Running. Click below to start a new raffle for this month.
                  </IonText>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonButton onClick={() => setOpenModal(true)}>Create New Raffle</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </>
        )}
      </IonContent>
    </>
  );
};

export default EditRaffle;
