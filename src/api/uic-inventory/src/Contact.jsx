import * as yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import ErrorMessageTag from './components/FormElements/ErrorMessage';
import { ErrorMessage } from '@hookform/error-message';

const schema = yup.object().shape({
  message: yup.string().max(512).required().label('Message'),
});

export function Contact() {
  const { control, formState, handleSubmit, register } = useForm({
    resolver: yupResolver(schema)
  });

  return (
    <main>
      <div className="py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="p-4 border-4 border-gray-200 border-dashed rounded-lg h-72">
            <form onSubmit={handleSubmit((data) => console.log(data))}>
              <div>
                <div className="md:grid md:grid-cols-3 md:gap-6">
                  <div className="md:col-span-1">
                    <div className="px-4 sm:px-0">
                      <h3 className="text-2xl font-medium leading-6 text-gray-900">Contact the UIC Program</h3>
                      <p className="mt-1 text-sm text-gray-600">Provide a clear and concise message for the staff.</p>
                    </div>
                  </div>
                  <div className="mt-5 md:mt-0 md:col-span-2">
                    <div className="overflow-hidden shadow sm:rounded-md">
                      <div className="px-4 py-5 bg-white sm:p-6">
                        <div className="grid grid-cols-6 gap-6">
                          <div className="col-span-6 sm:col-span-3">
                            <label htmlFor="message" className="block font-medium text-gray-700">
                              Message
                              </label>
                            <input type="text" id="message" {...register("message")} />
                            <ErrorMessage errors={formState.errors} name="message" as={ErrorMessageTag} />
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                        <button
                          type="submit"
                          disabled={!formState.isDirty}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
