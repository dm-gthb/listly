export function CreateComment() {
  return (
    <form className="" method="POST">
      <div className="mb-10 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="comment-field">Your comment</label>
          <textarea
            name="comment"
            id="comment-field"
            cols={30}
            rows={2}
            maxLength={400}
            minLength={50}
            className="rounded border border-gray-200 p-2"
          />
        </div>

        <button className="button-base" type="submit">
          Publish
        </button>
      </div>
    </form>
  );
}
