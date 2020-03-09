export interface Answer {
  id: string;
}

export interface Question {
  answers: Answer[];
}

export interface Quiz {
  name: string;
  questions: Question[];
}
