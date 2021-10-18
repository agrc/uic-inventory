import { toast } from 'react-toastify';
import * as yup from 'yup';

const errorSchema = yup.object().shape({
  errors: yup.array().of(
    yup.object().shape({
      message: yup.string().required(),
    })
  ),
});

const onRequestError = async (error, defaultMessage = 'Something went terribly wrong that we did not expect.') => {
  // TODO: log error
  console.error(error);
  let toastMessage = defaultMessage;
  let response = { message: undefined };

  try {
    response = await error.response.json();
  } catch (ex) {
    console.error(ex);
  }

  if (errorSchema.isValidSync(response)) {
    toastMessage = response.errors.map((x) => x.message).join('\n');
  }

  return toast.error(toastMessage);
};

export default onRequestError;
