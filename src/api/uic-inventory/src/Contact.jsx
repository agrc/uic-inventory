import * as yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import TextInput from './components/FormElements/TextInput';
import GridHeading from './components/FormElements/GridHeading';
import Chrome from './components/PageElements/Chrome';

const schema = yup.object().shape({
  message: yup.string().max(512).required().label('Message'),
});

export function Contact() {
  const { formState, handleSubmit, register } = useForm({
    resolver: yupResolver(schema),
  });

  return (
    <main>
      <Chrome>
        <form onSubmit={handleSubmit((data) => console.log(data))}>
          <div>
            <div className="md:grid md:grid-cols-3 md:gap-6">
              <GridHeading text="Contact the UIC Program" subtext="Provide a clear and concise message for the staff" />
              <div className="mt-5 md:mt-0 md:col-span-2">
                <div className="overflow-hidden shadow sm:rounded-md">
                  <div className="px-4 py-5 bg-white sm:p-6">
                    <div className="grid grid-cols-6 gap-6">
                      <div className="col-span-6 sm:col-span-3">
                        <TextInput id="message" register={register} errors={formState.errors} />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                    <button type="submit" disabled={!formState.isDirty}>
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Chrome>
    </main>
  );
}

export default Contact;
