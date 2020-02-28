import React, { useState, useEffect } from 'react';
import { IonModal, IonButton, IonContent } from '@ionic/react';
import Delta from 'quill-delta';
import { Delta as QuillDelta } from 'quill';
import ReactQuill from 'react-quill';
import axios from 'axios';

interface EditQuestionProps {
  isOpen: boolean;
  questionId: string;
  close: (question: any) => void;
}
const url = "http://localhost:5150";

function parseDelta(deltaString: string) {
  console.log(deltaString);
  return new Delta(JSON.parse(deltaString)) as unknown as QuillDelta;
}

function constructEdit(question: any, edit: { header: null | string, answers: { [key: string]: string } }) {
  const editedQuestion = JSON.parse(JSON.stringify(question));

  editedQuestion.answers = editedQuestion.answers.map((a: any) => {
    if (edit.answers[a.id] != null) {
      return { ...a, text: edit.answers[a.id] };
    } else {
      return { ...a, text: a.text.delta };
    }
  });

  if (edit.header != null) {
    editedQuestion.header = edit.header;
  } else {
    editedQuestion.header = question.header.delta;
  }

  editedQuestion.body = question.body.delta;

  console.log(editedQuestion);
  return editedQuestion;
}

// hello: {{baseUrl}}/v1/quiz/:quizId/question/:questionId/edit

export const EditQuestion: React.FC<EditQuestionProps> = ({ isOpen, questionId, close }) => {
  const [question, setQuestion] = useState();

  const [editedHeader, setEditedHeader] = useState(null as null | string);
  const [editedAnswers, setEditedAnswers] = useState({} as { [key: string]: string });

  function edit() {
    const edits = { header: editedHeader, answers: editedAnswers };
    close(constructEdit(question, edits));
  }

  useEffect(() => {
    if (questionId) {
      axios.get(`${url}/v1/quiz/web-client/question/${questionId}/edit`)
        .then(res => {
          setQuestion(res.data);
        });
    }
  }, [questionId]);

  let content;

  if (!question) {
    content = <div> Loading... </div>
  } else {

    content = (
      <IonContent>
        <ReactQuill defaultValue={parseDelta(question.header.delta)}
          onChange={(html, delta, source, editor) => {
            const content = JSON.stringify(editor.getContents());
            console.log(content) // works fine
            setEditedHeader(content); // breaks
          }} />
        DIVISION
        {
          question.answers.map((answer: any) => (
            <ReactQuill key={answer.id} value={parseDelta(answer.text.delta)}
              onChange={(html, delta, source, editor) => {
                setEditedAnswers({ ...editedAnswers, [answer.id]: JSON.stringify(editor.getContents()) })
              }} />
          ))
        }
        <IonButton onClick={() => edit()}>Close Modal</IonButton>
      </IonContent>);
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={() => edit()}>
      {content}
    </IonModal>
  );

};

export default EditQuestion;