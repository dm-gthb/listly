import { Link } from 'react-router';
import { appRoute } from '~/routes';

export function EditListingCard() {
  return (
    <div className="overflow-hidden rounded-lg bg-gray-50 shadow">
      <Link
        to={`${appRoute.updateListing}/1`}
        className="block transition-opacity hover:opacity-90"
      >
        <div className="aspect-square">
          <img
            className="block h-full w-full object-cover"
            src="https://placehold.co/1200x800"
            alt={`name`}
          />
        </div>
        <div className="flex flex-col gap-1 px-2 py-3">
          <h3 className="text-sm">Lorem ipsum dolor</h3>
          <span className="font-bold">1000$</span>
          <span className="text-sm">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ut sint optio sequi
            corporis ipsa, tempora ducimus consectetur fugiat necessitatibus ullam,
            voluptatum incidunt itaque expedita, assumenda ipsum deserunt perspiciatis
            blanditiis labore!
          </span>
        </div>
      </Link>
      <Link
        to={`${appRoute.updateListing}/1`}
        className="block w-full cursor-pointer bg-gray-600 p-2 text-center font-bold text-white transition-opacity hover:opacity-80"
      >
        Edit
      </Link>
      <button
        onClick={() => console.log('delete')}
        className="w-full cursor-pointer bg-red-600 p-2 font-bold text-white transition-opacity hover:opacity-80"
      >
        Delete
      </button>
    </div>
  );
}
