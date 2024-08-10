"use client";

import { useState, useEffect } from "react";
const notes =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

function SomeNote({ content, handleEdit }) {
  return (
    <section>
      <h2>Notes: </h2>
      <p>{content}</p>
      <button onClick={handleEdit}>Edit 📝</button>
    </section>
  );
}

function NoNote({ handleEdit }) {
  return (
    <section>
      <button onClick={handleEdit}>Add Note 📝</button>
    </section>
  );
}

function AddNote({ handleSaveNote, content }) {
  function handleClickSave(formData: FormData) {
    const newContent = formData.get("newContent");
    handleSaveNote(newContent);
  }

  return (
    <section>
      <form action={handleClickSave}>
        <fieldset>
          <legend>Add Note</legend>
          <textarea rows="8" name="newContent">
            {content}
          </textarea>
          <input type="submit" value="Save 💾" />
        </fieldset>
      </form>
    </section>
  );
}

export default function Notes({ characterID }) {
  "use client";
  const [content, setContent] = useState(null);
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(characterID);
    if (savedValue) {
      setContent(savedValue);
    }
  }, [characterID]);

  useEffect(() => {
    if (content !== null) {
      window.localStorage.setItem(characterID, content);
    }
  }, [characterID, content]);

  function onSaveNote(newNote: string) {
    setEdit(false);
    setContent(newNote);
  }
  function onEdit(newNote: string) {
    setEdit(true);
  }
  if (edit) {
    return <AddNote handleSaveNote={onSaveNote} content={content} />;
  } else {
    return content ? (
      <SomeNote content={content} handleEdit={onEdit} />
    ) : (
      <NoNote handleEdit={onEdit} />
    );
  }
}
