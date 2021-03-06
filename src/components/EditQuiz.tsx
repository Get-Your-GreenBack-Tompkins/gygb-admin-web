import {
  IonIcon,
  IonButton,
  IonButtons,
  IonItem,
  IonLabel,
  IonCardContent,
  IonCard,
  IonCardHeader,
  IonItemDivider,
  IonItemGroup,
  IonProgressBar,
  IonLoading,
  IonList
} from "@ionic/react";
import React, { Component } from "react";
import { create, trash } from "ionicons/icons";

import { ApiContext } from "../api";

import EditQuestion from "./EditQuestion";
import { Quiz, Question } from "../types/quiz";
import { AxiosInstance } from "axios";
import ErrorContent from "./ErrorContent";

export class EditQuiz extends Component<
  {},
  {
    isOpen: boolean;
    quiz: Quiz | null;
    questionId: string | null;
    editedQuestions: Question[];
    loadingQuestions: boolean;
    loadingError: boolean;
  }
> {
  static contextType = ApiContext;

  context!: AxiosInstance;

  close() {
    this.setState({ isOpen: false, questionId: null });
    
    this.getQuestions();
  }

  editQuestion(question: any) {
    this.setState({ questionId: question.id, isOpen: true });
  }

  addQuestion() {
    this.context.put(`quiz/web-client/question/`).then(() => this.getQuestions());
  }

  deleteQuestion(question: any) {
    // Offer a quick sanity check for deletion.
    alert(`Are you sure you can to delete this question?`);
    this.context.delete(`quiz/web-client/question/${question.id}`).then(() => this.getQuestions());
  }

  getQuestions() {
    this.setState({
      loadingQuestions: true,
      loadingError: false
    });

    return this.context
      .get(`quiz/web-client/edit`)
      .then(res => {
        this.setState({
          quiz: res.data,
          editedQuestions: [...res.data.questions],
          loadingQuestions: false
        });
      })
      .catch(err => {
        this.setState({
          loadingError: true,
          loadingQuestions: false
        });
        console.log(err);
      });
  }

  constructor(props: any) {
    super(props);

    this.state = {
      isOpen: false,
      quiz: null as Quiz | null,
      questionId: null as string | null,
      editedQuestions: [] as Question[],
      loadingQuestions: false,
      loadingError: false
    };
  }

  componentDidMount() {
    if (!this.state.quiz) {
      this.getQuestions();
    }
  }

  render() {
    const { state } = this;

    if (state.loadingError) {
      return <ErrorContent name="Questions" reload={this.getQuestions} />;
    }

    if (!state.quiz) {
      return <IonLoading isOpen={true} message={"Loading Quiz Data..."} duration={0} />;
    }

    return (
      <div className="edit-container">
        {state.loadingQuestions ? (
          <IonProgressBar type="indeterminate" reversed={true}></IonProgressBar>
        ) : null}
        <IonList></IonList>
        <IonCard>
          <IonCardHeader>
            <IonLabel>{state.quiz.name}</IonLabel>
          </IonCardHeader>
          <IonCardContent>
            {state.editedQuestions.map((q: any, i: number) => (
              <IonItemGroup key={q.id}>
                <IonItemDivider>
                  <IonLabel>{`Question ${i + 1}`}</IonLabel>
                </IonItemDivider>
                <IonItem lines="none">
                  <IonLabel>
                    <div dangerouslySetInnerHTML={{ __html: q.header }}></div>
                  </IonLabel>

                  <IonButtons slot="end">
                    <IonButton onClick={() => this.editQuestion(q)} fill="clear">
                      <IonIcon icon={create}></IonIcon>
                    </IonButton>
                    <IonButton onClick={() => this.deleteQuestion(q)} color="danger">
                      <IonIcon icon={trash}></IonIcon>
                    </IonButton>
                  </IonButtons>
                </IonItem>
              </IonItemGroup>
            ))}
            <EditQuestion questionId={state.questionId} isOpen={state.isOpen} close={() => this.close()} />
          </IonCardContent>
        </IonCard>
      </div>
    );
  }
}

export default EditQuiz;
