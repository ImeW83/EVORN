import { startTransition, type FormEvent } from "react";

// React clears a form after its action runs, which wipes what the person typed when the server sends back an error.
// Use as the form's onSubmit, keeping action={...} for submits before the page has loaded, to submit without clearing.
export function keepValues(dispatch: (f: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(f));
  };
}
