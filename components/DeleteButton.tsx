"use client";

import { useRef } from "react";

export default function DeleteButton({
  action,
  id,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  label: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleClick() {
    if (confirm(`Delete "${label}"?`)) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={id} />
      <button
        type="button"
        onClick={handleClick}
        className="text-red-400 hover:text-red-600 transition"
      >
        Delete
      </button>
    </form>
  );
}
