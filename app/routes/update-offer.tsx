export default function UpdateOffer() {
  return (
    <>
      <h1 className="title mb-6 text-center">Edit Item</h1>
      <div className="m-auto w-[600px] max-w-full rounded-2xl border border-gray-200 p-14 shadow-lg">
        <form className="" method="POST">
          <div className="mb-6">
            <input type="file" id="avatar" name="avatar" className="sr-only" />
            <label
              htmlFor="avatar"
              className="flex w-fit cursor-pointer items-center rounded-4xl border border-gray-600 px-4 py-2"
            >
              <span>Upload Image</span>
            </label>
          </div>

          <div className="mb-10 flex flex-col gap-10">
            <div className="flex flex-col gap-1">
              <label htmlFor="ticket-name">Title</label>
              <input
                type="text"
                name="ticket-name"
                id="ticket-name"
                className="rounded border border-gray-200 p-2"
                value="Lorem ipsum dolor"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="comment-field">Description</label>
              <textarea
                name="comment"
                id="comment-field"
                cols={30}
                rows={8}
                maxLength={400}
                minLength={50}
                className="rounded border border-gray-200 p-2"
                value="Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut sint optio sequi corporis ipsa, tempora ducimus consectetur fugiat necessitatibus ullam, voluptatum incidunt itaque expedita, assumenda ipsum deserunt perspiciatis blanditiis labore!"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="price-field">Price</label>
              <input
                type="number"
                name="price"
                id="price-field"
                className="rounded border border-gray-200 p-2"
                min={1}
                value={1000}
                required
              />
            </div>

            <select
              name="category"
              id="category-field"
              className="border-b border-gray-200 py-2"
              value={1}
            >
              <option value={''}>Select category</option>
              <option value={1}>Books</option>
              <option value={2}>Clothing</option>
            </select>
          </div>
          <button className="button-base" type="submit">
            Update
          </button>
        </form>
      </div>
    </>
  );
}
