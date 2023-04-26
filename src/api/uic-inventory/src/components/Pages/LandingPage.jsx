import { Chrome } from '../PageElements';

export function Component() {
  return (
    <main className="text-lg">
      <Chrome title="Utah UIC Class V Injection Well Inventory">
        <div className="space-y-6">
          <p>
            Owners or operators of all Class V injection wells, existing and new, must submit inventory information
            according to Section{' '}
            <a href="https://adminrules.utah.gov/public/rule/R317-7/Current%20Rules" data-meta="primary">
              R317-7- 6.4(C)
            </a>{' '}
            of the Utah Administrative Rules for the Underground Injection Control Program. Required information
            includes: facility name and location; name and address of legal contact; ownership of facility; nature and
            type of injection wells; and operating status of injection wells. This online web form is designed to assist
            owners or operators to comply with this requirement, to collect sufficient information regarding the
            injection activity such that authorization-by-rule status can be assessed, and to coordinate UIC Program
            regulatory action with other agencies having regulatory authority over the subject facility. Inventory
            information must be submitted prior to injection for new wells.
          </p>
          <p>
            To submit, you must first create a Utah ID account and provide UIC user profile information. Please visit{' '}
            <a data-meta="primary" href="/api/login">
              Utah ID
            </a>{' '}
            to register with Utah ID and then return to this page to login and complete your profile. If you already
            have a Utah ID account you may login using the link above. Once you have an account you will be able to:
          </p>
          <ul className="ml-8 list-inside list-disc">
            <li>Submit Class V UIC inventory information forms</li>
            <li>Check inventory form status</li>
            <li>Update well operating status</li>
            <li>Add new wells to existing facilities</li>
            <li>View previous authorizations</li>
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
