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
  IonText,
  IonListHeader,
  IonIcon,
} from "@ionic/react";
import React, { useState, useContext, useEffect, useCallback } from "react";
import firebase from "firebase/app";

import { ApiContext } from "../api";
import ErrorContent from "./ErrorContent";
import { create, download, trophy } from "ionicons/icons";

export const EditRaffle: React.FC<{}> = () => {
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [isRaffle, setIsRaffle] = useState(true);
  const [allRaffles, setAllRaffles] = useState([] as any[]);
  const [openModal, setOpenModal] = useState(false);
  const [prize, setPrize] = useState(null as string | null);
  const [questionRequirement, setQuestionRequirement] = useState(null as string | null);
  const [editMode, setEditMode] = useState(true);

  const api = useContext(ApiContext);

  const getAllRaffles = useCallback(() => {
    api.get(`quiz/web-client/raffle/list`).then((res) => {
      setAllRaffles(res.data.raffles);
    });
  }, [api]);

  function drawWinner() {
    api
      .get(`quiz/web-client/raffle/winner`)
      .then((_) => {
        return getAllRaffles();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function downloadRaffle(id: string) {
    setLoadingInfo(true);
    const callable = firebase.functions().httpsCallable("raffle");
    callable({
      id,
    })
      .then((result) => {
        const url = result.data;

        window.open(url);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoadingInfo(false);
      });
  }

  function editRaffle() {
    setLoadingInfo(true);

    if (!questionRequirement || !prize) {
      alert("Not all values provided!");
      return;
    }

    const parsed = Number.parseFloat(questionRequirement);
    if (parsed === Number.NaN || parsed > 1) {
      alert("Question Count is not a percentage! (e.g. 0.5, 0.75)");
      setLoadingInfo(false);
      return;
    }

    const edit = {
      requirement: parsed,
      prize,
    };

    api
      .post(`quiz/web-client/raffle/edit`, edit)
      .then(() => {
        setLoadingInfo(false);
        setIsRaffle(true);
      })
      .catch((err) => {
        alert(
          "Unable to save, consider copying your content into a separate document and reloading the page."
        );
        setLoadingInfo(false);
        console.log(err);
      })
      .finally(() => {
        setOpenModal(false);
      });
  }

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
      prize,
    };

    api
      .put(`quiz/web-client/raffle/`, edit)
      .then(() => {
        setLoadingInfo(false);
        setIsRaffle(true);
      })
      .catch((err) => {
        alert(
          "Unable to save, consider copying your content into a separate document and reloading the page."
        );
        setLoadingInfo(false);
        console.log(err);
      })
      .finally(() => {
        setOpenModal(false);
      });
  }

  useEffect(() => {
    getAllRaffles();
  }, [getAllRaffles]);

  const getInfo = useCallback(() => {
    setLoadingError(false);

    api
      .get(`quiz/web-client/raffle/edit`)
      .then((res) => {
        setQuestionRequirement(res.data.requirement);
        setPrize(res.data.prize);
        setIsRaffle(true);
        setLoadingInfo(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setIsRaffle(false);
        } else {
          setLoadingError(true);
        }

        setLoadingInfo(false);
        console.log(err);
      });
  }, [api]);

  useEffect(() => {
    setLoadingInfo(true);

    getInfo();
  }, [getInfo, isRaffle]);

  if (loadingError) {
    return <ErrorContent name="Raffle" reload={getInfo} />;
  }

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
                      onIonChange={(a) => {
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
                      onIonChange={(a) => {
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
                <IonButton onClick={() => (editMode ? editRaffle() : newRaffle())}>
                  {editMode ? "Save Raffle" : "Create New Raffle"}
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonModal>
        {isRaffle ? (
          <>
            <IonListHeader>
              <IonLabel>
                <h2>Current Raffle</h2>
              </IonLabel>
              <IonButton
                size="small"
                fill="outline"
                onClick={() => {
                  setEditMode(true);
                  setOpenModal(true);
                }}
              >
                <IonIcon slot="start" icon={create}></IonIcon>
                Edit Current Raffle
              </IonButton>
            </IonListHeader>
            <IonList>
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
                  <IonButton
                    onClick={() => {
                      setEditMode(false);
                      setOpenModal(true);
                    }}
                  >
                    Create New Raffle
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </>
        )}
        <IonListHeader>
          <IonLabel>
            <h2>All Raffles</h2>
          </IonLabel>
        </IonListHeader>
        <IonList>
          {allRaffles.map((r, i) => {
            console.log(r);
            return (
              <div key={i}>
                <IonItem>
                  <IonLabel>
                    <b>
                      {new Date(r.month).toLocaleDateString(undefined, {
                        month: "long",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </b>
                  </IonLabel>

                  {r.winner ? (
                    <IonLabel>
                      <b>Winner:</b> {r.winner.firstName} {r.winner.lastName} ({r.winner.email})
                    </IonLabel>
                  ) : (
                    <></>
                  )}

                  <IonButton
                    onClick={() => {
                      drawWinner();
                    }}
                  >
                    <IonIcon slot="start" icon={trophy}></IonIcon>
                    Draw Winner
                  </IonButton>
                  <IonButton
                    onClick={() => {
                      downloadRaffle(r.id);
                    }}
                  >
                    <IonIcon slot="start" icon={download}></IonIcon>
                    Download
                  </IonButton>
                </IonItem>
              </div>
            );
          })}
        </IonList>
      </IonContent>
    </>
  );
};

export default EditRaffle;
