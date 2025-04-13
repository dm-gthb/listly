export function Comment() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 overflow-hidden rounded-full">
          <img src="https://placehold.co/300X300" alt="user picture" />
        </div>
        <span>Name Surname</span>
      </div>

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum ex cum voluptatum
        fuga officia in cumque molestias vero, deleniti enim aliquam, minima porro placeat
        sed atque debitis voluptatem ducimus impedit?
      </p>
      <button type="button" className="w-fit cursor-pointer">
        x delete
      </button>
    </div>
  );
}
