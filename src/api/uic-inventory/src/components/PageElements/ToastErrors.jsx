import { toast } from 'react-toastify';
import * as yup from 'yup';

const errorSchema = yup
  .object()
  .shape({
    errors: yup
      .array()
      .of(
        yup
          .object()
          .shape({
            message: yup.string().required(),
          })
          .required(),
      )
      .min(1)
      .required(),
  })
  .required();

const onRequestError = async (
  error,
  defaultMessage = 'Something went terribly wrong that we did not expect.',
  showToast = true,
) => {
  let toastMessage = defaultMessage;
  let response = { message: undefined };

  if (error.response.status === 404) {
    if (showToast) {
      return toast.error('This item does not exist.');
    } else {
      return 'This item does not exist.';
    }
  }

  try {
    response = await error.response.json();
  } catch (ex) {
    console.error(ex);
  }

  if (errorSchema.isValidSync(response)) {
    toastMessage = response.errors.map((x) => x.message).join('\n');
  }

  if (showToast) {
    return toast.error(toastMessage);
  } else {
    return response.errors;
  }
};

export default onRequestError;
