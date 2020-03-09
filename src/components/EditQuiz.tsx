import {
  IonIcon,
  IonButton,
  IonButtons,
  IonReorder,
  IonReorderGroup,
  IonItem,
  IonLabel,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonItemDivider,
  IonItemGroup,
  IonProgressBar,
  IonLoading
} from "@ionic/react";
import { ItemReorderEventDetail } from "@ionic/core";
import React, { Component } from "react";
import { create, trash } from "ionicons/icons";

import { ApiContext } from "../api";

import EditQuestion from "./EditQuestion";
import { Quiz, Question } from "../types/quiz";
import { AxiosInstance } from "axios";

export class EditQuiz extends Component<
  {},
  {
    isOpen: boolean;
    quiz: Quiz | null;
    questionId: string | null;
    editedQuestions: Question[];
    loadingQuestions: boolean;
  }
> {
  static contextType = ApiContext;

  context!: AxiosInstance;

  doReorder(event: CustomEvent<ItemReorderEventDetail>) {
    const { state } = this;

    const index = event.detail.to;
    const [removed] = state.editedQuestions.splice(event.detail.from, 1);

    this.setState({
      editedQuestions: [
        ...state.editedQuestions.slice(0, index),
        removed,
        ...state.editedQuestions.slice(index)
      ]
    });

    event.detail.complete();
  }

  save(id: string, question: any) {
    const data = JSON.parse(JSON.stringify(question));

    return this.context
      .post(`quiz/web-client/question/${id}/edit`, data)
      .then(() => this.getQuestions());
  }

  close(id?: string, question?: any) {
    this.setState({ isOpen: false });

    this.setState({ questionId: null });

    if (id && question) {
      this.setState({ loadingQuestions: true });

      this.save(id, question);
    }
  }

  editQuestion(question: any) {
    this.setState({ questionId: question.id, isOpen: true });
  }

  addQuestion() {
    this.context
      .put(`quiz/web-client/question/`)
      .then(() => this.getQuestions());
  }

  deleteQuestion(question: any) {
    this.context
      .delete(`quiz/web-client/question/${question.id}`)
      .then(() => this.getQuestions());
  }

  getQuestions() {
    this.setState({
      loadingQuestions: true
    });

    return this.context
      .get(`quiz/web-client`)
      .then(res => {
        this.setState({
          quiz: res.data,
          editedQuestions: [...res.data.questions],
          loadingQuestions: false
        });
      })
      .catch(err => console.log(err));
  }

  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false,
      quiz: null as Quiz | null,
      questionId: null as string | null,
      editedQuestions: [] as Question[],
      loadingQuestions: false
    };
  }

  componentDidMount() {
    if (!this.state.quiz) {
      this.getQuestions();
    }
  }

  render() {
    const { state } = this;

    if (!state.quiz) {
      return (
        <IonLoading
          isOpen={true}
          message={"Loading Quiz Data..."}
          duration={0}
        />
      );
    }

    return (
      <div className="edit-container">
        {state.loadingQuestions ? (
          <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar>
        ) : null}

        <IonCard>
          <IonCardHeader>
            <IonLabel>{state.quiz.name}</IonLabel>
          </IonCardHeader>
          <IonCardContent>
            <IonReorderGroup disabled={false} onIonItemReorder={this.doReorder}>
              {state.editedQuestions.map((q: any, i: number) => (
                <IonItemGroup key={q.id}>
                  <IonItemDivider>
                    <IonLabel>{`Question ${i + 1}`}</IonLabel>
                  </IonItemDivider>
                  <IonItem lines="none">
                    <IonReorder slot="start" />
                    <IonLabel>
                      <div dangerouslySetInnerHTML={{ __html: q.header }}></div>
                    </IonLabel>

                    <IonButtons slot="end">
                      <IonButton
                        onClick={() => this.editQuestion(q)}
                        fill="clear"
                      >
                        <IonIcon icon={create}></IonIcon>
                      </IonButton>
                      <IonButton
                        onClick={() => this.deleteQuestion(q)}
                        color="danger"
                      >
                        <IonIcon icon={trash}></IonIcon>
                      </IonButton>
                    </IonButtons>
                  </IonItem>
                </IonItemGroup>
              ))}
              <EditQuestion
                questionId={state.questionId}
                isOpen={state.isOpen}
                close={(id, question) => this.close(id, question)}
                save={(id, question) => this.save(id, question)}
              />
            </IonReorderGroup>
          </IonCardContent>
        </IonCard>
      </div>
    );
  }
}

export default EditQuiz;
