import { Chrome } from '../PageElements';

export function Component() {
  return (
    <main className="text-lg">
      <Chrome title="Utah UIC Class V Injection Well Inventory">
        <div className="space-y-6">
          <p>
            Owners or operators of all Class V injection wells, existing and new, must submit inventory information
            according to Section{' '}
            <a href="https://adminrules.utah.gov/public/rule/R317-7/Current%20Rules" data-style="link" rel="nofollow">
              R317-7- 6.4(C)
            </a>{' '}
            of the Utah Administrative Rules for the Underground Injection Control Program. This web application is
            designed to collect the following inventory information to fulfill the requirements of this rule section:
            site information (i.e., name, location, and ownership); site contact/signatory information (i.e., name,
            email, phone number, organization, and address), and injection well information (i.e., location, type,
            details, and operating status). Inventory information collected through this application is used to assess
            authorization-by-rule status and coordinate UIC Program regulatory action with local government, state, or
            federal agencies having regulatory authority over the subject site. Inventory information must be submitted
            prior to injection for new wells. Failure to provide inventory information will prevent inventory submission
            and assessment of authorization-by-rule status. Information submitted through this application falls under
            the retention and disposition requirements of record series{' '}
            <a
              href="https://axaemarchives.utah.gov/cgi-bin/appxretcget.cgi?WEBINPUT_RUNWHAT=HTML_1SERIES&WEBINPUT_BIBLGRPC_RID=81505&A=B"
              data-style="link"
              rel="nofollow"
            >
              81505 – Underground Injection Control Program Files
            </a>
            .
          </p>
          <p>
            To submit, you must first create a Utahid account and provide UIC user profile information. Please visit{' '}
            <a data-style="link" href="/api/login">
              Utahid
            </a>{' '}
            to register with Utah ID and then return to this page to login and complete your profile. If you already
            have a Utah ID account you may login using the link above. Once you have an account you will be able to:
          </p>
          <ul className="ml-8 list-inside list-disc">
            <li>Submit Class V UIC inventory information forms</li>
            <li>Check inventory form status</li>
          </ul>
          <p className="font-bold">
            This submission does not relieve the applicant of any liability for ground water cleanup or any claim for
            resource damage if ground water contamination is traced to the injection wells shown on this form. Nor does
            authorization-by-rule under the UIC Program relieve the applicant, in any way, of obligations to comply with
            other applicable regulatory requirements, or to obtain other necessary applicable permits or authorizations
            from local or other agencies. The applicant may contact the local health department for compliance with
            local requirements.
          </p>
        </div>
      </Chrome>
    </main>
  );
}
