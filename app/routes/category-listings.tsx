import { Pagination } from '~/components/pagination';
import type { Route } from './+types/category-listings';
import { db } from '~/utils/db.server';
import { invariantResponse } from '~/utils/misc';
import { eq } from 'drizzle-orm';
import { listings, listingToCategory } from 'drizzle/schema';
import { Form, Link, redirect, useSearchParams } from 'react-router';
import { appRoute } from '~/routes';
import type { Listing } from 'drizzle/types';
import { z } from 'zod';
import {
  getCollectionProps,
  getFormProps,
  getSelectProps,
  useForm,
} from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';

const LISTINGS_PER_PAGE = 8;

export async function loader({ params, request }: Route.LoaderArgs) {
  const searchParams = new URL(request.url).searchParams;
  const categoryId = params.categoryId;
  const category = await db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.id, +categoryId),
  });

  invariantResponse(category);

  const categoryAttributes = await db.query.categoryToAttribute.findMany({
    where: (categoryToAttribute, { eq }) =>
      eq(categoryToAttribute.categoryId, +categoryId),
    with: {
      attribute: {
        with: {
          values: true,
        },
      },
    },
  });

  const allListings = await db
    .select()
    .from(listings)
    .innerJoin(listingToCategory, eq(listings.id, listingToCategory.listingId))
    .where(eq(listingToCategory.categoryId, +categoryId));

  const condition = searchParams.get('condition');
  const filteredByCondition =
    condition && condition !== 'all'
      ? allListings.filter((row) => row.listings.condition === condition)
      : allListings;

  const filteredByAttributes = await Promise.all(
    filteredByCondition.map(async (row) => {
      const listingAttrs = await db.query.listingAttributes.findMany({
        where: (la, { eq }) => eq(la.listingId, row.listings.id),
      });

      const matchesAllAttributes = categoryAttributes.every(({ attribute }) => {
        const value = searchParams.get(`attr_${attribute.id}`);
        if (!value || value === '') return true;

        const listingAttr = listingAttrs.find((la) => la.attributeId === attribute.id);
        return listingAttr?.value === value;
      });

      return matchesAllAttributes ? row.listings : null;
    }),
  );

  const sortedListings = filteredByAttributes
    .filter((listing): listing is Listing => listing !== null)
    .sort((a, b) => {
      const sortBy = searchParams.get('sortBy') ?? 'createdAt';
      if (sortBy === 'price') {
        return a.sum - b.sum;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const page = Number(searchParams.get('page') ?? 1);
  const start = (page - 1) * LISTINGS_PER_PAGE;
  const end = start + LISTINGS_PER_PAGE;
  const paginatedListings = sortedListings.slice(start, end);

  return {
    count: sortedListings.length,
    listings: paginatedListings,
    categoryName: category.name,
    attributes: categoryAttributes.map(({ attribute }) => attribute),
  };
}

type Attribute = {
  id: number;
  name: string;
  inputType: string;
  unit: string | null;
  values: Array<{ id: number; attributeId: number; value: string }>;
};

function getFilterSchema(attributes: Attribute[]) {
  const baseSchema = z.object({
    condition: z.enum(['all', 'new', 'used']).optional(),
    sortBy: z.enum(['createdAt', 'price']).optional(),
  });

  if (!attributes.length) {
    return baseSchema;
  }

  const attributeSchema = z.object(
    Object.fromEntries(
      attributes.map((attr) => [
        `attr_${attr.id}`,
        z.enum(attr.values.map((v) => v.value) as [string, ...string[]]).optional(),
      ]),
    ),
  );

  return baseSchema.merge(attributeSchema);
}

export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const categoryId = params.categoryId;

  const attributes = await db.query.categoryToAttribute.findMany({
    where: (categoryToAttribute, { eq }) =>
      eq(categoryToAttribute.categoryId, +categoryId),
    with: {
      attribute: {
        with: {
          values: true,
        },
      },
    },
  });

  const schema = getFilterSchema(attributes.map(({ attribute }) => attribute));
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { condition, sortBy, ...attrs } = submission.value;
  const searchParams = new URLSearchParams();

  if (condition) searchParams.set('condition', condition);
  if (sortBy) searchParams.set('sortBy', sortBy);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value && value !== '') {
      searchParams.set(key, value as string);
    }
  });

  return redirect(`?${searchParams.toString()}`);
}

export default function CategoryListings({ loaderData }: Route.ComponentProps) {
  const { count, categoryName, listings, attributes } = loaderData;
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page') ?? 1);
  const pagesCount = Math.ceil(count / LISTINGS_PER_PAGE);

  const [form, fields] = useForm({
    lastResult: null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: getFilterSchema(attributes) });
    },
    defaultValue: {
      condition: searchParams.get('condition') ?? 'all',
      sortBy: searchParams.get('sortBy') ?? 'createdAt',
      ...Object.fromEntries(
        attributes.map(({ id }) => [`attr_${id}`, searchParams.get(`attr_${id}`) ?? '']),
      ),
    },
  });

  return (
    <>
      <h1 className="title">{categoryName}</h1>
      <div className="flex grow-1 gap-8 lg:gap-6 xl:gap-8">
        <Form
          method="get"
          {...getFormProps(form)}
          className="flex w-[220px] shrink-0 flex-col lg:w-[300px]"
        >
          <div className="mb-2 rounded-lg bg-white p-4 py-4 shadow-md lg:p-7 lg:shadow-lg">
            <div className="mb-6 flex flex-col gap-1">
              <label className="font-bold" htmlFor={fields.sortBy.id}>
                Sort by
              </label>
              <select
                {...getSelectProps(fields.sortBy)}
                className="w-full rounded border border-gray-400 p-2"
                defaultValue={searchParams.get('sortBy') ?? 'createdAt'}
              >
                <option value="createdAt">Newest First</option>
                <option value="price">Price</option>
              </select>
            </div>

            <div className="mb-6">
              <p className="mb-1 font-bold">Condition</p>
              {getCollectionProps(fields.condition, {
                type: 'radio',
                options: ['all', 'new', 'used'],
              }).map(({ key, ...props }) => (
                <label key={key} htmlFor={props.id} className="flex items-center gap-2">
                  <input {...props} />
                  <span className="cursor-pointer capitalize">{props.value}</span>
                </label>
              ))}
            </div>

            <div>
              {attributes.map((attribute) => {
                const fieldName = `attr_${attribute.id}`;
                const { id, name, inputType, unit } = attribute;

                if (inputType === 'select') {
                  return (
                    <div key={id} className="mb-6 flex flex-col gap-1">
                      <label htmlFor={fields[fieldName].id} className="font-bold">
                        {name} {unit ? `(${unit})` : ''}
                      </label>
                      <select
                        {...getSelectProps(fields[fieldName])}
                        className="w-full rounded border border-gray-400 p-2"
                      >
                        <option value="">All</option>
                        {attribute.values.map(({ value }) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }
              })}
            </div>
          </div>
          <button
            className="button-base mt-4 bg-blue-600 text-white hover:bg-blue-700"
            type="submit"
          >
            Apply Filters
          </button>
        </Form>
        <div className="-mt-8 flex grow-1 flex-col gap-2">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8">
              <p className="mb-4 text-xl">No items found</p>
              <p className="text-gray-500">
                Try adjusting your filters to find what you're looking for
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <div className="flex justify-center p-8">
                {pagesCount > 1 && (
                  <Pagination allPagesCount={pagesCount} currentPage={currentPage} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ListingCard({ listing }: { listing: Listing }) {
  const { id, title, description, images, sum } = listing;
  return (
    <Link
      to={`${appRoute.listing}/${id}`}
      className="group mb-4 gap-4 border-b border-gray-200 p-3 transition-opacity hover:bg-gray-100 lg:mb-0 lg:flex lg:rounded-lg lg:border-none lg:p-8"
    >
      <div className="mb-2 w-[200px] shrink-0 overflow-hidden rounded-md lg:mb-0">
        <img
          className="block object-cover transition-opacity group-hover:opacity-90"
          src={images[0]}
          alt={`${title} image`}
        />
      </div>
      <div className="flex flex-col items-start justify-start lg:gap-1">
        <div className="mb-1 font-bold">
          <h3 className="m-0">{title}</h3>
          <span>${sum}</span>
        </div>
        <span className="text-sm">{description}</span>
      </div>
    </Link>
  );
}
