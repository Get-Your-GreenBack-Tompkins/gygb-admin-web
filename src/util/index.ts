import Delta from "quill-delta";
import { Delta as QuillDelta } from "quill";

export function parseDelta(deltaString: string) {
  let delta;

  try {
    delta = JSON.parse(deltaString);
  } catch (err) {
    console.log(err);
    delta = null;
  }

  return (new Delta(delta == null ? [] : delta) as unknown) as QuillDelta;
}
