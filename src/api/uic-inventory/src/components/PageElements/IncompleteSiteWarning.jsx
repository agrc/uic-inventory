import { BackButton } from '../PageElements';

export function IncompleteSiteWarning() {
  return (
    <section>
      <h2 className="mb-6 text-xl font-semibold text-center">
        The site you are working on is incomplete. You must complete the site before adding wells.
      </h2>
      <h3 className="mb-2 text-lg font-medium">Site completeness includes</h3>
      <ul className="ml-8 list-decimal">
        <li>The site name, land ownership, and NAICS information must be entered and</li>
        <li>The site address and location must be entered and</li>
        <li>
          At least one of the contacts listed must be the owner, owner/operator, or legal representative of the site.
        </li>
      </ul>
      <div className="flex justify-center mt-6">
        <BackButton />
      </div>
    </section>
  );
}

export default IncompleteSiteWarning;
