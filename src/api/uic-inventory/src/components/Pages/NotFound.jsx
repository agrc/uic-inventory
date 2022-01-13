import { SearchIcon } from '@heroicons/react/outline';
import { Chrome, Link } from '../PageElements';

export default function NotFound() {
  return (
    <main>
      <Chrome>
        <section className="flex flex-col items-center py-6 text-5xl font-black text-gray-800">
          <h1 className="block mb-6">How did you get here?</h1>
          <SearchIcon className="block w-24 h-24" />
        </section>
        <section className="mx-auto max-w-prose">
          <p>
            This page does not exist as a part of the UIC inventory submission process. If normal usage has brought you
            here, please click the{' '}
            <Link meta="primary" to="contact">
              Contact us
            </Link>{' '}
            link and let us know what happened. Otherwise, please go back to the main page and navigate to your item of
            interest.
          </p>
          <p className="mt-4 text-lg text-center">
            <Link type="button" meta="default" to="/">
              Sites
            </Link>
          </p>
          <p className="mt-4">Thank you,</p>
          <p className="mt-4">The UIC Staff</p>
        </section>
      </Chrome>
    </main>
  );
}
